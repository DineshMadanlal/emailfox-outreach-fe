<template>
  <q-card
    flat
    class="app-modal-card reply-editor-card"
    :class="{ maximized: maximized }"
  >
    <!-- Header -->
    <div class="app-modal-header">
      <h4 class="modal-header-text">
        Reply to {{ recipientDisplayName || toEmails[0] || 'Email' }}
      </h4>

      <q-space />

      <!-- Maximize / Restore Icon -->
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

      <!-- Close Icon -->
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
      class="reply-editor-content hide-scrollbar"
      id="unibox-reply-editor-content"
    >
      <!-- To Field -->
      <div class="reply-input-wrapper">
        <p class="reply-input-label">
          To:
        </p>

        <div class="emails-input-block">
          <!-- Recipient Chip -->
          <q-chip
            v-for="(data, index) in toEmails"
            :key="`to-email-${index}`"
            class="email-chip"
          >
            <div class="flex no-wrap items-center">
              <p class="chip-text">
                {{ data }}
              </p>

              <!-- Close / Remove Icon -->
              <LocalSvgIcon
                image="close"
                classes="chip-close-icon"
                @click="removeToEmail(index)"
              />
            </div>
          </q-chip>

          <!-- Quasar Input for Adding More Recipients -->
          <q-input
            dense
            borderless
            v-model="toEmailInput"
            ref="toEmailInputRef"
            @blur="onBlurAddToEmailInput"
            @keypress.enter="onAddToEmail"
            :style="{
              width: `${(toEmailInput.length + 1) * 8}px`,
              minWidth: '140px',
            }"
            class="email-input"
          />
        </div>

        <!-- CC and BCC Action Triggers -->
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

      <!-- CC Field -->
      <div
        v-if="handleCcEmailVisibility"
        class="reply-input-wrapper"
      >
        <p class="reply-input-label">
          Cc:
        </p>

        <div class="emails-input-block">
          <!-- CC Chip -->
          <q-chip
            v-for="(data, index) in ccEmails"
            :key="`cc-email-${index}`"
            class="email-chip"
          >
            <div class="flex no-wrap items-center">
              <p class="chip-text">
                {{ data }}
              </p>

              <LocalSvgIcon
                image="close"
                classes="chip-close-icon"
                @click="removeCcEmail(index)"
              />
            </div>
          </q-chip>

          <!-- CC Quasar Input -->
          <q-input
            dense
            borderless
            v-model="ccEmailInput"
            ref="ccEmailInputRef"
            class="email-input"
            @blur="onBlurCcEmailInput"
            @keypress.enter="onAddCcEmail"
            :style="{
              width: `${(ccEmailInput.length + 1) * 8}px`,
              minWidth: '140px',
            }"
          />
        </div>
      </div>

      <!-- BCC Field -->
      <div
        v-if="handleBccEmailVisibility"
        class="reply-input-wrapper"
      >
        <p class="reply-input-label">
          Bcc:
        </p>

        <div class="emails-input-block">
          <!-- BCC Chip -->
          <q-chip
            v-for="(data, index) in bccEmails"
            :key="`bcc-email-${index}`"
            class="email-chip"
          >
            <div class="flex no-wrap items-center">
              <p class="chip-text">
                {{ data }}
              </p>

              <LocalSvgIcon
                image="close"
                classes="chip-close-icon"
                @click="removeBccEmail(index)"
              />
            </div>
          </q-chip>

          <!-- BCC Quasar Input -->
          <q-input
            dense
            borderless
            v-model="bccEmailInput"
            ref="bccEmailInputRef"
            class="email-input"
            @blur="onBlurBccEmailInput"
            @keypress.enter="onAddBccEmail"
            :style="{
              width: `${(bccEmailInput.length + 1) * 8}px`,
              minWidth: '140px',
            }"
          />
        </div>
      </div>

      <!-- Subject Field -->
      <div
        class="reply-input-wrapper"
        v-if="false"
      >
        <q-input
          dense
          borderless
          v-model="subject"
          ref="subjectInputRef"
          placeholder="Subject"
          class="email-input"
          style="width: 100%;"
        />
      </div>

      <!-- Message WYSIWYG Editor Area -->
      <AppEditor
        autofocusEditor
        v-model="htmlContent"
        placeholderText="Type your reply here..."
        @update:model-value="onUpdateEditorContent"
        v-if="isHtmlContentEditable"
      />
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Plain text checkbox on left -->
      <div>
        <q-checkbox
          dense
          color="primary"
          class="app-checkbox"
          label="Send Plain Text"
          v-model="sendPlainText"
        />
      </div>

      <q-space />

      <!-- Send Reply Button on right -->
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
  getCurrentInstance,
} from 'vue';

// quasar
import { useQuasar } from 'quasar';

