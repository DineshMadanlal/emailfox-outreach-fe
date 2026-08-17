<template>
  <!-- email preview modal card wrapper -->
  <q-card flat class="app-modal-card email-preview-card">
    <!-- modal main content -->
    <div class="app-modal-content custom-scrollbar">
      <div class="email-preview-wrapper">

        <!-- left section: configuration controls -->
        <div class="email-preview-left-section">
          <!-- header text -->
          <h4 class="modal-header-text">
            Email Preview
          </h4>

          <!-- send to contact section -->
          <div class="control-section">
            <label class="section-label">
              Send To
            </label>

            <!-- select campaign contacts dropdown -->
            <SelectCampaignContacts
              preSelectFirstOption

              :borderless="true"
              :outlined="false"
              :campaignId="campaignId"

              v-model="form.contactId"

              class="full-width"
              placeholder-text="Select contact"

              @update:model-value="onSelectionChange"
            />
          </div>

          <!-- sender email section -->
          <div class="control-section">
            <label class="section-label">
              Sender Email
            </label>

            <!-- select campaign mailbox dropdown -->
            <SelectCampaignMailbox
              preSelectFirstOption

              :borderless="true"
              :outlined="false"
              :campaignId="campaignId"

              v-model="form.senderMailboxId"

              class="full-width"
              placeholder-text="Select sender email"
              @update:model-value="onSelectionChange"
            />
          </div>
        </div>

        <!-- right section: live preview canvas -->
        <div class="email-preview-right-section">
          <!-- preview control bar header -->
          <div class="preview-control-bar">
            <!-- web / mobile toggle button group -->
            <div class="view-mode-toggle-group">
              <!-- Web -->
              <q-btn
                flat
                dense
                no-caps
                unelevated

                color="primary"
                class="toggle-btn"

                :class="{ 'active-mode': viewMode === 'web' }"
                @click="viewMode = 'web'"
              >
                <div class="text-black toggle-text">
                  Web
                </div>
              </q-btn>

              <!-- Mobile -->
              <q-btn
                flat
                dense
                no-caps
                unelevated

                color="primary"
                class="toggle-btn"

                :class="{ 'active-mode': viewMode === 'mobile' }"
                @click="viewMode = 'mobile'"
              >
                <div class="text-black toggle-text">
                  Mobile
                </div>
              </q-btn>
            </div>

            <!-- modal close button -->
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

          <!-- email canvas scroll container -->
          <div class="email-canvas-container">
            <div
              class="email-preview-card-body"
              :class="{
                'mode-web': viewMode === 'web',
                'mode-mobile': viewMode === 'mobile'
              }"
            >
              <!-- loader state -->
              <div
                v-if="loader.isPreviewLoading"
                class="preview-loader-wrapper"
              >
                <ApiLoader
                  show
                  size="30px"
                />
              </div>

              <!-- email message preview content -->
              <template
                v-else-if="emailPreviewData.subject || emailPreviewData.message"
              >
                <!-- email subject line -->
                <div class="email-subject-line">
                  {{ emailPreviewData.subject }}
                </div>

                <!-- sender meta skeleton placeholder header -->
                <div class="email-sender-meta">
                  <div
                    class="sender-avatar flex items-center
                    justify-center bg-grey-3 rounded-circle"
                  >
                    <q-icon name="person" size="20px" color="grey-6" />
                  </div>

                  <div class="meta-skeleton-lines flex column gap-xs">
                    <div class="skeleton-line-long bg-grey-3 rounded-borders" />
                    <div class="skeleton-line-short bg-grey-2 rounded-borders" />
                  </div>
                </div>

                <!-- body html content -->
                <div
                  class="email-body-content"
                  v-html="emailPreviewData.message"
                />
              </template>

              <!-- empty state -->
              <div
                v-else
                class="empty-preview-placeholder"
              >
                <q-icon
                  name="mark_email_read"
                  size="48px"

                  class="email-read-icon"
                />

                <p class="preview-title-text">
                  No Email Preview
                </p>
                <p class="preview-desc-text">
                  Select a recipient contact and sender email to fetch email preview.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>

    <!-- modal footer -->
    <div class="app-modal-footer">
      <q-btn
        no-caps
        unelevated
        color="primary"
        label="Send Test Email"
        class="send-test-btn text-weight-medium"
        :loading="loader.isSending"
        :disable="!form.contactId || !form.senderMailboxId"
        @click="onSendTestEmail"
      />
    </div>

  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance, onMounted, computed,
} from 'vue';

