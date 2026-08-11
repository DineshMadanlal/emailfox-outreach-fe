<template>
  <aside
    class="secondary-sidebar"
    :class="{ 'secondary-sidebar--mini': drawerMiniState }"
  >
    <!-- Workspace -->
    <div
      class="workspaces-section"
    >
      <div
        class="current-workspace-option"
      >
        <p class="workspace-text ellipsis">
          {{ activeWorkspaceName }}
        </p>
      </div>

      <q-btn
        flat
        round
        unelevated

        size="xs"
        color="secondary"
        class="drawer-resizer"

        @click="toggleDrawerMiniState()"
      >
        <LocalSvgIcon image="resizer" class="resizer-icon" />
      </q-btn>
    </div>

    <!-- Routes -->
    <SkyBoxSidebarContent
      :miniDrawer="drawerMiniState"

      v-if="isMasterInboxRoute"
    />

    <!-- Workspace Settings route -->
    <div
      class="secondary-settings-route"
    >
      <!--  -->
      <template v-if="!drawerMiniState">
        <q-expansion-item
          v-for="(panel) in sidebarPanels"
          :key="`each-sidebar-panel-${panel.label}`"

          dense

          class="sidebar-expansion-panel"
          header-class="sidebar-expansion-panel-header"

          :name="panel.key"
          :model-value="expandedSidebarPanel === panel.key"

          @update:model-value="handleSidebarPanelToggle(panel.key, $event)"
        >
          <!-- header template -->
          <template #header>
            <div class="sidebar-expansion-header">
              <div
                class="panel-label-text"
              >
                {{ panel.label }}
              </div>
            </div>
          </template>

          <!-- panel sections -->
          <div
            v-for="(section, sectionIndex) of panel.sections"
            :key="`each-sidebar-section-${panel.key}-${section.heading}-${sectionIndex}`"

            class="each-secondary-route-container"
          >
            <!-- each section -->
            <p class="secondary-route-heading">
              {{ section.heading }}
            </p>

            <!-- Each route -->
            <div class="sidebar-all-routes-grid">
              <q-item
                v-for="(page, index) in section.routes"
                :key="`secondary-sidebar-route-${panel.key}-${index}-${page.label}`"

                clickable

                class="sidebar-route-item"

                :to="page.route"
                :class="{ active: page.isActive }"
                :style="{ animationDelay: `0.${250 * index}s` }"
              >
                <LocalSvgIcon
                  :image="page.icon"
                  :class="`sidebar-route-icon ${page.iconClass || ''}`"
                />

                <p class="page-label-text">
                  {{ page.label }}
                </p>
              </q-item>
            </div>
          </div>
        </q-expansion-item>
      </template>

      <template v-else>
        <div
          v-for="(section, index) of sidebarRoutes"
          :key="`each-sidebar-mini-section-${section.heading}-${index}`"

          class="each-secondary-route-container"
        >
          <div class="sidebar-all-routes-grid">
            <q-item
              v-for="(page, pageIndex) in section.routes"
              :key="`secondary-sidebar-mini-route-${pageIndex}-${page.label}`"

              clickable

              class="sidebar-route-item"

              :to="page.route"
              :class="{ active: page.isActive }"
            >
              <LocalSvgIcon
                :image="page.icon"
                :class="`sidebar-route-icon ${page.iconClass || ''}`"
              />

              <p class="page-label-text">
                {{ page.label }}
              </p>

              <!-- tooltip -->
              <AppTooltip
                anchor="center right"
                self="center left"
                :content="page.label"
              />
            </q-item>
          </div>
        </div>
      </template>
    </div>
  </aside>
</template>

<script>
// vue
import {
  defineComponent, computed, reactive, toRefs, watch,
} from 'vue';

// vue router
import { useRoute, useRouter } from 'vue-router';

// pinia store
import { useUserPreferencesStore } from 'src/stores/userPreferences.js';

// composables
import { useWorkspace } from 'src/composables/useWorkspace';

// Components
import AppTooltip from 'components/General/AppTooltip.vue';
import SkyBoxSidebarContent from 'components/MasterInbox/Sidebar/Content.vue';

