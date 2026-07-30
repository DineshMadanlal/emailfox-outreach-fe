<template>
  <div
    class="domain-by-id-header"
    :class="{'bordered-bottom': isPageScrolled }"
  >
    <!-- top header -->
    <div class="domain-id-top-header">
      <!-- Domains route -->
      <router-link
        :to="returnRouteLink"
        class="domain-route-link-text"
      >
        Domains
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
    <div class="domain-id-bottom-header">
      <!-- left -->
      <div>
        <div
          class="domain-details-wrapper"
        >
          <p class="domain-name-text">
            {{ domainByJson.domain_name }}
          </p>

          <!-- Dot -->
          <LocalSvgIcon
            image="circle-dot"
            classes="dot-icon"
          />

          <EspProvider
            :provider="domainProvider"
          />
        </div>
      </div>

      <q-space />

      <!-- right -->
      <div
        v-if="domainByJson.id"
        class="domain-id-right-section"
      >
        <!-- More Options -->
        <DropdownOptionsButton>
          <template #menu>
            <DomainMoreOptions
              @deleteDomain="$emit('deleteDomain')"
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

        v-for="(page, index) in domainByIdPages"

        :key="`domain-id-${index}-${page.label}`"
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
import DomainMoreOptions from 'components/Menu/DomainMoreOptions.vue';
import DropdownOptionsButton from 'components/Buttons/DropdownOptionsButton.vue';

export default defineComponent({
  name: 'DomainByIdHeader',

  emits: ['deleteDomain'],

  components: {
    EspProvider,
    DomainMoreOptions,
    DropdownOptionsButton,
  },

  props: {
    domainByJson: {
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
    const returnRouteLink = computed(() => '/outreach/domains');

    const domainProvider = computed(() => props.domainByJson.provider);

    const domainByIdPages = computed(() => {
      const domainId = props.domainByJson.id;

      return [
        {
          label: 'Overview',
          route: `/outreach/domain/${domainId}/overview`,
        },
        {
          label: 'Mailboxes',
          route: `/outreach/domain/${domainId}/mailboxes`,
        },
        // {
        //   label: 'Campaigns',
        //   route: `/outreach/domain/${domainId}/campaigns`,
        // },
      ];
    });

    return {
      // computed
      domainByIdPages,
      returnRouteLink,
      domainProvider,
    };
  },
});
</script>

<style lang="scss" scoped>
.domain-by-id-header {
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
  .domain-id-top-header {
    width: 100%;

    padding: 24px 20px 4px 20px;

    display: flex;
    align-items: center;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 16px 4px 16px;
    }

    .domain-route-link-text {
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

  .domain-id-bottom-header {
    width: 100%;
    row-gap: 6px;
    padding: 16px 20px;
    padding-bottom: 0px;

    display: flex;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px;
      padding-bottom: 0px;
      flex-direction: column;
    }

    .light-negative-btn {
      :deep(.delete-icon) {
        margin-right: 4px;
        @include svg-icon-stroke('path, circle, rect', $negative);
      }
    }

    .domain-name-text {
      color: $black;
      font-size: 18px;
      font-weight: 600;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        font-size: 16px;
        max-width: 95vw;
      }
    }

    .domain-details-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;

      .domain-name-text {
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

    .delete-domain-btn {
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

  .domain-id-right-section {
    display: flex;
    align-items: center;
    justify-content: flex-end;

    column-gap: 12px;
  }
}
</style>
