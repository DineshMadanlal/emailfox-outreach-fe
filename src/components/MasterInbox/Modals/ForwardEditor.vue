<template>
  <q-card
    flat
    class="app-modal-card forward-editor-card"

    :class="{ maximized: maximized }"
  >
    <!-- Header -->
    <div class="app-modal-header">
      <h4 class="modal-header-text">
        Forward from {{ eachThreadJson.email}}
      </h4>

      <q-space />

      <!-- Enlarge Icon -->
      <q-btn
        flat
        round
        dense

        color="primary"
        class="app-primary-button"

        @click="$emit('onMaximize')"
      >
        <LocalSvgIcon
          image="maximize"
          classes="app-primary-icon"
        />
      </q-btn>

      <!-- Close -->
      <q-btn
        flat
        round
        dense
        v-close-popup

        color="negative"
        class="app-negative-button"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />
      </q-btn>
    </div>

    <!-- Content -->
    <div
      class="forward-editor-content hide-scrollbar"
    >
      <!-- To -->
      <div class="forward-input-wrapper">
        <p class="forward-input-label">
          To:
        </p>

        <div class="emails-input-block">
          <!-- chip -->
          <q-chip
            v-for="(data, index) in toEmails"
            :key="`to-email-${index}`"

            class="email-chip"
          >
            <div class="flex no-wrap items-center">
              <p class="chip-text">
                {{ data }}
              </p>

              <!-- close icon -->
              <LocalSvgIcon
                image="close"
                classes="chip-close-icon"

                @click="removeToEmail(index)"
              />
            </div>
          </q-chip>

          <!-- quasar input -->
          <q-input
            dense
            autofocus
            borderless

            v-model="toEmailInput"

            ref="toEmailInputRef"

            @keypress.enter="onAddToEmail"

            :style="{
              width: `${(toEmailInput.length + 1) * 8}px`,
              minWidth: '140px'
            }"

            class="email-input"
          />
        </div>

        <!-- CC and BCC -->
        <div class="cc-bcc-input-btns">
          <p
            v-if="!handleCcEmailVisibility"
            class="cc-bcc-text"

            @click="onEnableCcEmailAdding"
          >
            Cc
          </p>

          <p
            v-if="!handleBccEmailVisibility"
            class="cc-bcc-text"

            @click="onEnableBccEmailAdding"
          >
            Bcc
          </p>
        </div>
      </div>

      <!-- Cc -->
      <div
        v-if="handleCcEmailVisibility"
        class="forward-input-wrapper"
      >
        <p class="forward-input-label">
          Cc:
        </p>

        <!-- cc input -->
        <div class="emails-input-block">
          <!-- chip -->
          <q-chip
            v-for="(data, index) in ccEmails"
            :key="`cc-email-${index}`"

            class="email-chip"
          >
            <div class="flex no-wrap items-center">
              <p class="chip-text">
                {{ data }}
              </p>

              <!-- close icon -->
              <LocalSvgIcon
                image="close"
                classes="chip-close-icon"

                @click="removeCcEmail(index)"
              />
            </div>
          </q-chip>

          <!-- quasar input -->
          <q-input
            dense
            borderless

            v-model="ccEmailInput"

            class="email-input"
            ref="ccEmailInputRef"

            @blur="onBlurCcEmailInput"
            @keypress.enter="onAddCcEmail"

            :style="{
              width: `${(ccEmailInput.length + 1) * 8}px`,
              minWidth: '140px'
            }"
          />
        </div>
      </div>

      <!-- BCC -->
      <div
        v-if="handleBccEmailVisibility"
        class="forward-input-wrapper"
      >
        <p class="forward-input-label">
          Bcc:
        </p>
        <!-- bcc input -->
        <div class="emails-input-block">
          <!-- chip -->
          <q-chip
            v-for="(data, index) in bccEmails"
            :key="`bcc-email-${index}`"
            class="email-chip"
          >
            <div class="flex no-wrap items-center">
              <p class="chip-text">
                {{ data }}
              </p>
              <!-- close icon -->
              <LocalSvgIcon
                image="close"
                classes="chip-close-icon"
                @click="removeBccEmail(index)"
              />
            </div>
          </q-chip>
          <!-- quasar input -->
          <q-input
            dense
            borderless
            v-model="bccEmailInput"

            class="email-input"
            ref="bccEmailInputRef"

            @blur="onBlurBccEmailInput"
            @keypress.enter="onAddBccEmail"
            :style="{
              width: `${(bccEmailInput.length + 1) * 8}px`,
              minWidth: '140px'
            }"
          />
        </div>
      </div>

      <AppEditor
        v-model="htmlContent"

        class="app-forward-editor"

        @update:model-value="onUpdateEditorContent"

        v-if="isHtmlContentEditable"
      />
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <q-btn
        no-caps
        unelevated

        color="primary"

        :loading="isApiLoading"
        :disable="disableSendButton"

        @click="onClickSend"
      >
        Send
      </q-btn>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed,
  nextTick, onMounted, getCurrentInstance, defineAsyncComponent,
} from 'vue';

