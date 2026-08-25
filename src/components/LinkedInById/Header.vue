<template>
  <div
    class="linkedin-by-id-header"
    :class="{'bordered-bottom': isPageScrolled }"
  >
    <!-- Top breadcrumb header -->
    <div class="linkedin-id-top-header">
      <!-- LinkedIn route -->
      <router-link
        :to="returnRouteLink"
        class="linkedin-route-link-text"
      >
        LinkedIn
      </router-link>

      <LocalSvgIcon
        image="plain-down-arrow"
        classes="plain-down-arrow-icon"
      />

      <p class="overview-text">
        {{ currentTabLabel }}
      </p>

      <q-space />

      <!-- Close button -->
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

    <!-- Bottom header info -->
    <div class="linkedin-id-bottom-header">

      <!-- Left profile details -->
      <div class="linkedin-profile-info-wrap">
        <!-- Avatar -->
        <q-avatar
          size="40px"
          class="linkedin-avatar"
        >
          <img
            v-if="accountByJson.picture_url"
            :src="accountByJson.picture_url"
            :alt="accountByJson.name || 'LinkedIn User'"
          />
          <div v-else class="linkedin-avatar-fallback">
            {{ userInitial }}
          </div>
        </q-avatar>

        <div class="linkedin-name-and-subline">
          <h6 class="linkedin-name-text ellipsis">
            {{ accountByJson.name || 'LinkedIn Account' }}
          </h6>

          <div class="linkedin-subline-details">
            <span
              class="subline-item"
            >
              @{{ accountByJson.provider_username }}
            </span>

            <LocalSvgIcon
              image="circle-dot"
              class="subline-dot"

              v-if="accountByJson.proxy_country"
            />

            <span
              v-if="accountByJson.proxy_country"
              class="subline-item"
            >
              {{ accountByJson.proxy_country }}
            </span>
          </div>
        </div>
      </div>

      <q-space />

      <!-- Right action section -->
      <div
        class="linkedin-id-right-section"
      >
        <DropdownOptionsButton>
          <template #menu>
            <LinkedInMoreOptions
              :tableRow="accountByJson"

              @deleteAccount="$emit('deleteAccount')"
              @editSendingLimits="$emit('editSendingLimits')"
              @updateProxySettings="$emit('updateProxySettings')"
            />
          </template>
        </DropdownOptionsButton>
      </div>
    </div>

    <!-- Tabs -->
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

        v-for="(page, index) in linkedInByIdPages"

        :key="`linkedin-id-${index}-${page.label}`"
        :to="page.route"
      >
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
import LinkedInMoreOptions from 'components/Menu/LinkedInMoreOptions.vue';
import DropdownOptionsButton from 'components/Buttons/DropdownOptionsButton.vue';

export default defineComponent({
  name: 'LinkedInByIdHeader',

  emits: ['deleteAccount', 'editSendingLimits', 'updateProxySettings', 'reconnectAccount'],

  components: {
    LinkedInMoreOptions,
    DropdownOptionsButton,
  },

  props: {
    accountByJson: {
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
    const returnRouteLink = computed(() => '/outreach/linkedin/accounts');

    const userInitial = computed(() => {
      const name = props.accountByJson?.name || '';
      return name ? name.charAt(0).toUpperCase() : 'L';
    });

    const linkedInByIdPages = computed(() => {
      const accountId = props.accountByJson.id;

      return [
        {
          label: 'Overview',
          route: `/outreach/linkedin/${accountId}/overview`,
        },

      ];
    });

    const currentTabLabel = computed(() => 'Overview');

    return {
      // computed
      userInitial,
      currentTabLabel,
      returnRouteLink,
      linkedInByIdPages,
    };
  },
});
</script>

<style lang="scss" scoped>
.linkedin-by-id-header {
  width: 100%;

  top: 0px;
  z-index: 2;
  position: sticky;

  background: $white;

  border-radius: 8px 8px 0px 0px;
  border-bottom: 1px solid $grey-50;

  // top header
  .linkedin-id-top-header {
    width: 100%;
    padding: 24px 20px 4px 20px;
    display: flex;
    align-items: center;

    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 16px 4px 16px;
    }

    .linkedin-route-link-text {
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

  // bottom header
  .linkedin-id-bottom-header {
    width: 100%;
    row-gap: 12px;
    padding: 16px 20px;
    padding-bottom: 4px;
    display: flex;
    align-items: center;

    @media (max-width: $breakpoint-xs-max) {
      padding: 16px;
      padding-bottom: 4px;
      flex-direction: column;
      align-items: flex-start;
    }

    .linkedin-profile-info-wrap {
      display: flex;
      align-items: center;
      gap: 14px;

      .linkedin-avatar {
        border-radius: 5px;
        background: rgba(var(--primary-rgb), 0.1);
        border: 1px solid rgba(var(--primary-rgb), 0.2);

        img {
          object-fit: cover;
        }

        .linkedin-avatar-fallback {
          font-size: 18px;
          font-weight: 600;
          color: $primary;
        }
      }

      .linkedin-name-and-subline {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .linkedin-name-text {
          color: $black;
          font-size: 18px;
          font-weight: 600;
          line-height: 18px;

          @media (max-width: $breakpoint-xs-max) {
            font-size: 16px;
            max-width: 80vw;
          }
        }

        .linkedin-subline-details {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: $black;

          .subline-item {
            line-height: 16px;
          }

          :deep(.subline-dot) {
            width: 4px;
            height: 4px;

            @include svg-icon-fill('circle', $grey-300);
          }
        }
      }
    }

    .linkedin-id-right-section {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
    }
  }
}
</style>