export default defineComponent({
  name: 'SecondarySidebar',

  components: {
    AppTooltip,
    SkyBoxSidebarContent,
  },

  setup() {
    // route
    const $route = useRoute();
    const $router = useRouter();

    // composables
    const {
      isClientLoggedIn,
      isRoleAdminOrAbove,
      activeWorkspaceName,
    } = useWorkspace();

    // Access the user store
    const userPreferencesStore = useUserPreferencesStore();

    // state
    const state = reactive({
      showWorkspaceSwitcherMenu: false,
      expandedSidebarPanel: 'outreach',
    });

    // computed
    const activeRoutePath = computed(() => $route.path);

    const drawerMiniState = computed(() => userPreferencesStore.drawerMiniState);
    const isOutreachRoute = computed(() => activeRoutePath.value.includes('/outreach/'));
    const isMasterInboxRoute = computed(() => activeRoutePath.value.includes('/unibox/'));
    const isWorkspaceSettingsRoute = computed(() => activeRoutePath.value.includes('/settings/'));

    // outreach routes
    const engagementRoutes = computed(() => {
      const routes = [
        // campaigns
        {
          name: 'campaigns',
          label: 'Campaigns',
          icon: 'sequences',
          route: '/outreach/campaigns-all',
          isActive: activeRoutePath.value.includes('/outreach/campaigns'),
        },
        // analytics
        // {
        //   name: 'analytics',
        //   label: 'Analytics',
        //   icon: 'analytics',
        //   route: '/outreach/analytics',
        //   isActive: activeRoutePath.value.includes('/outreach/analytics'),
        // },
        // contacts
        {
          name: 'contacts',
          label: 'Contacts',
          icon: 'contacts',
          route: '/outreach/contacts/all',
          isActive: activeRoutePath.value.includes('/outreach/contacts'),
        },
        // lists
        {
          name: 'lists',
          label: 'Lists',
          icon: 'lists',
          route: '/outreach/lists/all',
          isActive: activeRoutePath.value.includes('/outreach/lists/'),
        },
      ];

      return routes;
    });

    // mail infra routes
    const mailInfraRoutes = computed(() => {
      const routes = [
        // mail accounts
        {
          name: 'mailboxes',
          label: 'Mailboxes',
          icon: 'mail',
          route: '/outreach/mailboxes',
          isActive: activeRoutePath.value.includes('/outreach/mailbox'),
        },
        // domains
        {
          name: 'domains',
          label: 'Domains',
          icon: 'domains',
          route: '/outreach/domains',
          isActive: activeRoutePath.value.includes('/outreach/domain'),
        },
        // linkedin
        {
          name: 'linkedin',
          label: 'LinkedIn',
          icon: 'linkedin-1',
          iconClass: 'linkedin-icon',
          route: '/outreach/linkedin/accounts',
          isActive: activeRoutePath.value.includes('/outreach/linkedin'),
        },
      ];

      return routes;
    });

    const allOutreachRoutes = computed(() => {
      const routes = [
        // engagement
        {
          heading: 'Engagement',
          routes: engagementRoutes.value,
        },
        // mail infra
        {
          heading: 'Mail Infra',
          routes: mailInfraRoutes.value,
        },
      ];

      return routes;
    });

    const deliveryControlRoutes = computed(() => {
      const routes = [
        // warmup profiles
        {
          name: 'WarmupProfiles',
          icon: 'warmup-1',
          label: 'Warmup Profiles',
          route: '/settings/warmup-profiles',
          isActive: activeRoutePath.value.includes('/settings/warmup-profiles'),
        },
        // sending schedules
        {
          name: 'SendingSchedule',
          icon: 'seq-schedule',
          label: 'Sending Schedule',
          route: '/settings/sending-schedule',
          isActive: activeRoutePath.value.includes('/settings/sending-schedule'),
        },
        // suppression list
        {
          name: 'SuppressionList',
          icon: 'mails-bounced',
          label: 'Suppress List',
          route: '/settings/suppression-list',
          isActive: activeRoutePath.value.includes('/settings/suppression-list'),
        },
      ];

      return routes;
    });
    const developerPageRoutesByWorkspace = computed(() => {
      if (isClientLoggedIn.value) {
        // clients should not see whitelabel settings
        return [];
      }

      const routes = [
        // webhooks
        {
          name: 'Webhooks',
          icon: 'webhooks',
          label: 'Webhooks',
          route: '/settings/webhooks',
          isActive: activeRoutePath.value.includes('/settings/webhooks'),
        },
      ];

      return routes;
    });

    const allWorkspaceSettingsRoutes = computed(() => {
      const settingsMenu = [];

      // delivery control
      settingsMenu.push({
        heading: 'Delivery Control',
        routes: deliveryControlRoutes.value,
      });

      // developer options
      if (developerPageRoutesByWorkspace.value.length > 0) {
        settingsMenu.push({
          heading: 'Developer Options',
          routes: developerPageRoutesByWorkspace.value,
        });
      }

      return settingsMenu;
    });

    const sidebarPanels = computed(() => {
      const panels = [
        {
          key: 'outreach',
          label: 'Outreach',
          sections: allOutreachRoutes.value,
        },
      ];

      if (allWorkspaceSettingsRoutes.value.length > 0) {
        panels.push({
          key: 'settings',
          label: 'Settings',
          sections: allWorkspaceSettingsRoutes.value,
        });
      }

      return panels;
    });

    const sidebarRoutes = computed(() => {
      if (isOutreachRoute.value) {
        return allOutreachRoutes.value;
      }

      if (isWorkspaceSettingsRoute.value) {
        return allWorkspaceSettingsRoutes.value;
      }

      return [];
    });

    watch(
      () => activeRoutePath.value,
      () => {
        if (isWorkspaceSettingsRoute.value && allWorkspaceSettingsRoutes.value.length > 0) {
          state.expandedSidebarPanel = 'settings';
          return;
        }

        state.expandedSidebarPanel = 'outreach';
      },
      { immediate: true },
    );

    // methods
    const toggleDrawerMiniState = () => {
      userPreferencesStore.toggleDrawerMiniState();
    };

    const handleSidebarPanelToggle = (panelKey, isOpen) => {
      if (isOpen) {
        state.expandedSidebarPanel = panelKey;

        // switch to the first route of the panel if not already on a route of that panel
        const panel = sidebarPanels.value.find((p) => p.key === panelKey);
        if (panel) {
          const firstRoute = panel.sections[0].routes[0];
          if (firstRoute && !activeRoutePath.value.includes(firstRoute.route)) {
            // navigate to the first route of the panel
            $router.push(firstRoute.route);
          }
        }
      }
    };

    return {
      // state
      ...toRefs(state),

      /// computed
      drawerMiniState,
      isMasterInboxRoute,
      activeRoutePath,

      sidebarRoutes,
      sidebarPanels,
      engagementRoutes,
      isRoleAdminOrAbove,
      activeWorkspaceName,

      allWorkspaceSettingsRoutes,
      isClientLoggedIn,

      // methods
      toggleDrawerMiniState,
      handleSidebarPanelToggle,
    };
  },
});
</script>