// utils
import { postApiCall } from 'src/utils/apiRequests.js';
import { stripHtmlTags } from 'src/utils/helperFunctions';
import { getFromAndEmailJson } from 'src/utils/skyboxApi.js';

// constants
import { EMAIL_REGEX } from 'boot/constants';

export default defineComponent({
  name: 'UniboxReplyEditor',

  emits: ['onMaximize', 'updatePersistentStatus', 'onSuccessReply'],

  components: {
    AppEditor: defineAsyncComponent(() => import('components/Editor/AppEditor.vue')),
  },

  props: {
    maximized: {
      type: Boolean,
      default: false,
    },
    // The specific message object being replied to
    messageJson: {
      type: Object,
      default: () => ({}),
    },
    // Parent thread object containing contact_mapping_id
    threadJson: {
      type: Object,
      default: () => ({}),
    },
    // Full fetched conversation contact data
    contactData: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    const $q = useQuasar();
    const { appContext } = getCurrentInstance();

    // Component reactive state
    const state = reactive({
      htmlContent: '',
      subject: '',

      // Display name of recipient
      recipientDisplayName: '',

      // Plain text toggle
      sendPlainText: false,

      // To recipients
      toEmails: [],
      toEmailInput: '',
      toEmailInputRef: null,
      showToEmailInput: false,

      // CC recipients
      ccEmails: [],
      ccEmailInput: '',
      ccEmailInputRef: null,
      showCcEmailInput: false,

      // BCC recipients
      bccEmails: [],
      bccEmailInput: '',
      bccEmailInputRef: null,
      showBccEmailInput: false,

      // Threading headers
      inReplyTo: '',
      references: '',
      threadId: '',

      // Attachment state
      attachments: [],

      // Loaders & editing flags
      isApiLoading: false,
      isHtmlContentEditable: false,
    });

    // Computed visibility helpers
    const handleToEmailVisibility = computed(
      () => state.toEmails.length > 0 || state.showToEmailInput,
    );

    const handleCcEmailVisibility = computed(
      () => state.ccEmails.length > 0 || state.showCcEmailInput,
    );

    const handleBccEmailVisibility = computed(
      () => state.bccEmails.length > 0 || state.showBccEmailInput,
    );

    // Stripped plain text content for validation
    const plainHtmlContent = computed(
      () => stripHtmlTags(state.htmlContent),
    );

    // Send button enabled state: requires To, message body, sender mailbox, and subject
    const disableSendButton = computed(() => {
      if (state.toEmails.length === 0) return true;
      if (plainHtmlContent.value?.length === 0) return true;
      if (!state.subject?.length) return true;

      return false;
    });

    // Notify parent if draft has contents to prevent accidental closing
    const onUpdatePersistentStatus = () => {
      if (state.toEmails.length > 0
        || state.ccEmails.length > 0
        || state.bccEmails.length > 0
        || plainHtmlContent.value) {
        emit('updatePersistentStatus', true);
      } else {
        emit('updatePersistentStatus', false);
      }
    };

    // Remove CC email chip
    const removeCcEmail = (index) => {
      state.ccEmails.splice(index, 1);
      state.ccEmailInputRef?.focus();
      onUpdatePersistentStatus();
    };

    // Add CC email chip after regex validation
    const onAddCcEmail = () => {
      if (!state.ccEmailInput) return;

      if (state.ccEmailInput.match(EMAIL_REGEX)) {
        if (!state.ccEmails.includes(state.ccEmailInput)) {
          state.ccEmails.push(state.ccEmailInput);
        }
        state.ccEmailInput = '';
        state.ccEmailInputRef?.focus();
        onUpdatePersistentStatus();
      } else {
        $q.dialog({
          title: 'Error',
          message: `The address "${state.ccEmailInput}" in the "Cc" field was not recognized.`,
        });
      }
    };

    // Remove To email chip
    const removeToEmail = (index) => {
      state.toEmails.splice(index, 1);
      state.toEmailInputRef?.focus();
      onUpdatePersistentStatus();
    };

    // Add To email chip after regex validation
    const onAddToEmail = (focus = true) => {
      if (!state.toEmailInput) return;

      const emails = state.toEmailInput
        .split(/[,; ]+/)
        .map((e) => e.trim().toLowerCase())
        .filter(Boolean);

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
        state.toEmailInputRef?.focus();
      } else {
        state.toEmailInput = '';
        onUpdatePersistentStatus();
      }

      if (focus) {
        state.toEmailInputRef?.focus();
      }
    };

    // Blur handler for To field input
    const onBlurAddToEmailInput = () => {
      setTimeout(() => {
        if (state.toEmailInput) {
          onAddToEmail(false);
        }
      }, 200);
    };

    // Remove BCC email chip
    const removeBccEmail = (index) => {
      state.bccEmails.splice(index, 1);
      state.bccEmailInputRef?.focus();
      onUpdatePersistentStatus();
    };

    // Add BCC email chip after regex validation
    const onAddBccEmail = () => {
      if (!state.bccEmailInput) return;

      if (state.bccEmailInput.match(EMAIL_REGEX)) {
        if (!state.bccEmails.includes(state.bccEmailInput)) {
          state.bccEmails.push(state.bccEmailInput);
        }
        state.bccEmailInput = '';
        state.bccEmailInputRef?.focus();
        onUpdatePersistentStatus();
      } else {
        $q.dialog({
          title: 'Error',
          message: `The address "${state.bccEmailInput}" in the "Bcc" field was not recognized.`,
        });
      }
    };

    // Editor content update listener
    const onUpdateEditorContent = () => {
      onUpdatePersistentStatus();
    };

    // Focus helpers for CC & BCC toggles
    const onEnableCcEmailAdding = () => {
      state.showCcEmailInput = true;
      nextTick(() => {
        state.ccEmailInputRef?.focus();
      });
    };

    const onEnableBccEmailAdding = () => {
      state.showBccEmailInput = true;
      nextTick(() => {
        state.bccEmailInputRef?.focus();
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

    // Pre-fill reply fields from props
    const populateReplyData = () => {
      const msg = props.messageJson || {};
      const thread = props.threadJson || {};

      const parsedData = props.messageJson?.parsedData || {};

      // 1. Recipient extraction (reply to sender of received message)
      if (msg.sender) {
        const parsed = getFromAndEmailJson(msg.sender);
        if (parsed.email) {
          state.toEmails = [parsed.email];
          state.recipientDisplayName = parsed.from || parsed.email;
        }
      } else if (thread.email) {
        state.toEmails = [thread.email];
        state.recipientDisplayName = thread.contact_name || thread.email;
      }

      // 2. Subject line (ensure Re: prefix without repeating)
      const baseSubject = msg.subject || thread.latest_subject || '';
      if (baseSubject) {
        state.subject = /^re:\s*/i.test(baseSubject) ? baseSubject : `Re: ${baseSubject}`;
      }

      // 3. Threading headers
      state.inReplyTo = parsedData.message_id || msg.provider_message_id || '';
      state.references = (`${parsedData.message_id || ''} ${parsedData.references || ''}`.trim()) || msg.provider_message_id || '';

      // provider thread ID
      state.threadId = msg.provider_thread_id || '';
    };

    // Send reply API invocation
    const sendReplyEmail = async (htmlContent) => {
      try {
        state.isApiLoading = true;

        const contactMappingId = props.threadJson?.contact_mapping_id;

        const payload = {
          //
          to: state.toEmails.join(', '),
          cc: state.ccEmails.join(', '),
          bcc: state.bccEmails.join(', '),

          //
          message: htmlContent,
          subject: state.subject,

          // attachments
          attachments: state.attachments || [],
          has_attachments: (state.attachments || []).length > 0,

          // plain text
          send_plain_text: state.sendPlainText,

          //
          in_reply_to: state.inReplyTo,
          references: state.references,

          //
          thread_id: state.threadId,
        };

        // Post to unibox inbox thread reply endpoint
        await postApiCall({
          payload,
          includeWorkspace: true,
          endpoint: `/unibox/inbox/${contactMappingId}/reply`,
        });

        appContext.config.globalProperties.$toast({
          message: 'Email replied successfully.',
        });

        emit('onSuccessReply');
      } catch (error) {
        appContext.config.globalProperties.$toast({
          message: error.message,
          warning: true,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    // Primary send click handler
    const onClickSend = () => {
      sendReplyEmail(state.htmlContent);
    };

    onMounted(() => {
      state.isHtmlContentEditable = true;
      populateReplyData();
    });

    return {
      // State
      ...toRefs(state),

      // Computed
      disableSendButton,
      handleToEmailVisibility,
      handleCcEmailVisibility,
      handleBccEmailVisibility,

      // Methods
      removeCcEmail,
      onAddCcEmail,
      removeToEmail,
      onAddToEmail,
      onClickSend,
      removeBccEmail,
      onAddBccEmail,
      onBlurCcEmailInput,
      onBlurAddToEmailInput,
      onUpdateEditorContent,
      onEnableCcEmailAdding,
      onEnableBccEmailAdding,
      onBlurBccEmailInput,
    };
  },
});
</script>

<style lang="scss" scoped>
.reply-editor-card {
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

  .reply-editor-content {
    display: flex;
    flex-direction: column;
    overflow-y: scroll;
    height: calc(100% - #{$replyHeaderHeight} - #{$replyFooterHeight});

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

    .reply-input-wrapper {
      width: 100%;
      display: flex;
      border-bottom: 1px solid $grey-50;

      padding: 4px 16px;

      .reply-input-label {
        color: $grey;
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;

        height: fit-content;
        padding-top: 8px;
        margin-right: 8px;
        min-width: 24px;

        &.no-padding {
          padding-top: 0px;
        }
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
