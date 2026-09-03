<template>
  <q-card
    flat
    class="app-modal-card compose-editor-card"

    :class="{ maximized: maximized }"
  >
    <!-- Header -->
    <div class="app-modal-header">
      <h4 class="modal-header-text">
        Compose Email
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
      class="compose-editor-content hide-scrollbar"
      id="compose-app-editor-content"
    >
      <!-- From -->
      <div class="compose-input-wrapper from-input">
        <p class="compose-input-label no-padding">
          From:
        </p>

        <!-- Choose From Address -->
        <SelectMailbox
          :clearable="false"

          v-model="senderMailboxId"

          option-value="id"
          class="select-mailbox-dd"
          placeholderText="Choose From Address"
        />
      </div>

      <!-- To -->
      <div class="compose-input-wrapper">
        <p class="compose-input-label">
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
            borderless

            v-model="toEmailInput"

            ref="toEmailInputRef"

            @blur="onBlurAddEmailInput"
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
        class="compose-input-wrapper"
      >
        <p class="compose-input-label">
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
        class="compose-input-wrapper"
      >
        <p class="compose-input-label">
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

      <!-- Subject -->
      <div class="compose-input-wrapper">
        <q-input
          dense
          borderless
          v-model="subject"
          class="email-input"
          ref="subjectInputRef"
          placeholder="Subject"
          style="width: 100%;"
        />
      </div>

      <AppEditor
        autofocusEditor
        v-model="htmlContent"
        placeholderText="Type your email content here..."

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
  nextTick, onMounted, defineAsyncComponent,
  onUnmounted, getCurrentInstance,
} from 'vue';

// quasar
import { useQuasar } from 'quasar';

// Components
import SelectMailbox from 'components/Dropdown/Unibox/SelectMailbox.vue';

// utils
import { postApiCall } from 'src/utils/apiRequests.js';
import { stripHtmlTags, generateEmailHTML } from 'src/utils/helperFunctions';

// Constants
import { EMAIL_REGEX } from 'boot/constants';

export default defineComponent({
  name: 'ComposeEditor',

  emits: ['onMaximize', 'updatePersistentStatus', 'onSuccessSentEmail'],

  components: {
    SelectMailbox,
    AppEditor: defineAsyncComponent(() => import('components/Editor/AppEditor.vue')),
  },

  props: {
    maximized: {
      type: Boolean,
      default: false,
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
      subject: '',

      // from email json
      senderMailboxId: null,

      //
      sendPlainText: false,

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

      if (!state.senderMailboxId) return true;

      if (!state.subject?.length) return true;

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

    const onAddToEmail = (focus = true) => {
      // write a brief comment on what the function does
      if (!state.toEmailInput) return;

      const emails = state.toEmailInput.split(/[,; ]+/).map((e) => e.trim().toLowerCase()).filter(Boolean);

      const invalid = [];

      emails.forEach((email) => {
        if (EMAIL_REGEX.test(email)) {
          if (!state.toEmails.includes(email)) {
            state.toEmails.push(email);
          }
        } else {
          invalid.push(email);
        }
      });

      if (invalid.length) {
        $q.dialog({
          title: 'Error',
          message: `These addresses were not recognized:<br>${invalid.join(', ')}`,
          html: true,
        });

        state.toEmailInputRef.focus();
      } else {
        state.toEmailInput = '';

        onUpdatePersistentStatus();
      }

      if (focus) {
        state.toEmailInputRef.focus();
      }
    };

    const onBlurAddEmailInput = () => {
      setTimeout(() => {
        if (state.toEmailInput) {
          onAddToEmail(false);
        }
      }, 200);
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

    const sendReplyEmail = async (htmlContent) => {
      try {
        state.isApiLoading = true;

        const payload = {
          message: htmlContent,
          subject: state.subject,

          to: state.toEmails.join(', '),
          cc: state.ccEmails.join(', '),
          bcc: state.bccEmails.join(', '),

          sender_mailbox_id: state.senderMailboxId,
          send_plain_text: state.sendPlainText,
        };

        // API Call
        await postApiCall({
          payload,
          includeWorkspace: true,
          endpoint: '/unibox/compose',
        });

        // toaster
        appContext.config.globalProperties.$toast({
          message: 'Email sent successfully.',
        });

        emit('onSuccessSentEmail');
      } catch (error) {
        // show error toaster
        appContext.config.globalProperties.$toast({
          message: error.message,
          warning: true,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    const onClickSend = () => {
      const cleanedHtml = generateEmailHTML(state.subject, state.htmlContent);

      sendReplyEmail(cleanedHtml);
    };

    const onClickEventListener = (e) => {
      const toggle = e.target.closest('.show-trimmed-button');

      if (toggle) {
        const quote = toggle.nextElementSibling;

        if (quote) {
          if (quote.style.display === 'block') {
            quote.style.display = 'none';
          } else {
            quote.style.display = 'block';
          }
        }
      }
    };

    onMounted(() => {
      state.isHtmlContentEditable = true;
    });

    onUnmounted(() => {
      // remove the event listener
      document.removeEventListener('click', onClickEventListener);
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
      onBlurAddEmailInput,

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
.compose-editor-card {
  $replyHeaderHeight: 42px;
  $replyFooterHeight: 60px;

  width: 660px;
  height: 680px;

  padding: 4px;
  background: $grey-50;
  filter: drop-shadow(-2px -2px 15px rgba(4, 26, 68, 0.16));
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

    height: $replyHeaderHeight;
    background: unset;
    border-bottom: 0px;
    padding-right: 8px;
    background: rgba($color: var(--grey-50-rgb), $alpha: 0.1);

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

  .compose-editor-content {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    height: calc(100% - #{$replyHeaderHeight} - #{$replyFooterHeight});

    background-color: $white;
    border-radius: 8px 8px 0px 0px;

    :deep(.select-mailbox-dd) {
      height: fit-content;
      width: fit-content;

      .q-field__control {
        min-height: unset;
        height: 22px;
        width: fit-content;
        min-width: 170px;

        border-radius: 4px;
        border: unset;
        background-color: rgba($color: var(--grey-50-rgb), $alpha: 0.7);

        .q-field__control-container {
          .q-field__native  {
            min-height: unset;

            &::before {
              color: $black;
              font-size: 14px;
              font-weight: 400;
              line-height: 16px;
            }

            span {
              width: fit-content;
              max-width: unset;
            }
          }
        }

        .q-field__append {
          height: unset;

          .q-spinner {
            width: 12px;
          }

          i {
            width: 6px;
            height: 6px;
            font-size: 14px;
          }
        }
      }
    }

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

    .compose-input-wrapper {
      width: 100%;
      display: flex;
      border-bottom: 1px solid $grey-50;

      padding: 4px 16px;

      &.from-input {
        padding: 12px 16px;
      }

      .compose-input-label {
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
    height: $replyFooterHeight;
    border-radius: 0px 0px 8px 8px !important;
  }
}
</style>
