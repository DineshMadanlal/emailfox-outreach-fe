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

    <!-- Read-only via iframe -->
    <iframe
      v-else-if="useIframeToLoadContent"
      ref="nonEditableEmailRef"
      :srcdoc="editorModelValue"
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
    <div
      v-if="isS3ApiLoading"
      class="email-editor-loader"
    >
      <q-inner-loading showing>
        <q-spinner size="25px" color="primary" />
      </q-inner-loading>
    </div>
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

// quasar
import { useQuasar } from 'quasar';

// npm modules
import FroalaEditor from 'froala-editor';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { loadFroalaAssets } from 'src/utils/loadFroala';

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
import EditorMenuOptions from 'components/Menu/EditorMenuOptions.vue';

// constants
import { MAX_FILE_SIZE_IN_MB } from 'src/boot/constants';

export default defineComponent({
  name: 'EmailBodyEditor',

  emits: ['update:modelValue', 'addNewAttachment'],

  components: {
    EditorMenuOptions,
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
    totalAttachmentSize: {
      type: Number,
      default: null,
    },
    useIframeToLoadContent: {
      type: Boolean,
      default: true,
    },
    addExtraHeightForIframe: {
      type: Number,
      default: 48,
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
    const { appContext } = getCurrentInstance();

    // quasar
    const $q = useQuasar();

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

    const componentUid = computed(() => getCurrentInstance().uid);

    const personalisationIssues = computed(() => {
      const issues = findTemplateIssues(
        editorModelValue.value,
        [],
      );

      return issues;
    });

    const showPersonalisationError = computed(() => personalisationIssues.value?.length > 0);

    const emitValueDebounced = debounce((html) => {
      if (props.subjectEditor) {
        // return plain text
        emit('update:modelValue', getCleanText(html));
      } else {
        emit('update:modelValue', html);
      }
    }, 0);

    const applyHighlighting = () => {
      if (!state.editorInstance) return; // Don't highlight while cleaning/saving

      const html = state.editorInstance.html.get();
      const highlightedHtml = highlightVariablesAndSpintax(html);

      if (html !== highlightedHtml) {
        // Pro-tip: Save cursor position before setting HTML,
        // otherwise the cursor jumps to the start.
        // const selection = state.editorInstance.selection.get();

        state.editorInstance.html.set(highlightedHtml);

        state.editorInstance.selection.restore();
        emitValueDebounced(highlightedHtml);
      }
    };

    const adjustIframeHeight = () => {
      if (state.nonEditableEmailRef) {
        const iframe = state.nonEditableEmailRef;
        const contentDocument = iframe.contentWindow.document;
        // Force body margin to 0 to get accurate scrollHeight
        contentDocument.body.style.margin = '0';

        // Reset height to avoid accumulation issues
        state.nonEditableEmailRef.style.height = '0px';
        state.nonEditableEmailRef.style.minHeight = '0px';

        // Correct calculation using parentheses
        const newHeight = contentDocument.documentElement.scrollHeight
          + (props.addExtraHeightForIframe || 0);

        if (newHeight < 60) {
          // Set a minimum height to avoid collapsing
          state.nonEditableEmailRef.style.minHeight = '60px';
        } else {
          // Set the updated height
          state.nonEditableEmailRef.style.height = `${newHeight + 20}px`;
        }

        contentDocument.body.style.font = '14px/1.4 Inter, sans-serif';

        // Ensure all links open in a new tab
        const links = contentDocument.getElementsByTagName('a');
        Array.from(links).forEach((eachLink) => {
          eachLink.setAttribute('target', '_blank');
        });
      }
    };

    const setEditorContent = (html) => {
      if (state.editorInstance) {
        //
        state.editorInstance.html.set(html || '');
      }
    };

    // S3 Image Upload
    const getS3ObjectForImageUpload = async (file) => {
      $q.loading.show({ message: 'Uploading image...' });

      const res = await getApiCall({
        endpoint: `/api/aws-s3/get-campaign-sequence-image-signed-url?fileType=${file.type}&fileName=${file.name}`,
      });

      const { requestUrl, fileUrl } = res.data;

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', requestUrl, true);

      xhr.onload = () => {
        $q.loading.hide();
        state.editorInstance.image.insert(fileUrl);
      };

      xhr.send(file);
    };

    // S3 File Upload
    const getS3ObjectForFileUpload = async (file) => {
      $q.loading.show({ message: 'Uploading file...' });

      const res = await getApiCall({
        endpoint: `/api/aws-s3/get-upload-attachments-signed-url?fileType=${file.type}&fileName=${file.name}&emailStatsId=${props.emailStatsId}`,
      });

      const { requestUrl, fileUrl } = res.data;

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', requestUrl, true);

      xhr.onload = () => {
        $q.loading.hide();

        emit('addNewAttachment', {
          file_url: fileUrl,
          file_type: file.type,
          file_name: file.name,
          file_size: file.size,
        });
      };

      xhr.send(file);
    };

    const initFroala = () => {
      state.editorConfig = {
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
              // 'quote',
              // 'clearFormatting',
            ],
            buttonsVisible: 3, // 👈 controls how many show before collapsing
          },
          // 'insertImage',
          moreMisc: {
            buttons: ['insertLink', 'undo', 'redo', 'html'],
            buttonsVisible: 5,
          },
        },

        linkList: [],
        tableStyles: {
          'fr-no-borders': 'Hide Borders',
          'fr-dashed-borders': 'Dashed Borders',
          'fr-alternate-rows': 'Alternate Rows',
        },

        imageDefaultAlign: 'left',
        imageUploadRemoteUrls: false,
        imageInsertButtons: ['imageBack', '|', 'imageUpload', 'imageByURL'],
        imageEditButtons: ['imageReplace', 'imageAlign', 'imageCaption', 'imageRemove', '|', 'imageLink', 'linkOpen', 'linkEdit', 'linkRemove', '-', 'imageDisplay', 'imageStyle', 'imageAlt', 'imageSize'],

        /** advanced image editor */
        imageTUIOptions: {
          includeUI: {
            initMenu: 'filter',
            menuBarPosition: 'left',
            theme: {
              'menu.activeIcon.path': 'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-b.svg',
              'menu.disabledIcon.path': 'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-a.svg',
              'menu.hoverIcon.path': 'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-c.svg',
              'menu.normalIcon.path': 'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-d.svg',
              'submenu.activeIcon.name': 'icon-c',
              'submenu.activeIcon.path': 'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-c.svg',
              'submenu.normalIcon.name': 'icon-d',
              'submenu.normalIcon.path': 'https://cdn.jsdelivr.net/npm/tui-image-editor@3.2.2/dist/svg/icon-d.svg',
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

            //
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

                // Move our hidden anchor to the cursor position
                state.menuAnchor.style.top = `${rect.bottom}px`;
                state.menuAnchor.style.left = `${rect.left}px`;

                state.showVariableMenu = true;
              }, 0);
            } else if (state.showVariableMenu) {
              // 2. AUTO-CLOSE: If the menu is open and they type anything else
              // List of keys that SHOULD NOT close the menu (optional)
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
            // To ensure the latest content is emitted on blur as well
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

            if (file.size > MAX_FILE_SIZE_IN_MB * 1e6) {
              // Show a toaster that domain have been setup successfully
              appContext.config.globalProperties.$toast({
                warning: true,
                message: 'Max 15MB file',
              });

              return false;
            }

            getS3ObjectForFileUpload(file);
            return false;
          },
        },
      };

      state.isEditorConfigSet = true;
    };

    const triggerVariableMenu = () => {
      if (!state.editorInstance) return;

      state.editorInstance.events.focus();

      state.editorInstance.html.insert('{');

      // Save cursor before Quasar menu takes focus
      state.editorInstance.selection.save();

      // 2. Wait for DOM to update, then calculate position
      nextTick(() => {
        const selection = state.editorInstance.selection.get();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          // 3. Position the anchor and show Quasar menu
          state.menuAnchor.style.top = `${rect.bottom}px`;
          state.menuAnchor.style.left = `${rect.left}px`;
          state.showVariableMenu = true;
        }
      });
    };

    const onInsertHtmlFromVariable = (html) => {
      if (state.editorInstance) {
        // 1. Ensure editor is focused
        state.editorInstance.events.focus();

        removePreviousOpeningBrace();

        state.editorInstance.html.insert(html);
        state.showVariableMenu = false;

        emitValueDebounced(state.editorInstance.html.get());
      }
    };

    // Helper to insert the variable and close the menu
    const insertVariable = (variableValue) => {
      if (state.editorInstance) {
        // 2. Insert the variable at the cursor position
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
      loadFroalaAssets();

      if (props.isEditable) {
        initFroala();
      } else {
        window.addEventListener('resize', adjustIframeHeight);
      }
    });

    onUnmounted(() => {
      // Remove the event listener when the component is unmounted
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
  }

  /* loader */
  .email-editor-loader {
    position: relative;
    min-height: 100px;
  }
}
</style>
