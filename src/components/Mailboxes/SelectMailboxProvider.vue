<template>
  <!-- Wrapper -->
  <div class="select-mailboxwrapper">
    <p class="select-mailboxheader-text">
      Select Your Mailbox Provider
    </p>

    <p class="select-mailboxdesc-text">
      Pick your email service to set up and connect your mailbox.
    </p>

    <!--  -->
    <div class="all-mailbox-providers-grid">
      <q-card
        flat
        class="mailbox-provider-card"

        v-for="(provider, index) of mailboxProviders"
        :key="`mailbox-provider-${index}`"

        @click="onAddMailbox(provider)"
      >
        <!-- Icon -->
        <LocalSvgIcon
          :image="provider.icon"
          :class="`mailbox-provider-icon ${provider.iconClasses || ''}`"
        />

        <!-- Provider details -->
        <div class="provider-details">
          <p class="provider-label-text">
            {{ provider.label }}
          </p>

          <p class="provider-desc-text">
            {{ provider.description }}
          </p>
        </div>

        <LocalSvgIcon
          image="plain-down-arrow"
          class="right-arrow-icon"
        />
      </q-card>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// constants
import { ESP_PROVIDERS } from 'boot/mailbox-constants';

export default defineComponent({
  name: 'SelectMailboxProvider',

  emits: ['onCompleteStep'],

  setup(props, { emit }) {
    // computed
    const mailboxProviders = computed(() => {
      const providers = [
        // gmail
        {
          label: 'Google Workspace',
          value: ESP_PROVIDERS.GMAIL,
          description: 'Google auth will open. Quickest way to add mailboxes',
          icon: 'gmail',
        },
        // outlook
        {
          label: 'Office 365 / Outlook',
          value: ESP_PROVIDERS.OUTLOOK,
          description: 'Microsoft auth will open. Quickest way to add mailboxes',
          icon: 'outlook',
        },
        // {
        //   label: 'IMAP / SMTP',
        //   value: ESP_PROVIDERS.CUSTOM_SMTP,
        //   description: 'Set up your mailbox using IMAP/SMTP settings',
        //   icon: 'smtp',
        //   iconClasses: 'smtp-icon',
        // },
      ];

      return providers;
    });

    // methods
    const onAddMailbox = (provider) => {
      emit('onCompleteStep', provider);
    };

    return {
      // computed
      mailboxProviders,

      // methods
      onAddMailbox,
    };
  },
});
</script>

<style lang="scss" scoped>
.select-mailboxwrapper {
  width: 100%;
  max-width: 560px;

  .select-mailboxheader-text {
    color: $black;
    text-align: center;
    font-size: 18px;
    font-weight: 600;
  }

  .select-mailboxdesc-text {
    color: rgba($color: var(--black-rgb), $alpha: 0.8);
    text-align: center;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;

    margin-top: 8px;
    margin-bottom: 32px;
  }

  .all-mailbox-providers-grid {
    width: 100%;
    display: grid;
    grid-row-gap: 32px;

    .mailbox-provider-card {
      display: flex;
      border-radius: 8px;
      border: 1px solid $grey-50;
      background: $white;
      padding: 20px;
      cursor: pointer;
      position: relative;

      :deep(.mailbox-provider-icon) {
        width: 100%;
        height: 36px;
        max-width: 36px;

        &.smtp-icon {
          @include svg-icon-stroke('path, circle, rect', $warning);
        }
      }

      .provider-details {
        width: 100%;
        margin: 0px 20px;

        .provider-label-text {
          color: $black;
          font-size: 14px;
          font-style: normal;
          font-weight: 500;
          line-height: normal;

          margin-bottom: 4px;
        }

        .provider-desc-text {
          color: $grey;
          font-size: 14px;
          max-width: 307px;
          line-height: 20px;
        }
      }

      :deep(.right-arrow-icon) {
        width: 100%;
        height: 16px;
        max-width: 16px;
        opacity: 0;

        position: absolute;
        right: 20px;
        top: 50%;
        transform: rotate(270deg) translateX(50%);

        @include svg-icon-stroke('path, circle, rect', $primary);
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 16px 12px;
        flex-direction: column;

        .provider-details {
          margin: 0px;
          margin-top: 16px;
        }
      }

      &:hover {
        border-radius: 8px;
        border: 1px solid $primary;
        background: rgba($color: var(--primary-rgb), $alpha: 0.05);

        .right-arrow-icon {
          opacity: 1;
        }
      }
    }
  }
}
</style>
