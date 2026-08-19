<template>
  <!-- Wrapper -->
  <div class="select-mailboxwrapper" ref="wrapperRef">
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

        :class="{
          'is-expanded': expandedProvider === provider.value,
          'no-hover': !!expandedProvider && expandedProvider !== provider.value,
        }"

        @click="onCardClick(provider)"
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

          <!-- Sub-actions for providers with single + bulk -->
          <div
            v-if="provider.canAddSingleAndBulk && expandedProvider === provider.value"
            class="sub-actions-grid"
            @click.stop
          >
            <!-- Add Mailbox -->
            <div
              class="sub-action-card"
              @click="onSubAction(provider, 'single')"
            >
              <div class="sub-action-icon-wrapper sub-action-icon--smtp">
                <LocalSvgIcon
                  image="mail"
                  class="sub-action-icon smtp-sub-icon"
                />
              </div>

              <p class="sub-action-label">
                Add Mailbox
              </p>
            </div>

            <!-- Bulk Import CSV -->
            <div
              class="sub-action-card"
              @click="onSubAction(provider, 'bulk')"
            >
              <div class="sub-action-icon-wrapper sub-action-icon--bulk">
                <LocalSvgIcon
                  image="download"
                  class="sub-action-icon bulk-sub-icon"
                />
              </div>

              <p class="sub-action-label">
                Bulk Import CSV
              </p>
            </div>
          </div>
        </div>

        <LocalSvgIcon
          v-if="!provider.canAddSingleAndBulk || expandedProvider !== provider.value"
          image="plain-down-arrow"
          class="right-arrow-icon"
        />
      </q-card>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, computed, ref, onMounted, onUnmounted,
} from 'vue';

// constants
import { ESP_PROVIDERS } from 'boot/mailbox-constants';

export default defineComponent({
  name: 'SelectMailboxProvider',

  emits: ['onCompleteStep'],

  setup(props, { emit }) {
    // state
    const expandedProvider = ref(null);
    const wrapperRef = ref(null);

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
        {
          label: 'IMAP / SMTP',
          value: ESP_PROVIDERS.CUSTOM_SMTP,
          description: 'Set up your mailbox using IMAP/SMTP settings',
          icon: 'smtp',
          iconClasses: 'smtp-icon',
          canAddSingleAndBulk: true,
        },
      ];

      return providers;
    });

    // methods
    const onCardClick = (provider) => {
      if (provider.canAddSingleAndBulk) {
        // Toggle expand / collapse
        expandedProvider.value = expandedProvider.value === provider.value
          ? null
          : provider.value;
        return;
      }

      emit('onCompleteStep', { ...provider, mode: 'single' });
    };

    const onSubAction = (provider, mode) => {
      emit('onCompleteStep', { ...provider, mode });
    };

    // Click-outside: collapse expanded provider when clicking outside the wrapper
    const handleOutsideClick = (event) => {
      if (
        expandedProvider.value
        && wrapperRef.value
        && !wrapperRef.value.contains(event.target)
      ) {
        expandedProvider.value = null;
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleOutsideClick);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleOutsideClick);
    });

    return {
      // state
      wrapperRef,
      expandedProvider,

      // computed
      mailboxProviders,

      // methods
      onCardClick,
      onSubAction,
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
      transition: border-color 0.2s ease, background 0.2s ease;

      :deep(.mailbox-provider-icon) {
        width: 100%;
        height: 36px;
        max-width: 36px;
        flex-shrink: 0;

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

        // Sub-actions (Add Mailbox / Bulk Import CSV)
        .sub-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 20px;

          // xs max
          @media (max-width: $breakpoint-xs-max) {
            grid-template-columns: 1fr;
          }

          .sub-action-card {
            display: flex;
            align-items: center;
            gap: 12px;

            padding: 14px 16px;
            border-radius: 8px;
            border: 1px solid $grey-50;
            background: $white;
            cursor: pointer;
            transition: border-color 0.15s ease, background 0.15s ease;

            &:hover {
              border-color: $primary;
              background: rgba($color: var(--primary-rgb), $alpha: 0.04);
            }

            .sub-action-icon-wrapper {
              width: 36px;
              height: 36px;
              border-radius: 50%;
              flex-shrink: 0;

              display: flex;
              align-items: center;
              justify-content: center;

              &.sub-action-icon--smtp {
                background: rgba($color: var(--warning-rgb), $alpha: 0.12);
              }

              &.sub-action-icon--bulk {
                background: rgba($color: var(--primary-rgb), $alpha: 0.12);
              }
            }

            :deep(.sub-action-icon) {
              width: 18px;
              height: 18px;

              &.smtp-sub-icon {
                @include svg-icon-stroke('path, circle, rect', $warning);
              }

              &.bulk-sub-icon {
                @include svg-icon-stroke('path, circle, rect', $primary);
              }
            }

            .sub-action-label {
              color: $black;
              font-size: 14px;
              font-weight: 500;
              line-height: normal;
            }
          }
        }
      }

      :deep(.right-arrow-icon) {
        width: 100%;
        height: 16px;
        max-width: 16px;
        opacity: 0;
        flex-shrink: 0;

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

      &:hover:not(.no-hover):not(.is-expanded) {
        border-radius: 8px;
        border: 1px solid $primary;
        background: rgba($color: var(--primary-rgb), $alpha: 0.05);

        .right-arrow-icon {
          opacity: 1;
        }
      }

      &.is-expanded {
        border: 1px solid $primary;
        background: rgba($color: var(--primary-rgb), $alpha: 0.05);
        cursor: default;
      }

      &.no-hover {
        cursor: pointer;
        opacity: 0.6;
      }
    }
  }
}
</style>
