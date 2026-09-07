<template>
  <q-card
    flat
    class="app-modal-card linkedin-reply-editor-card"
  >
    <!-- Header -->
    <div class="app-modal-header">
      <div class="header-title-column">
        <!--  -->
        <h4 class="modal-header-text">
          {{ contactDisplayName }}
        </h4>

        <!--  -->
        <div class="header-subtitle-row">
          <!-- Sequence Name -->
          <div
            v-if="campaignName"
            class="subtitle-item"
          >
            <LocalSvgIcon
              image="sequence"
              class="subtitle-icon"
            />

            <div
              class="campaign-name-text ellipsis"
              :title="campaignName"
            >
              {{ campaignName }}
            </div>
          </div>

          <!-- LinkedIn Profile URL -->
          <span
            v-if="campaignName && linkedinDisplayUrl"
            class="subtitle-separator"
          >
            •
          </span>

          <!-- LinkedIn Profile Link -->
          <a
            v-if="linkedinDisplayUrl"
            :href="linkedinUrl"
            target="_blank"
            class="subtitle-link"
          >
            <LocalSvgIcon
              image="linkedin"
              class="subtitle-icon"
            />
            {{ linkedinDisplayUrl }}
          </a>
        </div>
      </div>

      <q-space />

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

    <!-- Scrollable Chat Timeline & Composer Container -->
    <div
      ref="scrollContainerRef"
      class="linkedin-reply-editor-content hide-scrollbar"
    >
      <!-- Timeline Groups by Date -->
      <div
        v-for="group in dateGroupedMessages"
        :key="group.dateKey"
        class="timeline-date-group"
      >
        <!-- Date Header Divider -->
        <div class="timeline-date-divider">
          <span class="timeline-date-label">
            {{ group.dateLabel }}
          </span>
        </div>

        <!-- Messages list for this date -->
        <div class="timeline-messages-list">
          <div
            v-for="msg in group.messages"
            :key="msg.id"
            class="timeline-message-item"
          >
            <!-- Avatar Initial -->
            <div
              class="timeline-avatar"
              :style="msg.avatarPaletteStyle"
            >
              {{ msg.senderInitial }}
            </div>

            <!-- Message Details -->
            <div class="timeline-message-details">
              <div class="timeline-message-header">
                <span class="sender-name">
                  {{ msg.senderDisplayName }}
                </span>
                <span class="header-dot">•</span>
                <span class="message-time">
                  {{ msg.formattedTime }}
                </span>
              </div>

              <!-- Text Body -->
              <div
                v-if="msg.messageBody"
                class="timeline-message-body"
              >
                {{ msg.messageBody }}
              </div>

              <!-- Attachments Section -->
              <MessageCardAttachments
                v-if="msg.attachments?.length"
                :attachments="msg.attachments"
                class="timeline-message-attachments"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="dateGroupedMessages.length === 0"
        class="timeline-empty-state"
      >
        <p class="empty-text">
          No LinkedIn messages found for this contact.
        </p>
      </div>

      <!-- Sticky Reply Composer -->
      <div class="linkedin-composer-wrapper">
        <div class="linkedin-composer-card">
          <q-input
            v-model="replyText"
            type="textarea"
            borderless
            autogrow
            placeholder="Write your message here"
            class="composer-textarea"
            :input-style="{ minHeight: '70px', maxHeight: '160px' }"
          />

          <!-- Attachment Previews in Composer -->
          <EditorAttachments
            v-if="composerAttachments.length"
            :attachments="composerAttachments"
            class="composer-attachments-preview"
            @deleteAttachmentByIndex="deleteAttachmentByIndex"
          />

          <!-- Hidden File Input -->
          <input
            ref="fileInputRef"
            type="file"
            class="hidden"
            @change="onFileSelected"
          />

          <!-- Composer Actions Bar -->
          <div class="composer-actions">
            <!-- Send Button -->
            <q-btn
              no-caps
              unelevated
              label="Send"
              color="primary"
              class="composer-send-btn"
              :loading="loaders.isSending"
              :disable="disableSendButton"
              @click="onSendMessage"
            />

            <!-- Attachment Button (zip.svg) -->
            <q-btn
              flat
              dense
              round
              color="grey"
              class="composer-attach-btn"
              :loading="loaders.isUploadingAttachment"
              :disable="loaders.isSending || loaders.isUploadingAttachment"
              @click="triggerFileInput"
            >
              <LocalSvgIcon
                image="zip"
                classes="attach-icon"
              />
              <AppTooltip
                :content="`Attach file (Max ${TOTAL_ATTACHMENTS_SIZE_RESTRICTION}MB)`"
              >
              </AppTooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, watch, onMounted, getCurrentInstance,
} from 'vue';

