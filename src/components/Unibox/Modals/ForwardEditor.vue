<template>
  <q-card
    flat
    class="app-modal-card forward-editor-card"
    :class="{ maximized: maximized }"
  >
    <!-- Header -->
    <div class="app-modal-header">
      <h4 class="modal-header-text">
        Forward Email
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
      class="forward-editor-content hide-scrollbar"
      id="unibox-forward-editor-content"
    >
      <!-- To Field -->
      <div class="forward-input-wrapper">
        <p class="forward-input-label">
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

          <!-- Quasar Input for Adding Recipients -->
          <q-input
            dense
            autofocus
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
        class="forward-input-wrapper"
      >
        <p class="forward-input-label">
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
        class="forward-input-wrapper"
      >
        <p class="forward-input-label">
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

      <!-- Subject Field (hidden in UI) -->
      <div
        class="forward-input-wrapper"
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

      <!-- Forward Message WYSIWYG Editor Area -->
      <AppEditor
        v-model="htmlContent"
        placeholderText="Type your message here..."
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

      <!-- Send Forward Button on right -->
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
import { postApiCall, getApiCall } from 'src/utils/apiRequests.js';
import { stripHtmlTags } from 'src/utils/helperFunctions';
import { formatMessageDateTime } from 'src/utils/dates.js';

// constants
import { EMAIL_REGEX } from 'boot/constants';

export default defineComponent({
  name: 'UniboxForwardEditor',

  emits: ['onMaximize', 'updatePersistentStatus', 'onSuccessForward'],

  components: {
    AppEditor: defineAsyncComponent(
      () => import('components/Editor/AppEditor.vue'),
    ),
  },

  props: {
    maximized: {
      type: Boolean,
      default: false,
    },
    // The specific message object being forwarded
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

      // Mailbox selection ID (mandatory for forward API)
      senderMailboxId: null,

      // Plain text toggle
      sendPlainText: false,

      // To recipients (starts empty on forward)
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

    // Send button enabled state: requires To, message body, and subject
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

    // Auto-discover sender mailbox id by matching recipient email
    const lookupMailboxId = async (mailboxEmail) => {
      if (!mailboxEmail) return;

      try {
        const response = await getApiCall({
          includeWorkspace: true,
          endpoint: '/mailboxes',
          params: {
            limit: 10,
            search_text: mailboxEmail,
            attributes: 'id,email',
          },
        });

        const match = response?.data?.find(
          (m) => m.email?.toLowerCase() === mailboxEmail?.toLowerCase(),
        );

        if (match) {
          state.senderMailboxId = match.id;
        } else if (response?.data?.length > 0) {
          state.senderMailboxId = response.data[0].id;
        }
      } catch (err) {
        // Fallback gracefully without blocking
      }
    };

    // Pre-fill forward fields and construct standard forwarded message header
    const populateForwardData = () => {
      const msg = props.messageJson || {};
      const thread = props.threadJson || {};
      const parsedData = props.messageJson?.parsedData || {};

      // 1. Subject line (ensure Fwd: prefix)
      const baseSubject = msg.subject || thread.latest_subject || thread.subject || '';
      if (baseSubject) {
        state.subject = /^fwd:\s*/i.test(baseSubject) ? baseSubject : `Fwd: ${baseSubject}`;
      } else {
        state.subject = 'Fwd: (No Subject)';
      }

      // 2. Threading headers
      state.inReplyTo = parsedData.message_id || msg.provider_message_id || '';
      const refs = `${parsedData.message_id || ''} ${parsedData.references || ''}`.trim();
      state.references = refs || msg.provider_message_id || '';
      state.threadId = msg.provider_thread_id || '';

      // 3. Mailbox matching: check explicit id, otherwise lookup by recipient email
      if (msg.sender_mailbox_id) {
        state.senderMailboxId = msg.sender_mailbox_id;
      } else if (thread.mailbox_id) {
        state.senderMailboxId = thread.mailbox_id;
      } else if (props.contactData?.mailbox_id) {
        state.senderMailboxId = props.contactData.mailbox_id;
      } else if (msg.recipient) {
        lookupMailboxId(msg.recipient);
      }

      // 4. Construct standard forwarded message body
      const originalBody = parsedData.html
        || parsedData.text_as_html
        || parsedData.text
        || msg.message_preview
        || '';

      const formattedDate = formatMessageDateTime(msg.date);
      const sender = msg.sender || thread.email || '';
      const recipient = msg.recipient || thread.contact_name || '';

      const forwardHtml = `
        <p><br /></p>
        <div class="forward_message_wrapper" style="font-size: 14px; color: #222;">
          <div>---------- Forwarded message ---------</div>
          <div><b>From:</b> ${sender}</div>
          <div><b>Date:</b> ${formattedDate}</div>
          <div><b>Subject:</b> ${msg.subject || thread.subject || ''}</div>
          <div><b>To:</b> ${recipient}</div>
          <br />
          <div>${originalBody}</div>
        </div>
      `;

      state.htmlContent = forwardHtml;
      state.isHtmlContentEditable = true;
    };

    // Send forward API invocation
    const sendForwardEmail = async (htmlContent) => {
      try {
        state.isApiLoading = true;

        const contactMappingId = props.threadJson?.contact_mapping_id
          || props.contactData?.contact_mapping_id
          || props.threadJson?.id;

        const payload = {
          sender_mailbox_id: state.senderMailboxId,
          to: state.toEmails.join(', '),
          cc: state.ccEmails.join(', '),
          bcc: state.bccEmails.join(', '),
          subject: state.subject,
          message: htmlContent,
          attachments: state.attachments || [],
          has_attachments: (state.attachments || []).length > 0,
          send_plain_text: state.sendPlainText,
          in_reply_to: state.inReplyTo,
          references: state.references,
          thread_id: state.threadId,
        };

        // Post to unibox inbox thread forward endpoint
        await postApiCall({
          payload,
          includeWorkspace: true,
          endpoint: `/unibox/inbox/${contactMappingId}/forward`,
        });

        appContext.config.globalProperties.$toast({
          message: 'Email forwarded successfully.',
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

    // Primary send click handler
    const onClickSend = () => {
      sendForwardEmail(state.htmlContent);
    };

    onMounted(() => {
      populateForwardData();
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
      onBlurAddToEmailInput,
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
    height: $forwardHeaderHeight;
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
    height: $forwardFooterHeight;
    border-radius: 0px 0px 8px 8px !important;
  }
}
</style>
