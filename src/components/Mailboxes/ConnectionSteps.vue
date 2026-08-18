<template>
  <q-card flat class="connection-steps">
    <!-- header -->
    <div
      v-if="isOAuthProvider"
      class="connection-steps-header"
    >
      <div>
        <!-- header -->
        <p class="connection-header-text">
          {{ providerHeader }}
        </p>
      </div>

      <q-space />

      <div class="connection-icons-wrapper">
        <LocalSvgIcon
          :image="providerIcon"
          class="connection-provider-icon"
        />

        <LocalSvgIcon
          image="exchange"
          class="exchange-icon"
        />

        <img
          src="https://cdn.outreachfox.ai/landing/outreachfox-icon.png?v=4"
          class="connection-provider-icon"
        />
      </div>
    </div>

    <!-- content -->
    <div class="connection-steps-content">
      <!-- For Google -->
      <ul
        class="connect-provider-help-list"
      >
        <li
          v-for="(currentStep, index) of connectionSteps"
          :key="`provider-connection-${index}`"
          class="connect-each-help-section"
        >
          <div class="help-details">
            <p class="help-number-text">
              {{ index + 1 }}
            </p>

            <div>
              <p v-html="currentStep.html" class="help-text"></p>

              <div
                class="client-id-wrapper"
                v-if="currentStep.clientId"
              >
                <p class="client-id-text">
                  {{ currentStep.clientId }}
                </p>
                <!-- Copy Button -->
                <q-btn
                  flat
                  dense
                  no-caps
                  unelevated

                  color="primary"

                  @click="copyClientId(currentStep.clientId)"
                >
                  <LocalSvgIcon image="copy" class="copy-icon" />
                </q-btn>
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Footer -->
    <div class="connection-steps-footer">
      <!-- Back button -->
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        label="Back"
        color="primary"

        class="light-primary-btn"

        @click="$emit('goBack')"
      />

      <!-- Connect Button -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        :label="connectButtonCta"
        :loading="isConnectApiLoading"

        @click="onConnect"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  computed, defineComponent, getCurrentInstance, toRefs, reactive,
} from 'vue';

// vue router
import { useRouter } from 'vue-router';

// quasar
import { copyToClipboard } from 'quasar';

// utils
import { isMainApp } from 'src/utils/applyBranding.js';
import { connectGoogleAccount, connectOutlookAccount } from 'src/utils/domainMailboxesApi.js';

// constants
import { ESP_PROVIDERS, GOOGLE_API } from 'boot/mailbox-constants';

export default defineComponent({
  name: 'ConnectionSteps',

  emits: ['goBack'],

  props: {
    mailboxDataJson: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    // router
    const $router = useRouter();

    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isConnectApiLoading: false,
    });

    // computed
    const isOAuthProvider = computed(() => (
      props.mailboxDataJson.value === ESP_PROVIDERS.GMAIL
      || props.mailboxDataJson.value === ESP_PROVIDERS.OUTLOOK
    ));

    const isGoogleOauth = computed(() => props.mailboxDataJson.value === ESP_PROVIDERS.GMAIL);
    const isOutlookOauth = computed(() => props.mailboxDataJson.value === ESP_PROVIDERS.OUTLOOK);

    const providerHeader = computed(() => {
      if (isGoogleOauth.value) {
        return 'Connect your Gsuite account';
      } if (isOutlookOauth.value) {
        return 'Connect your Outlook account';
      }

      return 'Connect your Mailbox';
    });

    const providerIcon = computed(() => {
      if (isGoogleOauth.value) {
        return 'gmail';
      } if (isOutlookOauth.value) {
        return 'outlook';
      }

      return 'other-smtp';
    });

    const connectButtonCta = computed(() => {
      if (isGoogleOauth.value) {
        return 'Connect with Google';
      } if (isOutlookOauth.value) {
        return 'Connect with Outlook';
      }

      return 'Connect';
    });

    const appName = computed(() => {
      const isPrimaryPlatform = isMainApp();
      if (isPrimaryPlatform) {
        return 'Coldbean.ai';
      }

      return 'the app';
    });

    const googleConnectionSteps = computed(() => {
      const steps = [
        {
          html: `Go to “<a href="https://admin.google.com" target="_blank" class="text-weight-medium">admin.google.com</a>”
          using a Super Admin account.`,
        },
        {
          html: `Click the menu (<span class="text-weight-medium"
          >☰</span>) → Security → Show more if needed.`,
        },
        {
          html: 'Under Security, select API Controls → Manage Third-Party App Access.',
        },
        {
          html: 'Add new app by clicking “<span class="text-weight-medium">Configure New App</span>”.',
        },
        {
          html: `Copy the below client-ID to search for "${appName.value}" & click “Search”`,
          clientId: GOOGLE_API.CLIENT_ID,
        },
        {
          html: `Select ${appName.value} → choose Trusted → click Configure.`,
        },
      ];

      return steps;
    });

    const outlookConnectionSteps = computed(() => {
      const steps = [
        {
          html: 'Sign in to Microsoft 365 Admin Center (<a href="https://admin.microsoft.com" target="_blank">admin.microsoft.com</a>).',
        },
        {
          html: 'Go to Users → Active users & select the user you want to connect.',
        },
        {
          html: 'Open the Mail Tab → Manage email apps.',
        },
        {
          html: 'Enable Authenticated SMTP (SMTP AUTH) and IMAP',
        },
        {
          html: 'Click Save changes and allow a few minutes for settings to take effect.',
        },
        {
          html: 'Return Here and Click Connect Account to Finish',
        },
      ];

      return steps;
    });

    const connectionSteps = computed(() => {
      if (isGoogleOauth.value) {
        return googleConnectionSteps.value;
      } if (isOutlookOauth.value) {
        return outlookConnectionSteps.value;
      }

      return [];
    });

    // methods
    const copyClientId = (clientId) => {
      // copy api key using clipboard
      copyToClipboard(clientId).then(() => {
        // show toast
        appContext.config.globalProperties.$toast({
          message: 'Client ID copied successfully',
        });
      });
    };

    const onConnect = async () => {
      try {
        state.isConnectApiLoading = true;

        const currentOrigin = window.location.origin;

        const redirectUrl = encodeURIComponent(`${currentOrigin}/outreach/mailboxes`);

        let response;

        if (isGoogleOauth.value) {
          response = await connectGoogleAccount(redirectUrl);
        } else if (isOutlookOauth.value) {
          response = await connectOutlookAccount(redirectUrl);
        }

        // move to the mailbox by ID page
        $router.push(`/outreach/mailbox/${response?.mailbox_id}`);

        appContext.config.globalProperties.$toast({
          message: `${response?.email} connected successfully`,
        });
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isConnectApiLoading = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed
      appName,
      providerIcon,
      providerHeader,
      isOAuthProvider,
      connectButtonCta,
      connectionSteps,

      // methods
      copyClientId,
      onConnect,
    };
  },
});
</script>

