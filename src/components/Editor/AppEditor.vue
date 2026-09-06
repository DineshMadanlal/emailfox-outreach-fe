<template>
  <div class="full-width app-editor-container">
    <!-- Editable -->
    <froala
      v-if="isEditable && isEditorConfigSet"
      :tag="'div'"
      :id="`emailEditor${componentUid}`"
      :config="editorConfig"

      class="email-editor-content hide-scrollbar"
    />

    <!-- Attachments Display (Above Toolbar) -->
    <EditorAttachments
      v-if="attachments && attachments.length"
      :attachments="attachments"
      @deleteAttachmentByIndex="(index) => $emit('deleteAttachment', index)"
    />

    <!-- Read-only via iframe -->
    <iframe
      v-else-if="!isEditable && useIframeToLoadContent"
      ref="nonEditableEmailRef"
      :srcdoc="iframeSrcDoc"
      frameborder="0"
      scrolling="no"
      class="email-editor-content iframe-editor"
      @load="adjustIframeHeight"
    />

    <!-- Variable Menu -->
    <div
      class=""
      v-if="sequenceEditor || subjectEditor"
    >
      <div
        ref="menuAnchor"
        style="position: fixed; width: 1px; height: 1px; visibility: hidden; z-index: -1;"
      />

      <EditorMenuOptions
        :target="menuAnchor"

        v-model="showVariableMenu"

        @addSpintax="onAddSpintax"
        @insertVariable="insertVariable"
      />
    </div>

    <!-- Sequence Editor Toolbar -->
    <div
      v-if="sequenceEditor"
      class="sequence-editor-toolbar"
    >
      <!-- Add Variable -->
      <q-btn
        flat
        no-caps
        unelevated

        color="black"
        class="seq-toolbar-btn"

        @click="triggerVariableMenu"
      >
        <div class="toolbar-btn-content">
          <LocalSvgIcon
            image="variables"
            classes="toolbar-btn-icon"
          />
          <p>
            Variables
          </p>
        </div>
      </q-btn>

      <q-space />

      <!-- auto saving... -->
      <p
        class="auto-saving-text"

        v-if="showAutoSaving"
      >
        Auto-saving...
      </p>

      <!-- Preview -->
      <q-btn
        flat
        no-caps
        unelevated

        color="black"
        class="seq-toolbar-btn"

        @click="$emit('previewEmail')"
      >
        <div class="toolbar-btn-content">
          <LocalSvgIcon
            image="show"
            classes="toolbar-btn-icon"
          />
          <p>
            Preview
          </p>
        </div>
      </q-btn>
    </div>

    <!-- Personalisation Error Toolbar -->
    <div
      v-if="sequenceEditor && showPersonalisationError && false"
      class="personalisation-error-toolbar"
    >
      <p
        class="issue-found-text"
      >
        ⚠ {{ personalisationIssues.length }}
        {{ $pluralize('issue', personalisationIssues.length) }}
        found
      </p>
    </div>

    <!-- Loader -->
    <ApiLoader :show="isS3ApiLoading" />
  </div>
</template>

<script>

// lodash
import debounce from 'lodash/debounce';

// vue
import {
  defineComponent, reactive, onMounted, computed, getCurrentInstance, toRefs, onUnmounted, watch,
  nextTick,
} from 'vue';

// npm modules
import FroalaEditor from 'froala-editor';

// utils
import { postApiCall } from 'src/utils/apiRequests';
import { loadFroalaAssets } from 'src/utils/loadFroala';
import { cleanEditorHtmlForSave } from 'src/utils/helperFunctions';

import {
  highlightVariablesAndSpintax,
  bindTokenDelete,
  bindEditorCopy,
  bindPlainPasteShortcut,
  wrapVariable,
  wrapSpintax,
  bindSpintaxTabHandler,
  focusLatestSpintaxOption,
  removePreviousOpeningBrace,

  getCleanText,
  findTemplateIssues,
} from 'src/utils/froalaHelper';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import EditorMenuOptions from 'components/Menu/EditorMenuOptions.vue';
import EditorAttachments from 'components/Editor/EditorAttachments.vue';

// constants
import {
  MAX_FILE_SIZE_IN_MB,
  TOTAL_ATTACHMENTS_SIZE_RESTRICTION,
} from 'src/boot/constants';