// vue router
import { useRoute } from 'vue-router';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import SelectCampaignMailbox from 'components/Dropdown/SelectCampaignMailbox.vue';
import SelectCampaignContacts from 'components/Dropdown/SelectCampaignContacts.vue';

// utils
import { postApiCall } from 'src/utils/apiRequests';
import { convertStringToNumber } from 'src/utils/numbers';

export default defineComponent({
  name: 'EmailPreview',

  components: {
    ApiLoader,
    SelectCampaignContacts,
    SelectCampaignMailbox,
  },

  props: {
    message: {
      type: String,
      default: '',
    },
    subject: {
      type: String,
      default: '',
    },
  },

  emits: ['testEmailsent'],

  setup(props, { emit }) {
    // route
    const $route = useRoute();

    // instance
    const { appContext } = getCurrentInstance();

    // reactive state
    const state = reactive({
      // active view mode ('web' | 'mobile')
      viewMode: 'web',

      // selection form values (only primitive IDs stored)
      form: {
        contactId: null,
        senderMailboxId: null,
      },

      // preview api data
      emailPreviewData: {
        subject: '',
        body: '',
        message: '',
      },

      // api loaders
      loader: {
        isPreviewLoading: false,
        isSending: false,
      },
    });

    // computed
    const campaignId = computed(() => convertStringToNumber($route.params.campaignId));

    // fetch email preview from backend endpoint
    const fetchEmailPreview = async () => {
      if (!state.form.contactId || !state.form.senderMailboxId || !campaignId.value) {
        return;
      }

      try {
        state.loader.isPreviewLoading = true;

        const response = await postApiCall({
          includeWorkspace: true,
          endpoint: `/sequences/${campaignId.value}/preview-email`,
          payload: {
            subject: props.subject,
            message: props.message,
            contact_id: state.form.contactId,
            sender_mailbox_id: state.form.senderMailboxId,
          },
        });

        if (response) {
          state.emailPreviewData = response;
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to fetch email preview',
        });
      } finally {
        state.loader.isPreviewLoading = false;
      }
    };

    // selection change listener
    const onSelectionChange = () => {
      if (state.form.contactId && state.form.senderMailboxId) {
        fetchEmailPreview();
      }
    };

    // send test email handler
    const onSendTestEmail = async () => {
      if (!state.form.contactId || !state.form.senderMailboxId) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: 'Please select both contact and sender email',
        });
        return;
      }

      try {
        state.loader.isSending = true;

        await postApiCall({
          includeWorkspace: true,
          endpoint: `/sequences/${campaignId.value}/send-test-email`,
          payload: {
            message: props.message,
            subject: props.subject,
            contact_id: state.form.contactId,
            mailbox_id: state.form.senderMailboxId,
          },
        });

        appContext.config.globalProperties.$toast({
          success: true,
          message: 'Test email sent successfully',
        });

        emit('testEmailsent');
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to send test email',
        });
      } finally {
        state.loader.isSending = false;
      }
    };

    onMounted(() => {
      if (state.form.contactId && state.form.senderMailboxId) {
        // fetch email preview on initial mount if both selections are already made
        fetchEmailPreview();
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      campaignId,

      // methods
      onSelectionChange,
      fetchEmailPreview,
      onSendTestEmail,
    };
  },
});
</script>

