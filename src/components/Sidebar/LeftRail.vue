<template>
  <q-list class="workspace-routes-list">
    <!-- Workspace logo or URL -->
    <LogoOrText :workspace="activeWorkspaceJson" />

    <!-- Top Navigation Routes -->
    <div
      v-for="(page, index) in topNavigationRoutes"
      :key="`workspace-top-navigation-page-option-${index}-${page.label}`"
      class="workspace-route-section"
    >
      <!--  -->
      <q-item
        clickable
        class="workspace-page-option"

        :to="page.route"
        :id="`workspace-top-route-${page.icon}`"
        :style="{ animationDelay: `0.${250 * index}s` }"
        :class="{ active: activeRoute.includes(page.routeCheck) }"
      >
        <!--  -->
        <div class="each-workspace-item-container">
          <!-- Icon -->
          <LocalSvgIcon
            :image="page.icon"
            :classes="page.iconClasses"
            class="workspace-page-icon"
          />

          <!--  -->
          <p class="workspace-route-text">
            {{ page.label }}
          </p>
        </div>

        <!-- tooltip -->
        <!-- <AppTooltip
          anchor="center right"
          self="center left"
          :content="page.label"
        /> -->
      </q-item>
    </div>

    <q-space />
  </q-list>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// composables
import { useWorkspace } from 'src/composables/useWorkspace';

// vue router
import { useRoute } from 'vue-router';

// Components
import LogoOrText from 'components/Workspaces/LogoOrText.vue';

export default defineComponent({
  name: 'LeftRail',

  components: {
    LogoOrText,
  },

  props: {
    isPrimaryApp: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    // route
    const $route = useRoute();

    // composables
    const {
      isClientLoggedIn,
      activeWorkspaceJson,
    } = useWorkspace();

    // computed
    const activeRoute = computed(() => $route.path);

    const topNavigationRoutes = computed(() => {
      const routes = [{
        name: 'outreach',
        label: 'Outreach',
        icon: 'sequences',
        route: '/outreach/campaigns-all',
        routeCheck: '/outreach/',
      },
      // {
      //   name: 'unibox',
      //   label: 'Unibox',
      //   icon: 'master-inbox',
      //   route: '/unibox',
      //   routeCheck: '/unibox',
      // },
      {
        name: 'workspacesettings',
        label: 'Workspace',
        icon: 'settings',
        iconClasses: 'settings-icon',
        route: isClientLoggedIn.value ? '/settings/warmup-profiles' : '/settings',
        routeCheck: '/settings/',
      }];

      return routes;
    });

    const bottomNavigationRoutes = computed(() => {
      if (isClientLoggedIn.value) {
        return [];
      }

      // routes
      const routes = [{
        name: 'usersettings',
        label: 'Account',
        icon: 'settings',
        iconClasses: 'settings-icon',
        route: '/account',
        routeCheck: '/account',
      }];

      return routes;
    });

    return {
      // computed
      activeRoute,

      topNavigationRoutes,
      bottomNavigationRoutes,
      activeWorkspaceJson,
    };
  },
});
</script>

<style lang="scss" scoped>
.workspace-routes-list {
  padding: 12px;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: $secondary;

  :deep(.workspace-logo-container) {
    transition: transform 0.18s ease, box-shadow 0.18s ease;

    &:hover {
      transform: translateY(-1px);
    }
  }

  .workspace-route-section {
    margin-bottom: 2px;
    margin-top: 6px;

    .workspace-page-option {
      display: flex;
      min-height: unset;
      align-items: center;
      flex-direction: column;
      justify-content: center;

      width: 60px;
      height: 54px;
      border-radius: 6px;
      padding: 0;

      &:hover {
        background: rgba($color: var(--white-rgb), $alpha: 0.1);
      }

      &.bottom-route-option {
        height: 36px;
        width: 36px;

        transition: background 0.18s ease, opacity 0.18s ease;

        &:hover {
          background: rgba($color: var(--white-rgb), $alpha: 0.1);
        }

        :deep(.workspace-page-icon) {
          height: 18px;
          width: 18px;
        }
      }

      .each-workspace-item-container {
        display: flex;
        flex-direction: column;
        align-items: center;

        .workspace-route-text {
          color: $grey-100;
          font-size: 9px;
          font-weight: 500;
          letter-spacing: 0.6px;
          text-transform: uppercase;

          margin-top: 8px;
          user-select: none;
        }

        :deep(.workspace-page-icon) {
          &:not(.settings-icon) {
            @include svg-icon-stroke('path, circle, rect', $grey-100);
          }

          &.settings-icon {
            @include svg-icon-fill('path', $grey-100);
          }
        }

      }

      &.active {
        background: rgba($color: var(--white-rgb), $alpha: 0.2);

        &::before {
          content: '';
          position: absolute;
          left: -7px;
          top: 12px;
          bottom: 12px;
          width: 3px;
          border-radius: 10px;
          background: $white;
        }

        .each-workspace-item-container {
          .workspace-route-text {
            color: $white;
          }

          :deep(.workspace-page-icon) {
            &:not(.settings-icon) {
              @include svg-icon-stroke('path, circle, rect', $white);
            }

            &.settings-icon {
              @include svg-icon-fill('path', $white);
            }
          }
        }
      }
    }
  }
}
</style>