// components
import AppTooltip from 'components/General/AppTooltip.vue';
import EditorAttachments from 'components/Editor/EditorAttachments.vue';
import MessageCardAttachments from 'components/Unibox/Conversation/MessageCards/MessageCardAttachments.vue';

// utils
import { postApiCall } from 'src/utils/apiRequests';
import { sendUniboxLinkedInReply } from 'src/utils/unibox';
import { formatTimelineDateHeader, formatMessageTime } from 'src/utils/dates';

// constants
import { WORKFLOW_STEP_TYPES } from 'boot/campaign-constants';
import { MAX_FILE_SIZE_IN_MB, TOTAL_ATTACHMENTS_SIZE_RESTRICTION } from 'boot/constants';
import { UNIBOX_EMAIL_TYPE, AVATAR_COLOR_PALETTES } from 'boot/unibox-constants';

export default defineComponent({
  name: 'LinkedInReplyEditor',

  components: {
    AppTooltip,
    EditorAttachments,
    MessageCardAttachments,
  },

  emits: ['updatePersistentStatus', 'onSuccessReply'],

  props: {
    messageJson: {
      type: Object,
      default: () => ({}),
    },
    threadJson: {
      type: Object,
      default: () => ({}),
    },
    contactData: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // Component reactive state
    const state = reactive({
      replyText: '',
      composerAttachments: [],
      localSentMessages: [],

      // Template refs
      fileInputRef: null,
      scrollContainerRef: null,

      loaders: {
        isSending: false,
        isUploadingAttachment: false,
      },
    });

    // Computed display name of contact
    const contactDisplayName = computed(() => {
      const data = props.contactData || {};
      const thread = props.threadJson || {};
      const msg = props.messageJson || {};

      if (data.first_name || data.last_name) {
        return `${data.first_name || ''} ${data.last_name || ''}`.trim();
      }

      return thread.contact_name
        || thread.name
        || msg.sender
        || 'LinkedIn Contact';
    });

    // Sequence / Campaign name
    const campaignName = computed(() => props.contactData?.seq_name || '');

    // Full LinkedIn Profile URL
    const linkedinUrl = computed(() => props.contactData?.linkedin_url || '');

    // Formatted/Shortened LinkedIn URL display text
    const linkedinDisplayUrl = computed(() => {
      const url = linkedinUrl.value;

      if (!url) return '';

      const match = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
      return match ? `.../${match[1]}` : url;
    });

    // Disable send button condition
    const disableSendButton = computed(() => {
      // reply text check
      const hasText = Boolean(state.replyText.trim());

      // files check
      const hasFiles = state.composerAttachments.length > 0;

      //
      return (!hasText && !hasFiles) || state.loaders.isUploadingAttachment;
    });

    // Helper to calculate avatar palette style
    const getAvatarPalette = (nameOrEmail) => {
      const str = String(nameOrEmail || 'L');
      let sum = 0;
      for (let i = 0; i < str.length; i += 1) {
        sum += str.charCodeAt(i);
      }
      const palette = AVATAR_COLOR_PALETTES[sum % AVATAR_COLOR_PALETTES.length];
      return {
        backgroundColor: palette.bg,
        color: palette.color,
      };
    };

    // Date-grouped chat messages timeline
    const dateGroupedMessages = computed(() => {
      const rawMessages = props.contactData?.messages || [];
      const singleMessage = props.messageJson;

      let list = [];

      if (Array.isArray(rawMessages) && rawMessages.length > 0) {
        // Filter strictly for LinkedIn direct messages
        list = rawMessages.filter(
          (m) => m.step_type === WORKFLOW_STEP_TYPES.LINKEDIN_MESSAGE,
        );
      } else if (
        singleMessage
        && (singleMessage.message || singleMessage.message_preview)
      ) {
        list = [singleMessage];
      }

      // Merge locally sent messages
      const allMessages = [...list, ...state.localSentMessages];

      // Sort chronologically (oldest to newest)
      allMessages.sort((a, b) => {
        const timeA = new Date(a.date || 0).getTime();
        const timeB = new Date(b.date || 0).getTime();
        return timeA - timeB;
      });

      // Group by calendar date key
      const groupsMap = new Map();

      //
      allMessages.forEach((msg) => {
        const dateVal = msg.date || new Date().toISOString();
        const dateKey = new Date(dateVal).toISOString().split('T')[0] || 'general';

        // reply from our system
        const isThreadReply = msg.type === UNIBOX_EMAIL_TYPE.THREAD_REPLY;
        const isReceived = !isThreadReply && (
          msg.type === UNIBOX_EMAIL_TYPE.RECEIVED
        );

        let senderName = '';

        if (isReceived) {
          senderName = contactDisplayName.value;
        } else {
          const contactOrSender = msg.sender
            || props.contactData?.mailbox_email;

          senderName = `You (${contactOrSender})`;
        }

        //
        const senderInitial = senderName.trim().charAt(0).toUpperCase() || 'U';
        const avatarPaletteStyle = getAvatarPalette(senderName);

        //
        const formattedTime = formatMessageTime(dateVal);
        const messageBody = msg.message_preview || '';
        const attachments = msg.attachments || [];

        const item = {
          id: msg.id || msg.message_id || `msg-${Math.random()}`,
          senderDisplayName: senderName,
          senderInitial,
          avatarPaletteStyle,
          formattedTime,
          messageBody,
          attachments,
        };

        if (!groupsMap.has(dateKey)) {
          groupsMap.set(dateKey, {
            dateKey,
            dateLabel: formatTimelineDateHeader(dateVal),
            messages: [],
          });
        }

        groupsMap.get(dateKey).messages.push(item);
      });

      return Array.from(groupsMap.values());
    });

    const scrollToBottom = () => {
      setTimeout(() => {
        if (state.scrollContainerRef) {
          state.scrollContainerRef.scrollTop = state.scrollContainerRef.scrollHeight;
        }
      }, 200);
    };

    // Watch reply text and attachments to update persistent status modal lock
    const hasDraftContent = computed(() => (
      Boolean(state.replyText.trim()) || state.composerAttachments.length > 0
    ));

    watch(hasDraftContent, (newVal) => {
      emit('updatePersistentStatus', newVal);
    });

    // Attachment file input triggers
    const triggerFileInput = () => {
      if (state.fileInputRef) {
        state.fileInputRef.click();
      }
    };

    const deleteAttachmentByIndex = (index) => {
      state.composerAttachments.splice(index, 1);
    };

    // Upload attachment to S3
    const uploadAttachmentFile = async (file) => {
      if (!file) return;

      // Check single file size limit
      if (file.size > MAX_FILE_SIZE_IN_MB * 1024 * 1024) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: `File size cannot exceed ${MAX_FILE_SIZE_IN_MB}MB.`,
        });
        return;
      }

      // Check cumulative attachments size limit
      const currentTotalBytes = state.composerAttachments.reduce(
        (sum, att) => sum + (att.file_size || 0),
        0,
      );

      if (
        currentTotalBytes + file.size
        > TOTAL_ATTACHMENTS_SIZE_RESTRICTION * 1024 * 1024
      ) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: `Max ${TOTAL_ATTACHMENTS_SIZE_RESTRICTION}MB total attachments allowed.`,
        });
        return;
      }

      state.loaders.isUploadingAttachment = true;

      try {
        const res = await postApiCall({
          includeWorkspace: true,
          endpoint: '/unibox/get-attachment-signed-url',
          payload: {
            filename: file.name,
            content_type: file.type,
          },
        });

        const requestUrl = res?.request_url;
        const fileUrl = res?.file_url;

        if (!requestUrl || !fileUrl) {
          throw new Error('Signed upload URL was not returned by server');
        }

        const xhr = new XMLHttpRequest();
        xhr.open('PUT', requestUrl, true);
        if (file.type) {
          xhr.setRequestHeader('Content-Type', file.type);
        }

        xhr.onload = () => {
          state.loaders.isUploadingAttachment = false;

          state.composerAttachments.push({
            file_name: file.name,
            file_url: fileUrl,
            file_size: file.size,
            content_type: file.type,
          });

          //
          appContext.config.globalProperties.$toast({
            message: 'Attachment uploaded successfully.',
          });
        };

        xhr.onerror = () => {
          state.loaders.isUploadingAttachment = false;

          //
          appContext.config.globalProperties.$toast({
            warning: true,
            message: 'Failed to upload attachment.',
          });
        };

        xhr.send(file);
      } catch (err) {
        state.loaders.isUploadingAttachment = false;

        appContext.config.globalProperties.$toast({
          warning: true,
          message: err?.message || 'Failed to get attachment upload URL.',
        });
      }
    };

    const onFileSelected = (event) => {
      const file = event.target?.files?.[0];
      if (file) {
        uploadAttachmentFile(file);
      }
      if (event.target) {
        event.target.value = '';
      }
    };

    // Send LinkedIn reply via backend API
    const onSendMessage = async () => {
      const content = state.replyText.trim();
      const attachmentsToSend = [...state.composerAttachments];

      if ((!content && !attachmentsToSend.length) || state.loaders.isSending) return;

      const contactMappingId = props.contactData?.contact_mapping_id
        || props.threadJson?.contact_mapping_id
        || props.messageJson?.contact_mapping_id;

      if (!contactMappingId) {
        //
        appContext.config.globalProperties.$toast({
          warning: true,
          message: 'Contact mapping ID is missing. Cannot send message.',
        });

        return;
      }

      try {
        state.loaders.isSending = true;

        await sendUniboxLinkedInReply({
          contactMappingId,
          message: content,
          attachments: attachmentsToSend,
        });

        state.replyText = '';
        state.composerAttachments = [];

        emit('updatePersistentStatus', false);
        emit('onSuccessReply');

        appContext.config.globalProperties.$toast({
          message: 'LinkedIn message sent successfully',
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error?.message || 'Failed to send LinkedIn message',
        });
      } finally {
        state.loaders.isSending = false;
      }
    };

    onMounted(() => {
      scrollToBottom();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      campaignName,
      linkedinUrl,
      disableSendButton,
      contactDisplayName,
      linkedinDisplayUrl,
      dateGroupedMessages,

      // methods
      onSendMessage,
      onFileSelected,
      triggerFileInput,
      deleteAttachmentByIndex,

      // constants
      MAX_FILE_SIZE_IN_MB,
      TOTAL_ATTACHMENTS_SIZE_RESTRICTION,
    };
  },
});
</script>