<style lang="scss" scoped>
/* email preview card modal shell */
.email-preview-card {
  max-width: 1120px;
  display: flex;
  flex-direction: column;

  /* app modal content area */
  .app-modal-content {
    flex: 1;
    display: flex;
    overflow: hidden;
    padding: 0;

    .email-preview-wrapper {
      width: 100%;
      height: 100%;

      display: flex;
      background: rgba(var(--primary-rgb), 0.05);

      /* left section styling */
      .email-preview-left-section {
        width: 100%;
        max-width: 400px;
        background-color: $white;
        border-right: 1px solid $grey-50;

        .modal-header-text {
          color: $black;
          font-size: 18px;
          font-weight: 600;
          padding: 20px;
          border-bottom: 1px solid $grey-50;
        }

        .control-section {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;

          .section-label {
            color: $black;
            font-size: 16px;
            font-weight: 600;
          }
        }
      }

      /* right section styling */
      .email-preview-right-section {
        width: 100%;
        padding: 20px;
        position: relative;

        .preview-control-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;

          .view-mode-toggle-group {
            border-radius: 6px;
            background: $white;

            .toggle-btn {
              font-size: 13px;
              color: $black;
              border-radius: 0px;
              padding: 4px 16px;
              border-radius: 6px;

              min-height: 32px;
              transition: all 0.2s ease;

              &.active-mode {
                background-color: rgba(var(--primary-rgb), 0.1);
                border: 1px solid rgba(var(--primary-rgb), 0.3);
                border-radius: 6px;

                .toggle-text {
                  font-weight: 600;
                }
              }
            }
          }
        }

        /* email canvas preview container */
        .email-canvas-container {
          width: 100%;
          margin-top: 30px;

          display: flex;
          justify-content: center;

          .email-preview-card-body {
            width: 100%;
            padding: 16px;
            min-height: 380px;
            border-radius: 12px;
            border: 1px solid $grey-50;
            background-color: $white;
            transition: width 0.3s ease, max-width 0.3s ease;

            &.mode-web {
              max-width: 655px;
            }

            &.mode-mobile {
              max-width: 390px;
            }

            .sender-avatar {
              width: 40px;
              height: 40px;
            }

            .meta-skeleton-lines {
              .skeleton-line-long {
                width: 160px;
                height: 8px;
              }

              .skeleton-line-short {
                width: 80px;
                height: 6px;
                margin-top: 4px;
              }
            }

            .preview-loader-wrapper {
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .email-subject-line {
              font-size: 16px;
              font-weight: 600;
              color: $black;
            }

            .email-sender-meta {
              margin-top: 16px;
              margin-bottom: 32px;

              display: flex;
              align-items: center;
              gap: 12px;
            }

            .empty-preview-placeholder {
              width: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;

              padding: 40px 16px;

              .email-read-icon {
                color: $grey-200;
              }

              .preview-title-text {
                font-size: 16px;
                font-weight: 500;
                color: $grey-300;
                margin-top: 12px;
                margin-bottom: 8px;
              }

              .preview-desc-text {
                font-size: 13px;
                color: $grey;
                text-align: center;
              }
            }
          }
        }
      }
    }
  }

  /* app modal footer at the bottom */
  .app-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #eaedf3;
    background-color: #ffffff;
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .send-test-btn {
      border-radius: 8px;
      min-width: 150px;
      height: 40px;
      background-color: #1976d2;
    }
  }

  /* responsive mobile view styling */
  @media (max-width: $breakpoint-xs-max) {
    max-height: 90vh;

    .app-modal-content {
      overflow-y: auto;

      .email-preview-wrapper {
        height: auto;
        flex-direction: column;

        .email-preview-left-section {
          width: 100%;
          max-width: unset;
          border-right: none;
          border-bottom: 1px solid $grey-50;
        }

        .email-preview-right-section {
          width: 100%;
          padding: 16px 12px;

          .email-preview-card-body {
            &.mode-web, &.mode-mobile {
              max-width: 100%;
            }
          }
        }
      }
    }

    .app-modal-footer {
      padding: 12px 16px;
      justify-content: center;

      .send-test-btn {
        width: 100%;
      }
    }
  }
}
</style>
