<template>
  <div
    class="mailbox-by-id-header"
    :class="{'bordered-bottom': isPageScrolled }"
  >
    <!-- top header -->
    <div class="mailbox-id-top-header">
      <!-- Domains route -->
      <router-link
        :to="returnRouteLink"
        class="mailbox-route-link-text"
      >
        Mailboxes
      </router-link>

      <LocalSvgIcon
        image="plain-down-arrow"
        classes="plain-down-arrow-icon"
      />

      <p class="overview-text">
        Overview
      </p>

      <q-space />

      <!-- close button -->
      <q-btn
        flat
        round
        dense

        color="negative"
        class="app-negative-button"

        :to="returnRouteLink"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />
      </q-btn>
    </div>

    <!-- bottom header -->
    <div class="mailbox-id-bottom-header">
      <!-- left -->
      <div>
        <h6 class="mailbox-email-text ellipsis">
          {{ mailboxByJson.email }}
        </h6>

        <div
          class="mailbox-details-wrapper"
        >
          <p class="mailbox-name-text">
            {{ mailboxByJson.name }}
          </p>

          <!-- Dot -->
          <LocalSvgIcon
            image="circle-dot"
            classes="dot-icon"
          />

          <EspProvider
            :provider="mailboxProvider"
          />
        </div>
      </div>

      <q-space />

      <!-- right -->
      <div
        v-if="mailboxByJson.id"
        class="mailbox-id-right-section"
      >
        <!-- More Options -->
        <DropdownOptionsButton>
          <template #menu>
            <MailboxMoreOptions
              @deleteMailbox="$emit('deleteMailbox')"
            />
          </template>
        </DropdownOptionsButton>
      </div>
    </div>

    <!-- Tabs -->
    <!-- Tab components -->
    <q-tabs
      dense
      narrow-indicator

      align="left"
      class="app-tabs"
      active-color="primary"
      indicator-color="primary"
    >
      <q-route-tab
        no-caps

        v-for="(page, index) in mailboxByIdPages"

        :key="`mailbox-id-${index}-${page.label}`"
        :to="page.route"
      >
        <!-- page label -->
        <p class="route-label-text">
          {{ page.label }}
        </p>
      </q-route-tab>
    </q-tabs>
  </div>
</template>

<script>
// vue
import {
  defineComponent, computed,
} from 'vue';

// Components
import EspProvider from 'components/Mailboxes/EspProvider.vue';
import MailboxMoreOptions from 'components/Menu/MailboxMoreOptions.vue';
import DropdownOptionsButton from 'components/Buttons/DropdownOptionsButton.vue';

export default defineComponent({
  name: 'MailboxByIdHeader',

  emits: ['deleteMailbox'],

  components: {
    EspProvider,
    MailboxMoreOptions,
    DropdownOptionsButton,
  },

  props: {
    domainName: {
      type: String,
      required: true,
    },
    mailboxByJson: {
      type: Object,
      required: true,
    },
    isPageScrolled: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    // computed
    const returnRouteLink = computed(() => '/outreach/mailboxes');

    const mailboxProvider = computed(() => props.mailboxByJson.provider || '');

    const mailboxByIdPages = computed(() => {
      const mailboxId = props.mailboxByJson.id;

      return [
        {
          label: 'Overview',
          route: `/outreach/mailbox/${mailboxId}/overview`,
        },
        {
          label: 'Warmup',
          route: `/outreach/mailbox/${mailboxId}/warmup`,
        },
        {
          label: 'Campaigns',
          route: `/outreach/mailbox/${mailboxId}/campaigns`,
        },
      ];
    });

    return {
      // computed
      mailboxByIdPages,
      returnRouteLink,
      mailboxProvider,
    };
  },
});
</script>

<style lang="scss" scoped>
.mailbox-by-id-header {
  width: 100%;

  top: 0px;
  z-index: 2;
  position: sticky;

  background: $white;

  border-radius: 8px 8px 0px 0px;

  border-bottom: 1px solid $grey-50;

  // &.bordered-bottom {
  //   border-bottom: 1px solid $grey-50;
  // }

  // top header
  .mailbox-id-top-header {
    width: 100%;

    padding: 24px 20px 4px 20px;

    display: flex;
    align-items: center;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 16px 4px 16px;
    }

    .mailbox-route-link-text {
      color: $grey;
      font-size: 14px;
      font-weight: 400;

      text-decoration: unset;

      &:hover {
        color: $primary;
        text-decoration: underline;
      }
    }

    :deep(.plain-down-arrow-icon) {
      margin: 0px 12px;

      transform: rotate(-90deg);
    }

    .overview-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
    }
  }

  .mailbox-id-bottom-header {
    width: 100%;
    row-gap: 6px;
    padding: 16px 20px;

    display: flex;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px;
      flex-direction: column;
    }

    .light-negative-btn {
      :deep(.delete-icon) {
        margin-right: 4px;
        @include svg-icon-stroke('path, circle, rect', $negative);
      }
    }

    .mailbox-email-text {
      color: $black;
      font-size: 18px;
      font-weight: 600;

      margin-bottom: 8px;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        font-size: 16px;
        max-width: 95vw;
      }
    }

    .mailbox-details-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;

      .mailbox-name-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;
      }

      :deep(.dot-icon) {
        max-height: 4px;
        max-width: 4px;

        circle {
          fill: $grey-300;
          stroke-width: 2px;
        }
      }
    }

    .delete-mailbox-btn {
      height: fit-content;
      border: 1px solid $blue-grey;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        display: none;
      }

      .delete-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;

        margin-left: 8px;
      }

      &:hover {
        border: 1px solid $negative;
        background-color: rgba($color: var(--negative-rgb), $alpha: 0.1);

        .delete-text {
          color: $negative;
        }

        :deep(.delete-icon) {
          @include svg-icon-stroke('path, circle, rect', $negative);
        }
      }
    }
  }

  .mailbox-id-right-section {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    column-gap: 12px;
  }
}
</style>