<style lang="scss" scoped>
.secondary-sidebar {
  width: 230px;
  min-width: 230px;
  min-height: inherit;
  overflow-y: auto;

  border-radius: 8px 0 0 8px;
  border-right: 1px solid $grey-50;
  background: rgba($color: var(--primary-rgb), $alpha: 0.05);

  padding: 16px 8px;

  transition: width .16s ease, min-width .16s ease, padding .16s ease;

  flex-direction: column;
  display: flex;
  align-items: center;

  .workspaces-section {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;

    margin-bottom: 16px;

    .current-workspace-option {
      padding: 0px 8px;
      width: 100%;
      max-width: 90%;
      display: flex;
      gap: 8px;
      align-items: center;
      cursor: pointer;

      transition: display .25s ease;

      .workspace-text {
        color: $black;
        font-size: 15px;
        font-weight: 500;

        max-width: 80%;
        text-transform: capitalize;
      }
    }
  }

  //
  .secondary-settings-route {
    width: 100%;
    display: grid;
    grid-row-gap: 10px;

    :deep(.sidebar-expansion-panel) {
      border-radius: 8px;
      overflow: hidden;

      &.q-expansion-item--expanded {
        .sidebar-expansion-panel-header {
          background: rgba($color: var(--grey-rgb), $alpha: 0.1);
        }
      }

      .sidebar-expansion-panel-header {
        display: flex;
        min-height: unset;
        align-items: center;
        width: 100%;
        margin-bottom: 4px;
        border-radius: 6px;
        padding: 0 8px;

        .sidebar-expansion-header {
          .panel-label-text {
            font-size: 13px;
            font-weight: 500;
            color: $grey;
            letter-spacing: 0.39px;
          }
        }
      }
    }

    .each-secondary-route-container {
      margin-bottom: 18px;

      // last child
      &:last-child {
        margin-bottom: 0px;
      }

      .secondary-route-heading {
        color: $grey;
        font-size: 13px;
        font-weight: 600;
        line-height: 16px;
        letter-spacing: 0.39px;
        text-transform: uppercase;

        padding: 0px 8px;
        margin-bottom: 10px;
      }

      .sidebar-all-routes-grid {
        display: grid;
        grid-row-gap: 4px;

        .sidebar-route-item {
          border-radius: 6px;
          min-height: unset;
          padding: 10px 12px;

          display: flex;
          align-items: center;
          gap: 12px;

          .page-label-text {
            color: $black;
            font-size: 14px;
            font-weight: 400;
            line-height: 16px; /* 114.286% */
          }

          :deep(.sidebar-route-icon) {
            @include svg-icon-stroke('path, circle, rect, ellipse', $black);

            &.linkedin-icon {
              path {
                fill: $black;
                stroke: unset;
              }
            }
          }

          &.active {
            background: rgba($color: var(--primary-rgb), $alpha: 0.1);

            :deep(.sidebar-route-icon) {
              @include svg-icon-stroke('path, circle, rect, ellipse', $primary);

              &.linkedin-icon {
                path {
                  fill: $primary;
                  stroke: unset;
                }
              }
            }

            .page-label-text {
              color: $primary;
              font-weight: 500;
            }
          }
        }
      }
    }
  }

  &.secondary-sidebar--mini {
    width: 56px;
    min-width: 56px;

    .workspaces-section {
      justify-content: center;
    }

    .current-workspace-option {
      display: none;
    }

    .secondary-settings-route {
      grid-row-gap: 0;

      :deep(.sidebar-expansion-panel) {
        display: none;
      }

      .each-secondary-route-container {
        .secondary-route-heading {
          display: none;
        }

        .sidebar-all-routes-grid {
          .sidebar-route-item {
            gap: 0px;
            justify-content: center;

            .page-label-text {
              display: none;
            }
          }
        }
      }
    }
  }
}
</style>
