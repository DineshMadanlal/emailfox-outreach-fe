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

        <!-- arrow icon -->
        <LocalSvgIcon
          v-if="!isClientLoggedIn"

          image="plain-down-arrow"
          class="arrow-icon"
          :class="{ 'rotate-180': showWorkspaceSwitcherMenu }"
        />

        <!-- Menu -->
        <q-menu
          v-if="!isClientLoggedIn"
          :offset="[0, 10]"
          v-model="showWorkspaceSwitcherMenu"
        >
          <WorkspaceSwitcher />
        </q-menu>
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
      <div
        v-for="(section, index) of sidebarRoutes"
        :key="`each-sidebar-section-${section.heading}-${index}`"

        class="each-secondary-route-container"
      >
        <p class="secondary-route-heading">
          {{ section.heading }}
        </p>

        <!-- Each route -->
        <div class="sidebar-all-routes-grid">
          <q-item
            v-for="(page, index) in section.routes"
            :key="`secondary-sidebar-route-${index}-${page.label}`"

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

            <!--  -->
            <p class="page-label-text">
              {{ page.label }}
            </p>

            <!-- tooltip -->
            <AppTooltip
              anchor="center right"
              self="center left"
              :content="page.label"

              v-if="drawerMiniState"
            />
          </q-item>
        </div>
      </div>
    </div>
  </aside>
</template>

<script>
// vue
import {
  defineComponent, computed, reactive, toRefs,
} from 'vue';

// vue router
import { useRoute } from 'vue-router';

// pinia store
import { useUserPreferencesStore } from 'src/stores/userPreferences.js';

// composables
import { useWorkspace } from 'src/composables/useWorkspace';

// Components
import AppTooltip from 'components/General/AppTooltip.vue';
import WorkspaceSwitcher from 'components/Menu/WorkspaceSwitcher.vue';
import SkyBoxSidebarContent from 'components/MasterInbox/Sidebar/Content.vue';

export default defineComponent({
  name: 'SecondarySidebar',

  components: {
    AppTooltip,
    SkyBoxSidebarContent,
    WorkspaceSwitcher,
  },

  setup() {
    // route
    const $route = useRoute();

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
    });

    // computed
    const activeRoutePath = computed(() => $route.path);

    const drawerMiniState = computed(() => userPreferencesStore.drawerMiniState);
    const isOutreachRoute = computed(() => activeRoutePath.value.includes('/outreach/'));
    const isMasterInboxRoute = computed(() => activeRoutePath.value.includes('/unibox/'));
    const isWorkspaceSettingsRoute = computed(() => activeRoutePath.value.includes('/settings/'));
    const isUserSettingsRoute = computed(() => activeRoutePath.value.includes('/account/'));

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

    // workspace settings routes
    const workspaceSettingsRoutes = computed(() => {
      if (isClientLoggedIn.value) {
        // clients should not see workspace settings
        return [];
      }

      const routes = [
        // general
        {
          name: 'general',
          label: 'General',
          icon: 'general',
          route: '/settings/general',
          isActive: activeRoutePath.value.includes('/settings/general'),
        },
      ];

      if (isRoleAdminOrAbove.value) {
        routes.push(
          // members
          {
            name: 'members',
            label: 'Client Members',
            icon: 'people',
            route: '/settings/members/clients',
            isActive: activeRoutePath.value.includes('/settings/members'),
          },
        );
      }

      return routes;
    });

    const whitelabelSettingsRoutes = computed(() => {
      if (isClientLoggedIn.value) {
        // clients should not see whitelabel settings
        return [];
      }

      const routes = [];

      if (isRoleAdminOrAbove.value) {
        routes.push(
          // theme
          {
            name: 'theme',
            label: 'Theme',
            icon: 'theme',
            route: '/settings/theme',
            isActive: activeRoutePath.value.includes('/settings/theme'),
          },
        );
      }

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

    const accountGeneralPageRoutes = computed(() => {
      const routes = [
        // profile
        {
          name: 'Profile',
          icon: 'profile',
          label: 'Profile',
          route: '/account/profile',
          isActive: activeRoutePath.value.includes('/account/profile'),
        },
        // billing
        {
          name: 'BillingSubscription',
          icon: 'billing',
          label: 'Billing & Subscription',
          route: '/account/billing',
          isActive: activeRoutePath.value.includes('/account/billing'),
        },
        // team members
        {
          name: 'TeamMembers',
          icon: 'people',
          label: 'Team Members',
          route: '/account/team',
          isActive: activeRoutePath.value.includes('/account/team'),
        },
      ];

      return routes;
    });

    const developerPageRoutesByUser = computed(() => {
      if (isClientLoggedIn.value) {
        // clients should not see whitelabel settings
        return [];
      }

      const routes = [
        // api key
        {
          name: 'UserApi',
          icon: 'api-key',
          label: 'API Key',
          route: '/account/api',
          isActive: activeRoutePath.value.includes('/account/api'),
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

      // general settings
      if (workspaceSettingsRoutes.value.length > 0) {
        settingsMenu.push({
          heading: 'Workspace Settings',
          routes: workspaceSettingsRoutes.value,
        });
      }

      // whitelabel settings
      if (whitelabelSettingsRoutes.value.length > 0) {
        settingsMenu.push({
          heading: 'Whitelabel Settings',
          routes: whitelabelSettingsRoutes.value,
        });
      }

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

    const allUserSettingsRoutes = computed(() => {
      const settingsMenu = [];

      // general settings
      if (accountGeneralPageRoutes.value.length > 0) {
        settingsMenu.push({
          heading: 'General',
          routes: accountGeneralPageRoutes.value,
        });
      }

      // developer options
      if (developerPageRoutesByUser.value.length > 0) {
        settingsMenu.push({
          heading: 'Developer Options',
          routes: developerPageRoutesByUser.value,
        });
      }

      return settingsMenu;
    });

    const sidebarRoutes = computed(() => {
      if (isOutreachRoute.value) {
        return allOutreachRoutes.value;
      }

      if (isWorkspaceSettingsRoute.value) {
        return allWorkspaceSettingsRoutes.value;
      }

      if (isUserSettingsRoute.value) {
        return allUserSettingsRoutes.value;
      }

      return [];
    });

    // methods
    const toggleDrawerMiniState = () => {
      userPreferencesStore.toggleDrawerMiniState();
    };

    return {
      // state
      ...toRefs(state),

      /// computed
      drawerMiniState,
      isMasterInboxRoute,
      activeRoutePath,

      sidebarRoutes,
      engagementRoutes,
      isRoleAdminOrAbove,
      activeWorkspaceName,

      allWorkspaceSettingsRoutes,
      isClientLoggedIn,

      // methods
      toggleDrawerMiniState,
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

  .drawer-resizer {
    :deep(.resizer-icon) {
      @include svg-icon-stroke('path, circle, rect', $grey-400);
    }
  }

  .workspaces-section {
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

      :deep(.arrow-icon) {
        width: 8px;
        height: 8px;
        @include svg-icon-stroke('path', $black);

        transition: transform .16s ease;

        &.rotate-180 {
          transform: rotate(180deg);
        }
      }

      .workspace-text {
        color: $black;
        font-size: 15px;
        font-weight: 500;

        max-width: 80%;
        text-transform: capitalize;
      }
    }
  }

  .secondary-settings-route {
    width: 100%;
    display: grid;
    grid-row-gap: 30px;

    .each-secondary-route-container {
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