// quasar
import { useQuasar } from 'quasar';

// utils
import { formatUTCDate } from 'src/utils/dates.js';
import { postApiCall } from 'src/utils/apiRequests.js';
import { stripHtmlTags, trimMessageId } from 'src/utils/helperFunctions';

// Constants
import { EMAIL_REGEX } from 'boot/constants';

export default defineComponent({
  name: 'SkyBoxForwardEditor',

  emits: ['onMaximize', 'updatePersistentStatus', 'onSuccessForward'],

  components: {
    AppEditor: defineAsyncComponent(() => import('components/Editor/AppEditor.vue')),
  },

  props: {
    maximized: {
      type: Boolean,
      default: false,
    },
    latestReplyInHtml: {
      type: String,
      default: '',
    },
    detailedEmailJson: {
      type: Object,
      default: () => ({}),
    },
    eachThreadJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // quasar
    const $q = useQuasar();

    // app Context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      htmlContent: '',

      // to
      toEmails: [],
      toEmailInput: '',
      toEmailInputRef: null,
      showToEmailInput: false,

      // cc
      ccEmails: [],
      ccEmailInput: '',
      ccEmailInputRef: null,
      showCcEmailInput: false,

      // bcc
      bccEmails: [],
      bccEmailInput: '',
      bccEmailInputRef: null,
      showBccEmailInput: false,

      isApiLoading: false,

      isHtmlContentEditable: false,
    });

    // computed
    const handleToEmailVisibility = computed(
      () => state.toEmails.length > 0 || state.showToEmailInput,
    );

    const handleCcEmailVisibility = computed(
      () => state.ccEmails.length > 0 || state.showCcEmailInput,
    );

    const handleBccEmailVisibility = computed(
      () => state.bccEmails.length > 0 || state.showBccEmailInput,
    );

    const plainHtmlContent = computed(
      () => stripHtmlTags(state.htmlContent),
    );

    const disableSendButton = computed(() => {
      if (state.toEmails.length === 0) return true;

      if (plainHtmlContent.value?.length === 0) return true;

      return false;
    });

    // methods
    const onUpdatePersistentStatus = () => {
      if (state.toEmails.length > 0) {
        emit('updatePersistentStatus', true);
      } else if (state.ccEmails.length > 0) {
        emit('updatePersistentStatus', true);
      } else if (state.bccEmails.length > 0) {
        emit('updatePersistentStatus', true);
      } else if (plainHtmlContent.value) {
        emit('updatePersistentStatus', true);
      } else {
        emit('updatePersistentStatus', false);
      }
    };

    const removeCcEmail = (index) => {
      state.ccEmails.splice(index, 1);

      // focus on the input
      state.ccEmailInputRef.focus();

      onUpdatePersistentStatus();
    };

    const onAddCcEmail = () => {
      if (!state.ccEmailInput) return;

      /** Make sure the input is an valid email */
      if (state.ccEmailInput.match(EMAIL_REGEX)) {
        // if email is not included
        if (!state.ccEmails.includes(state.ccEmailInput)) {
          // push the email
          state.ccEmails.push(state.ccEmailInput);
        }

        state.ccEmailInput = '';

        // focus on the input
        state.ccEmailInputRef.focus();

        onUpdatePersistentStatus();
      } else {
        /** Show an alert message that the input is not an valid email */
        $q.dialog({
          title: 'Error',
          message: `The address "${state.ccEmailInput}" in the "Cc" field was not recognized. Please make sure that all addresses are properly formed.`,
        });
      }
    };

    const removeToEmail = (index) => {
      state.toEmails.splice(index, 1);

      // focus on the input
      state.toEmailInputRef.focus();

      onUpdatePersistentStatus();
    };

    const onAddToEmail = () => {
      if (!state.toEmailInput) return;

      /** Make sure the input is an valid email */
      if (state.toEmailInput.match(EMAIL_REGEX)) {
        // if email is not included
        if (!state.toEmails.includes(state.toEmailInput)) {
          // push the email
          state.toEmails.push(state.toEmailInput);
        }

        state.toEmailInput = '';

        // focus on the input
        state.toEmailInputRef.focus();

        onUpdatePersistentStatus();
      } else {
        /** Show an alert message that the input is not an valid email */
        $q.dialog({
          title: 'Error',
          message: `The address "${state.toEmailInput}" in the "To" field was not recognized. Please make sure that all addresses are properly formed.`,
        });
      }
    };

    const removeBccEmail = (index) => {
      state.bccEmails.splice(index, 1);
      // focus on the input
      state.bccEmailInputRef.focus();

      onUpdatePersistentStatus();
    };

    const onAddBccEmail = () => {
      if (!state.bccEmailInput) return;
      /** Make sure the input is an valid email */
      if (state.bccEmailInput.match(EMAIL_REGEX)) {
        // if email is not included
        if (!state.bccEmails.includes(state.bccEmailInput)) {
          // push the email
          state.bccEmails.push(state.bccEmailInput);
        }
        state.bccEmailInput = '';
        // focus on the input
        state.bccEmailInputRef.focus();

        onUpdatePersistentStatus();
      } else {
        /** Show an alert message that the input is not an valid email */
        $q.dialog({
          title: 'Error',
          message: `The address "${state.bccEmailInput}" in the "Bcc" field was not recognized. Please make sure that all addresses are properly formed.`,
        });
      }
    };

    const onUpdateEditorContent = () => {
      onUpdatePersistentStatus();
    };

    const onEnableCcEmailAdding = () => {
      state.showCcEmailInput = true;

      nextTick(() => {
        // focus the input
        state.ccEmailInputRef.focus();
      });
    };

    const onEnableBccEmailAdding = () => {
      state.showBccEmailInput = true;

      nextTick(() => {
        // focus the input
        state.bccEmailInputRef.focus();
      });
    };

    const onBlurCcEmailInput = () => {
      if (!state.ccEmailInput) {
        state.showCcEmailInput = false;
      }
    };

    const onBlurBccEmailInput = () => {
      if (!state.bccEmailInput) {
        state.showBccEmailInput = false;
      }
    };

    const sendForwardEmail = async (htmlContent) => {
      try {
        state.isApiLoading = true;

        // payload
        const {
          thread_id, domain_id, email, subject,
          references, message_id,
        } = props.eachThreadJson;

        const trimmedMessageId = trimMessageId(message_id);

        const payload = {
          thread_id,
          domain_id,
          email,
          subject,
          html: htmlContent,
          to: state.toEmails.join(', '),
          cc: state.ccEmails.join(', '),
          bcc: state.bccEmails.join(', '),
          in_reply_to: trimmedMessageId,
          references: trimmedMessageId,
        };

        if (props.eachThreadJson.references) {
          payload.references = references.split(',').join(' ').append(` ${trimmedMessageId}`);
        }

        // API Call
        await postApiCall({
          endpoint: '/master-inbox/messages/thread-forward',
          payload,
        });

        appContext.config.globalProperties.$toast({
          message: 'Message sent successfully.',
        });

        emit('onSuccessForward');
      } catch (error) {
        appContext.config.globalProperties.$toast({
          message: error.message,
          warning: true,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    const onClickSend = () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(state.htmlContent, 'text/html');

      // 1. Remove elements where either `class` or `fr-original-class` equals "show-trimmed-button"
      doc.querySelectorAll('[class="show-trimmed-button"], [fr-original-class="show-trimmed-button"]').forEach((el) => el.remove());

      // 2. Hide elements where either `class` or `fr-original-class` equals "gmail_quote_content"
      doc.querySelectorAll('[class="gmail_quote_content"], [fr-original-class="gmail_quote_content"]').forEach((el) => {
        el.setAttribute('style', 'display: block;');
      });

      const cleanedHtml = doc.body.innerHTML;

      sendForwardEmail(cleanedHtml);
    };

    const onAddOldReply = () => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(props.latestReplyInHtml, 'text/html');

      // 2. Hide elements where either `class` or `fr-original-class` equals "gmail_quote_content"
      doc.querySelectorAll('[class="gmail_quote_content"], [fr-original-class="gmail_quote_content"]').forEach((el) => {
        el.setAttribute('style', 'display: block;');
      });

      const previousReplyHtml = `<div>---------- Forwarded message ---------
        <br />
        From: <span>&lt;${props.eachThreadJson.email}&gt;</span>
        <br />
        Date: ${formatUTCDate(props.eachThreadJson.date, 'MMM dd, yyyy HH:mm')}
        <br />
        Subject: ${props.eachThreadJson.subject}
        <br />
        To: &lt;${props.eachThreadJson.to}&gt;
      </div>
      <br />
      ${doc.body.innerHTML}`;

      state.htmlContent = previousReplyHtml;

      state.isHtmlContentEditable = true;
    };

    onMounted(() => {
      onAddOldReply();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      disableSendButton,
      handleToEmailVisibility,
      handleCcEmailVisibility,
      handleBccEmailVisibility,

      // methods
      removeCcEmail,
      onAddCcEmail,

      removeToEmail,
      onAddToEmail,

      onClickSend,

      removeBccEmail,
      onAddBccEmail,
      onUpdateEditorContent,

      onEnableCcEmailAdding,
      onEnableBccEmailAdding,

      onBlurCcEmailInput,
      onBlurBccEmailInput,
    };
  },
});
</script>

<style lang="scss" scoped>
.forward-editor-card {
  $forwardHeaderHeight: 42px;
  $forwardFooterHeight: 60px;

  width: 660px;
  height: 680px;

  padding: 4px;
  background: $grey-50;
  // filter: drop-shadow(-2px -2px 15px rgba(4, 26, 68, 0.16));
  border-radius: 8px 8px 0px 0px !important;

  &.maximized {
    height: 75%;
    width: 100% !important;
    max-width: 1080px;
    border-radius: 8px !important;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      width: 100vw !important;
      height: 90vh;
      border-radius: 0px !important;
    }
  }

  .app-modal-header {
    padding-left: 16px;

    height: $forwardHeaderHeight;
    background: unset;
    border-bottom: 0px;
    padding-right: 8px;

    .modal-header-text {
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 80%;
    }

    .app-primary-button {
      margin-right: 4px;

      @media (max-width: $breakpoint-xs-max) {
        display: none;
      }
    }
  }

  .forward-editor-content {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    height: calc(100% - #{$forwardHeaderHeight} - #{$forwardFooterHeight});

    background-color: $white;
    border-radius: 8px 8px 0px 0px;

    .cc-bcc-input-btns {
      display: flex;
      align-items: center;
      gap: 12px;
      height: fit-content;
      padding-top: 8px;

      .cc-bcc-text {
        color: $grey;
        font-size: 13px;
        font-weight: 500;
        line-height: 20px;

        cursor: pointer;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .forward-input-wrapper {
      width: 100%;
      display: flex;
      border-bottom: 1px solid $grey-50;

      padding: 4px 16px;

      .forward-input-label {
        color: $grey;
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;

        height: fit-content;

        padding-top: 8px;

        margin-right: 8px;
        min-width: 24px;
      }

      :deep(.email-input) {
        padding: 0px;

        .q-field__control {
          height: 30px;
        }
      }

      .emails-input-block {
        width: 100%;
        padding: 2px 16px 2px 0px;
        background: $white;
        display: flex;
        flex-wrap: wrap;

        :deep(.email-chip) {
          height: 24px;
          padding: 3px 6px;
          border-radius: 4px;
          border: 1px solid $grey-50;
          background-color: rgba($color: var(--grey-50-rgb), $alpha: 0.7);

          .chip-text {
            color: $black;
            font-size: 14px;
            font-weight: 400;
            line-height: 16px;

            margin-right: 10px;
          }

          .chip-close-icon {
            height: 10px;
            width: 10px;

            cursor: pointer;
          }
        }
      }
    }
  }

  .app-modal-footer {
    border-color: $grey-50;
    height: $forwardFooterHeight;
    border-radius: 0px 0px 8px 8px !important;
  }
}
</style>