<style lang="scss" scoped>
.linkedin-reply-editor-card {
  position: relative;
  max-width: 600px;
  $modalHeaderHeight: 68px;

  // sm min
  @media (min-width: $breakpoint-sm-min) {
    width: 600px;
    min-height: 100%;

    display: flex;
    flex-direction: column;
  }

  @media (min-width: 601px) {
    border-radius: 8px 0px 0px 8px !important;
  }

  .app-modal-header {
    height: $modalHeaderHeight;
    border-bottom: 0px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      height: auto;
      flex-wrap: wrap;
    }

    .header-title-column {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .modal-header-text {
      }

      .header-subtitle-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: $grey;

        // icon
        .subtitle-icon {
          width: 12px;
          height: 12px;
        }

        //
        .subtitle-item {
          display: flex;
          align-items: center;
          gap: 4px;

          .campaign-name-text {
            color: $grey;
            max-width: 160px;
          }
        }

        .subtitle-separator {
          color: $grey-300;
        }

        //
        .subtitle-link {
          gap: 4px;
          display: flex;
          align-items: center;
          color: $grey-700;
          text-decoration: none;

          &:hover {
            color: $primary;
            text-decoration: underline;
          }
        }
      }
    }
  }

  .linkedin-reply-editor-content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    background-color: $white;

    .timeline-date-group {
      width: 100%;

      .timeline-date-divider {
        background: rgba(var(--grey-50-rgb), 0.5);
        border-top: 1px solid $grey-50;
        border-bottom: 1px solid $grey-50;
        padding: 4px 20px;

        backdrop-filter: blur(100px);

        position: sticky;
        top: 0;
        z-index: 1;

        .timeline-date-label {
          font-size: 12px;
          font-weight: 600;
          color: $grey-400;
          letter-spacing: 0.72px;
          text-transform: uppercase;
        }
      }

      .timeline-messages-list {
        padding: 8px 0;

        .timeline-message-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 12px 20px;

          .timeline-avatar {
            width: 36px;
            height: 36px;
            min-width: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: 600;
            user-select: none;
          }

          .timeline-message-details {
            flex: 1;
            min-width: 0;

            .timeline-message-header {
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 4px;

              .sender-name {
                font-size: 14px;
                font-weight: 600;
                color: $black;
              }

              .header-dot {
                font-size: 12px;
                color: $grey-400;
              }

              .message-time {
                font-size: 13px;
                color: $grey;
                line-height: 16px;
              }
            }

            .timeline-message-body {
              font-size: 14px;
              line-height: 20px;
              color: $black;
              white-space: pre-wrap;
              word-break: break-word;
            }

            .timeline-message-attachments {
              padding: 8px 0 0 0;
            }
          }
        }
      }
    }

    .timeline-empty-state {
      padding: 40px 20px;
      text-align: center;

      .empty-text {
        font-size: 14px;
        color: $grey;
      }
    }

    .linkedin-composer-wrapper {
      position: sticky;
      bottom: 0;
      background: $white;
      padding: 16px 20px;
      border-top: 1px solid #edf0f2;
      z-index: 5;
      margin-top: auto;

      .linkedin-composer-card {
        border: 1px solid rgba(var(--primary-rgb), 0.1);
        box-shadow: 0 0 12px 0 rgba(var(--primary-rgb), 0.05);

        border-radius: 12px;
        padding: 0px 14px 10px 14px;
        background: $white;

        gap: 8px;
        display: flex;
        flex-direction: column;

        transition: border-color 0.2s ease, box-shadow 0.2s ease;

        &:focus-within {
          border-color: $primary;
          box-shadow: 0 0 12px 0 rgba(var(--primary-rgb), 0.1);
        }

        .composer-textarea {
          font-size: 14px;
          line-height: 20px;
        }

        // child component and thus important styles are enforced with !important
        .composer-attachments-preview {
          padding: 8px 0 !important;
          border-top: 1px dashed $grey-50 !important;
          background: transparent !important;
        }

        // composer actions
        .composer-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: flex-start;

          .composer-attach-btn {
            width: 32px;
            height: 32px;
            color: $grey;

            :deep(.attach-icon) {
              width: 24px;
              height: 24px;
            }
          }
        }
      }
    }
  }
}
</style>
