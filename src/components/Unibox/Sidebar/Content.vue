<template>
  <div
    class="unibox-sidebar-content"
    :class="{ 'mini': miniDrawer }"
  >
    <!-- Compose Email Button -->
    <q-btn
      flat
      no-caps
      unelevated
      color="primary"
      class="compose-btn"
      @click="onComposeEmail"
    >
      <div class="flex no-wrap items-center">
        <LocalSvgIcon
          image="compose"
          classes="compose-icon"
        />

        <AppTooltip
          v-if="miniDrawer"
          content="Compose"
          anchor="center right"
          self="center left"
          :offset="[6, 10]"
        />

        <p
          v-else
          class="compose-label-text"
        >
          Compose
        </p>
      </div>
    </q-btn>

    <!-- Primary Section -->
    <div class="sidebar-section-container">
      <!-- Section Heading -->
      <p
        v-if="!miniDrawer"
        class="sidebar-section-heading"
      >
        PRIMARY
      </p>

      <!-- Primary Route Items -->
      <div class="sidebar-routes-list">
        <q-item
          clickable
          v-for="(page, index) in primaryRoutes"
          :to="page.route"
          :key="`unibox-primary-route-${index}-${page.label}`"
          class="unibox-route-item"
          :class="{
            active: isRouteActive(page.route),
          }"
          @click="onClickPage(isRouteActive(page.route))"
        >
          <!-- Route Icon -->
          <LocalSvgIcon
            :image="page.icon"
            class="unibox-page-icon"
            :classes="page.cssClassName || ''"
          />

          <!-- Tooltip for Mini Drawer Mode -->
          <AppTooltip
            v-if="miniDrawer"
            :content="page.label"
            anchor="center right"
            self="center left"
            :offset="[6, 10]"
          />

          <!-- Route Label (Expanded Mode) -->
          <p
            v-if="!miniDrawer"
            class="unibox-label-text"
          >
            {{ page.label }}
          </p>

          <q-space v-if="!miniDrawer" />

          <!-- Count Badge (e.g. Unread / Untracked count) -->
          <div
            v-if="!miniDrawer && page.count"
            class="unibox-count-badge"
          >
            {{ page.count }}
          </div>
        </q-item>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, computed,
} from 'vue';

// vue router
import { useRoute } from 'vue-router';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

// store pinia
import { useUniboxStore } from 'src/stores/unibox.js';

// constants
import { UNIBOX_SIDEBAR_CLICK_EVENTS } from 'boot/unibox-constants';

export default defineComponent({
  name: 'UniboxSidebarContent',

  components: {
    AppTooltip,
  },

  props: {
    miniDrawer: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    // router
    const $route = useRoute();

    // store
    const uniboxPinia = useUniboxStore();

    // computed
    const activeRoute = computed(() => $route.path);

    // Primary navigation routes matching Unibox design
    const primaryRoutes = computed(() => [
      {
        name: 'UniboxInbox',
        label: 'Inbox',
        icon: 'inbox',
        route: '/unibox/inbox',
        count: uniboxPinia.getInboxUnreadCount || null,
      },
      {
        name: 'UniboxUntrackedReplies',
        label: 'Untracked Replies',
        icon: 'send',
        route: '/unibox/untracked-replies',
      },
      {
        name: 'UniboxImportant',
        label: 'Important',
        icon: 'star',
        route: '/unibox/important',
      },
      {
        name: 'UniboxBounced',
        label: 'Bounced',
        icon: 'mails-bounced',
        route: '/unibox/bounced',
      },
    ]);

    // Check if the given route path is active
    const isRouteActive = (routePath) => activeRoute.value.startsWith(routePath);

    // Click handler for route item
    const onClickPage = (isActive) => {
      if (isActive) {
        uniboxPinia.setMultipleFields({
          secondarySidebarClickEvent: UNIBOX_SIDEBAR_CLICK_EVENTS.REFRESH_UNIBOX,
        });
      }
    };

    // Trigger compose email modal
    const onComposeEmail = () => {
      uniboxPinia.setMultipleFields({
        secondarySidebarClickEvent: UNIBOX_SIDEBAR_CLICK_EVENTS.COMPOSE_EMAIL,
      });
    };

    return {
      // computed
      primaryRoutes,

      // methods
      isRouteActive,
      onClickPage,
      onComposeEmail,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-sidebar-content {
  width: 100%;
  display: block;

  // Compose button styling
  .compose-btn {
    width: 100%;
    margin-bottom: 16px;

    border-radius: 60px;
    background: rgba($color: var(--primary-rgb), $alpha: 0.1);
    border: 1px solid rgba($color: var(--primary-rgb), $alpha: 0.3);

    :deep(.compose-icon) {
      @include svg-icon-stroke('path, circle, rect', $primary);
    }

    .compose-label-text {
      color: $primary;
      font-size: 14px;
      font-weight: 500;
      line-height: 16px;

      margin-left: 8px;
    }
  }

  // Section container
  .sidebar-section-container {
    display: flex;
    flex-direction: column;

    .sidebar-section-heading {
      color: $grey;
      font-size: 13px;
      font-weight: 600;
      line-height: 16px;
      letter-spacing: 0.39px;
      text-transform: uppercase;
      padding: 0px 8px;
      margin-bottom: 10px;
    }

    .sidebar-routes-list {
      display: grid;
      grid-row-gap: 4px;
    }
  }

  // Individual route item
  .unibox-route-item {
    display: flex;
    border-radius: 6px;
    align-items: center;
    min-height: unset;
    padding: 10px 10px;

    .unibox-label-text {
      margin-left: 12px;
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;
    }

    :deep(.unibox-page-icon) {
      min-width: 16px;
      min-height: 16px;
      @include svg-icon-stroke('path, circle, rect', $black);
    }

    // Count badge styling
    .unibox-count-badge {
      display: flex;
      align-items: center;
      justify-content: center;

      padding: 0px 4px;
      border-radius: 50px;
      background-color: $primary;

      color: $white;
      font-size: 10px;
      font-weight: 500;
      line-height: 16px;

      display: none;
    }

    // Active state styling
    &.active {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);

      :deep(.unibox-page-icon) {
        @include svg-icon-stroke('path, circle, rect', $primary);
      }

      .unibox-label-text {
        font-weight: 500;
        color: $primary;
      }
    }
  }

  // Mini drawer mode
  &.mini {
    .unibox-route-item {
      flex-direction: column;
      justify-content: center;
      padding: 10px 0px;

      .unibox-label-text,
      .unibox-count-badge {
        display: none;
      }
    }
  }
}
</style>