export default defineComponent({
  name: 'EmailBodyEditor',

  emits: [
    'update:modelValue',
    'addNewAttachment',
    'deleteAttachment',
    'previewEmail',
  ],

  components: {
    ApiLoader,
    EditorMenuOptions,
    EditorAttachments,
  },

  props: {
    modelValue: {
      type: String,
      default: '',
    },
    isEditable: {
      /** editor disable or editable */
      type: Boolean,
      default: true,
    },
    placeholderText: {
      type: String,
      default: 'Type here...',
    },
    canUploadImage: {
      type: Boolean,
      default: true,
    },
    autofocusEditor: {
      type: Boolean,
      default: false,
    },
    /** sent from EmailReply.vue */
    emailStatsId: {
      type: String,
      default: '',
    },
    canUploadFile: {
      type: Boolean,
      default: false,
    },
    attachments: {
      /** Array of attachment objects { file_name, file_url, file_size, content_type } */
      type: Array,
      default: () => [],
    },
    totalAttachmentSize: {
      type: Number,
      default: 0,
    },
    useIframeToLoadContent: {
      type: Boolean,
      default: true,
    },
    addExtraHeightForIframe: {
      type: Number,
      default: 0,
    },
    hideToolbar: {
      /** If toolbar is not required however v-model is. */
      type: Boolean,
      default: false,
    },
    sequenceEditor: {
      /** special config for sequence editor */
      type: Boolean,
      default: false,
    },
    isSequenceEditor: {
      /** flag indicating sequence editor context */
      type: Boolean,
      default: false,
    },
    subjectEditor: {
      /** special config for sequence editor subject field */
      type: Boolean,
      default: false,
    },
    signatureEditor: {
      /** special config for signature editor */
      type: Boolean,
      default: false,
    },
    showAutoSaving: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    // app context
    const { appContext, uid } = getCurrentInstance();

    // state
    const state = reactive({
      editorInstance: null,
      editorConfig: {},
      isEditorConfigSet: false,
      isS3ApiLoading: false,
      nonEditableEmailRef: null,

      //
      menuAnchor: null,
      showVariableMenu: false,
    });

    // computed
    const editorModelValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    const componentUid = computed(() => uid);

    const personalisationIssues = computed(() => {
      const issues = findTemplateIssues(
        editorModelValue.value,
        [],
      );

      return issues;
    });

    const showPersonalisationError = computed(() => personalisationIssues.value?.length > 0);

    const emitValueDebounced = debounce((html) => {
      // Clean HTML token chips before emitting to v-model
      const cleanHtml = cleanEditorHtmlForSave(html);

      if (props.subjectEditor) {
        // return plain text
        emit('update:modelValue', getCleanText(cleanHtml));
      } else {
        emit('update:modelValue', cleanHtml);
      }
    }, 0);

    const applyHighlighting = () => {
      if (!state.editorInstance) return; // Don't highlight while cleaning/saving

      const html = state.editorInstance.html.get();
      const highlightedHtml = highlightVariablesAndSpintax(html);

      if (html !== highlightedHtml) {
        state.editorInstance.html.set(highlightedHtml);
        state.editorInstance.selection.restore();
        emitValueDebounced(highlightedHtml);
      }
    };

    const SYSTEM_FONTS = [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(', ');

    const iframeSrcDoc = computed(() => {
      const rawHtml = editorModelValue.value || '';
      if (!rawHtml) return '';

      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      background: transparent;
      font-family: ${SYSTEM_FONTS};
      font-size: 14px;
      line-height: 1.5;
      color: #1e293b;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      word-break: break-word;
      overflow-wrap: break-word;
      user-select: text;
      -webkit-user-select: text;
    }
    p {
      margin-top: 0;
      margin-bottom: 8px;
    }
    p:last-child {
      margin-bottom: 0;
    }
    a, a * {
      color: #2563eb;
      text-decoration: underline;
      pointer-events: none;
      cursor: default;
    }
    img {
      max-width: 100%;
      height: auto;
    }
    blockquote {
      margin: 8px 0;
      padding-left: 12px;
      border-left: 2px solid #cbd5e1;
      color: #64748b;
    }
    table {
      max-width: 100%;
    }
  </style>
</head>
<body>${rawHtml}</body>
</html>`;
    });

    const adjustIframeHeight = () => {
      if (!state.nonEditableEmailRef) return;
      const iframe = state.nonEditableEmailRef;

      try {
        const contentDocument = iframe.contentWindow?.document;
        if (!contentDocument || !contentDocument.body) return;

        // Force body and html margin/padding to 0 for exact measurement
        contentDocument.body.style.margin = '0';
        contentDocument.body.style.padding = '0';
        contentDocument.documentElement.style.margin = '0';
        contentDocument.documentElement.style.padding = '0';

        // Reset height before measuring to avoid stale accumulation
        iframe.style.height = '0px';

        // Calculate exact content height
        const bodyHeight = contentDocument.body.offsetHeight
          || contentDocument.body.scrollHeight
          || 0;
        const docHeight = contentDocument.documentElement.scrollHeight || 0;
        const scrollHeight = Math.max(bodyHeight, docHeight);
        const extra = props.addExtraHeightForIframe || 0;
        const calculatedHeight = Math.max(scrollHeight + extra, 20);

        iframe.style.height = `${calculatedHeight}px`;

        // Prevent click navigation on all links inside the iframe
        const links = contentDocument.getElementsByTagName('a');
        for (let i = 0; i < links.length; i += 1) {
          links[i].addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
          });
        }

        // Attach listener for images loading dynamically
        const images = contentDocument.getElementsByTagName('img');
        for (let i = 0; i < images.length; i += 1) {
          if (!images[i].complete) {
            images[i].addEventListener('load', () => {
              adjustIframeHeight();
            }, { once: true });
          }
        }
      } catch (err) {
        // Fallback for cross-origin or detached iframe
      }
    };

    const setEditorContent = (html) => {
      if (state.editorInstance) {
        state.editorInstance.html.set(html || '');
      }
    };

    // S3 Image Upload (Sequences)
    const getS3ObjectForImageUpload = async (file) => {
      state.isS3ApiLoading = true;

      try {
        const res = await postApiCall({
          includeWorkspace: true,
          endpoint: '/sequences/get-image-signed-url',
          payload: {
            filename: file.name,
            content_type: file.type,
          },
        });

        const requestUrl = res.request_url;

        const fileUrl = res.file_url;

        const xhr = new XMLHttpRequest();
        xhr.open('PUT', requestUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);

        xhr.onload = () => {
          state.isS3ApiLoading = false;
          state.editorInstance.image.insert(fileUrl);
        };

        xhr.onerror = () => {
          state.isS3ApiLoading = false;
          appContext.config.globalProperties.$toast({
            warning: true,
            message: 'Failed to upload image.',
          });
        };

        xhr.send(file);
      } catch (err) {
        state.isS3ApiLoading = false;
        appContext.config.globalProperties.$toast({
          warning: true,
          message: err.message || 'Failed to get image upload URL.',
        });
      }
    };

    // S3 File / Attachment Upload (Unibox)
    const getS3ObjectForFileUpload = async (file) => {
      state.isS3ApiLoading = true;

      try {
        const endpoint = (props.sequenceEditor || props.isSequenceEditor)
          ? '/sequences/get-image-signed-url'
          : '/unibox/get-attachment-signed-url';

        const res = await postApiCall({
          includeWorkspace: true,
          endpoint,
          payload: {
            filename: file.name,
            content_type: file.type,
          },
        });

        const requestUrl = res.request_url;

        const fileUrl = res.file_url;

        const xhr = new XMLHttpRequest();
        xhr.open('PUT', requestUrl, true);
        xhr.setRequestHeader('Content-Type', file.type);

        xhr.onload = () => {
          state.isS3ApiLoading = false;

          emit('addNewAttachment', {
            file_name: file.name,
            file_url: fileUrl,
            file_size: file.size,
            content_type: file.type,
          });

          // success toast
          appContext.config.globalProperties.$toast({
            message: 'Attachment uploaded successfully.',
          });
        };

        xhr.onerror = () => {
          state.isS3ApiLoading = false;
          appContext.config.globalProperties.$toast({
            warning: true,
            message: 'Failed to upload attachment.',
          });
        };

        xhr.send(file);
      } catch (err) {
        state.isS3ApiLoading = false;
        appContext.config.globalProperties.$toast({
          warning: true,
          message: err.message || 'Failed to get attachment upload URL.',
        });
      }
    };

    const initFroala = () => {
      // Dynamic toolbar buttons based on upload props
      const miscButtons = ['insertLink'];
      if (props.canUploadImage) {
        miscButtons.push('insertImage');
      }
      if (props.canUploadFile) {
        miscButtons.push('insertFile');
      }
      miscButtons.push('undo', 'redo', 'html');

      const config = {
        direction: 'ltr',
        entities: '',

        inlineMode: false,
        paragraphy: false,
        useClasses: false,

        // toolbar settings
        toolbarBottom: true,
        toolbarSticky: true,

        attribution: false,
        htmlUntouched: true,
        wordCounterCount: false,
        charCounterCount: false,

        quickInsertEnabled: false,

        key: process.env.EDITOR_KEY,

        autofocus: props.autofocusEditor,

        zIndex: null,

        enter: FroalaEditor.ENTER_DIV,
        placeholderText: props.placeholderText,

        toolbarButtons: {
          moreText: {
            buttons: [
              'bold', 'italic', 'underline', 'textColor',
              'fontFamily', 'fontSize',
              'align',
              'formatOL', 'formatUL',
              'outdent', 'indent',
            ],
            buttonsVisible: 3,
          },
          moreMisc: {
            buttons: miscButtons,
            buttonsVisible: miscButtons.length,
          },
        },

        linkList: [],
        linkInsertButtons: ['linkBack'],
        tableStyles: {
          'fr-no-borders': 'Hide Borders',
          'fr-dashed-borders': 'Dashed Borders',
          'fr-alternate-rows': 'Alternate Rows',
        },

        imageDefaultAlign: 'left',
        imageUploadRemoteUrls: false,
        imageInsertButtons: ['imageBack', '|', 'imageUpload', 'imageByURL'],
        imageEditButtons: [
          'imageReplace', 'imageAlign', 'imageCaption',
          'imageRemove', '|', 'imageLink', 'linkOpen',
          'linkEdit', 'linkRemove', '-', 'imageDisplay',
          'imageStyle', 'imageAlt', 'imageSize',
        ],

        /** advanced image editor */
        imageTUIOptions: {
          includeUI: {
            initMenu: 'filter',
            menuBarPosition: 'left',
            theme: {
              'menu.activeIcon.path':
                'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-b.svg',
              'menu.disabledIcon.path':
                'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-a.svg',
              'menu.hoverIcon.path':
                'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-c.svg',
              'menu.normalIcon.path':
                'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-d.svg',
              'submenu.activeIcon.name': 'icon-c',
              'submenu.activeIcon.path':
                'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-c.svg',
              'submenu.normalIcon.name': 'icon-d',
              'submenu.normalIcon.path':
                'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-d.svg',
            },
          },
        },

        events: {
          initialized() {
            state.editorInstance = this;

            // set initial content
            setEditorContent(props.modelValue);

            // only for sequence editor
            if (props.sequenceEditor || props.subjectEditor || props.signatureEditor) {
              /** for highlighting variables and spintaxes */
              setTimeout(() => {
                applyHighlighting();
              }, 0);

              // for deleting the whole token when backspace or delete is pressed
              bindTokenDelete(this);

              bindSpintaxTabHandler(this, () => {
                emitValueDebounced(this.html.get());
              });
            }

            bindEditorCopy(this);

            // for allowing plain text paste with ctrl/cmd + shift + v
            bindPlainPasteShortcut(this);

            if (props.hideToolbar) {
              this.toolbar.hide();
            }
          },

          keydown(e) {
            // Check for '{' key
            if (e.key === '{') {
              // Allow the '{' to be typed first
              setTimeout(() => {
                const rect = this.selection.get().getRangeAt(0).getBoundingClientRect();

                // Move hidden anchor to the cursor position
                state.menuAnchor.style.top = `${rect.bottom}px`;
                state.menuAnchor.style.left = `${rect.left}px`;

                state.showVariableMenu = true;
              }, 0);
            } else if (state.showVariableMenu) {
              const ignoreKeys = ['Shift', 'Control', 'Alt', 'Meta'];
              if (!ignoreKeys.includes(e.key)) {
                state.showVariableMenu = false;
              }
            }
          },

          contentChanged() {
            // Emit the updated HTML content whenever it changes
            emitValueDebounced(this.html.get());
          },

          blur() {
            if (props.sequenceEditor || props.subjectEditor || props.signatureEditor) {
              setTimeout(() => {
                applyHighlighting();
              }, 0);
            }
          },

          'image.beforeUpload': function (images) {
            getS3ObjectForImageUpload(images[0]);
            return false;
          },

          'file.beforeUpload': function (files) {
            const file = files[0];

            // Check single file size
            if (file.size > MAX_FILE_SIZE_IN_MB * 1e6) {
              appContext.config.globalProperties.$toast({
                warning: true,
                message: `Max ${MAX_FILE_SIZE_IN_MB}MB file size allowed.`,
              });
              return false;
            }

            // Check total cumulative attachments size
            const updatedTotal = (props.totalAttachmentSize || 0) + file.size;
            if (updatedTotal > TOTAL_ATTACHMENTS_SIZE_RESTRICTION * 1e6) {
              appContext.config.globalProperties.$toast({
                warning: true,
                message:
                  `Max ${TOTAL_ATTACHMENTS_SIZE_RESTRICTION}MB total attachments allowed.`,
              });
              return false;
            }

            getS3ObjectForFileUpload(file);
            return false;
          },
        },
      };

      if (props.canUploadImage) {
        config.imageUpload = true;
        config.imageMaxSize = 10 * 1024 * 1024;
      }

      if (props.canUploadFile) {
        config.fileUpload = true;
      }

      state.editorConfig = config;
      state.isEditorConfigSet = true;
    };

    const triggerVariableMenu = () => {
      if (!state.editorInstance) return;

      state.editorInstance.events.focus();

      state.editorInstance.html.insert('{');

      // Save cursor before Quasar menu takes focus
      state.editorInstance.selection.save();

      nextTick(() => {
        const selection = state.editorInstance.selection.get();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          state.menuAnchor.style.top = `${rect.bottom}px`;
          state.menuAnchor.style.left = `${rect.left}px`;
          state.showVariableMenu = true;
        }
      });
    };

    const onInsertHtmlFromVariable = (html) => {
      if (state.editorInstance) {
        state.editorInstance.events.focus();

        removePreviousOpeningBrace();

        state.editorInstance.html.insert(html);
        state.showVariableMenu = false;

        emitValueDebounced(state.editorInstance.html.get());
      }
    };

    // Helper to insert the variable with UI highlight pill wrapper
    const insertVariable = (variableValue) => {
      if (state.editorInstance) {
        const wrappedVariable = wrapVariable(variableValue);

        onInsertHtmlFromVariable(wrappedVariable);
      }
    };

    const onAddSpintax = () => {
      if (!state.editorInstance) return;

      const spintaxHtml = wrapSpintax('{}');

      onInsertHtmlFromVariable(spintaxHtml);

      setTimeout(() => {
        focusLatestSpintaxOption(state.editorInstance);
      }, 0);
    };

    onMounted(async () => {
      await loadFroalaAssets();

      if (props.isEditable) {
        initFroala();
      } else {
        window.addEventListener('resize', adjustIframeHeight);
      }
    });

    onUnmounted(() => {
      window.removeEventListener('resize', adjustIframeHeight);
    });

    watch(editorModelValue, () => {
      if (!props.isEditable) {
        setTimeout(() => {
          adjustIframeHeight();
        }, 100);
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      componentUid,
      editorModelValue,
      iframeSrcDoc,
      personalisationIssues,
      showPersonalisationError,

      // method
      onAddSpintax,
      insertVariable,
      adjustIframeHeight,
      triggerVariableMenu,
      onInsertHtmlFromVariable,
    };
  },
});
</script>

<style lang="scss" scoped>
.app-editor-container {
  position: relative;

  .personalisation-error-toolbar, .sequence-editor-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    border-top: 1px solid $grey-50;

    padding: 16px 20px;

    @media (max-width: $breakpoint-xs-max) {
      padding: 12px;
    }
  }

  .personalisation-error-toolbar {
    .issue-found-text {
      color: $negative;
      font-size: 14px;
      font-weight: 500;
    }
  }

  .sequence-editor-toolbar {
    .auto-saving-text {
      color: $grey-400;
      font-size: 12px;
      font-style: normal;
      font-weight: 400;
      line-height: 20px;
    }

    .seq-toolbar-btn {
      border-radius: 6px;
      border: 1px solid $grey-50;
      background: $white;

      .toolbar-btn-content {
        display: flex;
        align-items: center;

        gap: 6px;

        :deep(.toolbar-btn-icon) {
          @include svg-icon-stroke('path', $grey);
        }

        p {
          font-weight: 500;
          color: $black;
        }
      }

      &.delete-btn {
        &:hover {
          border: 1px solid $negative;

          .toolbar-btn-content {
            p {
              color: $negative;
            }

            :deep(.toolbar-btn-icon) {
              @include svg-icon-stroke('path', $negative);
            }
          }
        }
      }
    }
  }
  /*  */
  .email-editor-content {
    min-height: 120px;
  }

  /* iframe */
  .iframe-editor {
    width: 100%;
    border: 0px;
    overflow: hidden;
    min-height: unset;
    display: block;
  }
}
</style>