<style lang="scss" scoped>
.connection-steps {
  width: 100%;
  max-width: 720px;
  height: fit-content;

  border-radius: 8px;
  border: 1px solid $grey-50;
  background: $white;

  .connection-steps-header {
    background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 0.12%,
    rgba(var(--primary-rgb), 0.05) 28.02%,
    rgba(255, 255, 255, 0.05) 51.27%,
    rgba(var(--negative-rgb), 0.05) 82.78%,
    rgba(255, 255, 255, 0.05) 100.34%
  );

    padding: 24px 32px;

    display: flex;
    align-items: center;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }

    .connection-header-text {
      color: $black;
      font-size: 18px;
      font-style: normal;
      font-weight: 600;
      line-height: normal;

      @media (max-width: $breakpoint-xs-max) {
        font-size: 16px;
      }
    }

    .connection-icons-wrapper {
      gap: 15px;
      display: flex;
      align-items: center;

      .connection-provider-icon {
        height: 44px;
        width: 100%;
        max-width: 44px;

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          height: 32px;
          max-width: 32px;
        }
      }

      .exchange-icon {
        min-width: 16px;
      }
    }
  }

  .connection-steps-content {
    padding: 32px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }

    .connect-provider-help-list {
      margin: 0;
      padding: 0;
      list-style: none;

      display: grid;
      grid-row-gap: 24px;

      .connect-each-help-section {
        width: 100%;

        .help-details {
          gap: 12px;
          display: flex;

          :deep(.help-text) {
            a {
              font-weight: 500;
              color: $primary;
              text-decoration: none;

              &:hover {
                text-decoration: underline;
              }
            }
          }

          .client-id-wrapper {
            display: flex;
            align-items: center;
            margin-top: 12px;
            padding: 16px;

            border-radius: 8px;
            border: 1px solid rgba(var(--primary-rgb), 0.05);
            background: rgba(var(--primary-rgb), 0.04);

            gap: 30px;

            // xs max
            @media (max-width: $breakpoint-xs-max) {
              padding: 12px;
              gap: 12px;
            }

            .client-id-text {
              color: $primary;
              font-size: 14px;
              font-weight: 500;
              line-height: 24px; /* 171.429% */
            }

            :deep(.copy-icon) {
              @include svg-icon-stroke('path, circle, rect', $primary);
            }
          }

          .help-number-text {
            color: $grey;
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: 16px;

            padding: 2px 5px;
            width: 20px;
            border-radius: 50%;

            height: fit-content;
            border: 1px solid $grey-100;

            display: flex;
            align-items: center;
            justify-content: center;
          }
        }
      }
    }
  }

  .connection-steps-footer {
    padding: 20px 32px;
    border-top: 1px solid $grey-50;

    display: flex;
    align-items: center;
    gap: 12px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }
  }
}
</style>
