<template>
  <aside
    class="secondary-sidebar"
    :class="{ 'secondary-sidebar--mini': drawerMiniState }"
  >
    <div class="secondary-nav-container">
      <!-- 1. MASTER INBOX / UNIBOX VIEW -->
      <template v-if="isMasterInboxRoute">
        <!-- HEADER ROW FOR UNIBOX VIEW -->
        <div class="nav-header-row settings-header-row">
          <div class="flex items-center">
            <q-btn
              flat
              round
              dense
              size="sm"
              class="back-btn"
              @click="goBackToOutreach"
            >
              <q-icon name="arrow_back" size="18px" color="grey" />

              <AppTooltip
                v-if="drawerMiniState"
                anchor="center right"
                self="center left"
                content="Back to Outreach"
              />
            </q-btn>

            <span
              v-if="!drawerMiniState"
              class="header-section-title q-ml-xs"
            >
              Unibox
            </span>
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
            <LocalSvgIcon image="resizer-1" class="resizer-icon" />
          </q-btn>
        </div>

        <div class="nav-sections-scroll-area">
          <UniboxSidebarContent
            :mini-drawer="drawerMiniState"
          />
        </div>
      </template>

      <!-- 2. CAMPAIGN SETTINGS VIEW -->
      <template v-else-if="isWorkspaceSettingsRoute">
        <!-- HEADER ROW FOR SETTINGS VIEW -->
        <div class="nav-header-row settings-header-row">
          <div class="flex items-center">
            <q-btn
              flat
              round
              dense
              size="sm"
              class="back-btn"
              @click="goBackToOutreach"
            >
              <q-icon name="arrow_back" size="18px" color="grey" />

              <AppTooltip
                v-if="drawerMiniState"
                anchor="center right"
                self="center left"
                content="Back to Outreach"
              />
            </q-btn>

            <span
              v-if="!drawerMiniState"
              class="header-section-title q-ml-xs"
            >
              Campaign Settings
            </span>
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
            <LocalSvgIcon image="resizer-1" class="resizer-icon" />
          </q-btn>
        </div>

        <div class="nav-sections-scroll-area">
          <div class="each-secondary-route-container">
            <div class="sidebar-all-routes-grid">
              <q-item
                v-for="(page, index) in campaignSettingsRoutes"
                :key="`settings-route-${page.name}-${index}`"
                clickable
                class="sidebar-route-item"
                :to="page.route"
                :class="{ active: page.isActive }"
              >
                <LocalSvgIcon
                  :image="page.icon"
                  :class="`sidebar-route-icon ${page.iconClass || ''}`"
                />

                <p v-if="!drawerMiniState" class="page-label-text">
                  {{ page.label }}
                </p>

                <!-- Tooltip for mini drawer -->
                <AppTooltip
                  v-if="drawerMiniState"
                  anchor="center right"
                  self="center left"
                  :content="page.label"
                />
              </q-item>
            </div>
          </div>
        </div>
      </template>

      <!-- 3. MAIN OUTREACH VIEW CONTENT -->
      <template v-else>
        <!-- HEADER ROW FOR MAIN VIEW -->
        <div class="nav-header-row">
          <span
            v-if="!drawerMiniState"
            class="header-section-title"
          >
            Engage
          </span>

          <q-btn
            flat
            round
            unelevated
            size="xs"
            color="secondary"
            class="drawer-resizer"
            @click="toggleDrawerMiniState()"
          >
            <LocalSvgIcon image="resizer-1" class="resizer-icon" />
          </q-btn>
        </div>

        <div class="nav-sections-scroll-area">
          <div
            v-for="(section, sectionIndex) in outreachSections"
            :key="`outreach-section-${section.heading}-${sectionIndex}`"
            class="each-secondary-route-container"
          >
            <!-- Section heading for Infrastructure etc. -->
            <p
              v-if="!drawerMiniState && sectionIndex > 0"
              class="secondary-route-heading"
            >
              {{ section.heading }}
            </p>

            <div class="sidebar-all-routes-grid">
              <q-item
                v-for="(page, index) in section.routes"
                :key="`sidebar-route-${page.name}-${index}`"
                clickable
                class="sidebar-route-item"
                :to="page.route"
                :class="{ active: page.isActive }"
              >
                <LocalSvgIcon
                  :image="page.icon"
                  :class="`sidebar-route-icon ${page.iconClass || ''}`"
                />

                <p v-if="!drawerMiniState" class="page-label-text">
                  {{ page.label }}
                </p>

                <!-- Tooltip for mini drawer -->
                <AppTooltip
                  v-if="drawerMiniState"
                  anchor="center right"
                  self="center left"
                  :content="page.label"
                />
              </q-item>
            </div>
          </div>
        </div>

        <!-- Sticky / Pinned Bottom Section for Campaign Settings -->
        <div class="pinned-bottom-section">
          <q-item
            clickable
            class="sidebar-route-item settings-trigger-item"
            :class="{ active: isWorkspaceSettingsRoute }"
            @click="navigateToSettings"
          >
            <LocalSvgIcon
              image="more-filter"
              class="sidebar-route-icon"
            />

            <p v-if="!drawerMiniState" class="page-label-text">
              Campaign Settings
            </p>

            <AppTooltip
              v-if="drawerMiniState"
              anchor="center right"
              self="center left"
              content="Campaign Settings"
            />
          </q-item>
        </div>
      </template>
    </div>
  </aside>
</template>

<script>
// vue
import {
  defineComponent, computed, ref, watch,
} from 'vue';

// vue router
import { useRoute, useRouter } from 'vue-router';

// pinia store
import { useUserPreferencesStore } from 'src/stores/userPreferences.js';

// composables
import { useWorkspace } from 'src/composables/useWorkspace';

// Components
import AppTooltip from 'components/General/AppTooltip.vue';
import UniboxSidebarContent from 'components/Unibox/Sidebar/Content.vue';

export default defineComponent({
  name: 'SecondarySidebar',

  components: {
    AppTooltip,
    UniboxSidebarContent,
  },

  setup() {
    // route
    const $route = useRoute();
    const $router = useRouter();

    // composables
    const {
      isClientLoggedIn,
    } = useWorkspace();

    // Access the user store
    const userPreferencesStore = useUserPreferencesStore();

    // route tracking
    const lastOutreachRoute = ref('/outreach/campaigns-all');
    const lastSettingsRoute = ref('/settings/warmup-profiles');

    // computed
    const activeRoutePath = computed(() => $route.path);
    const drawerMiniState = computed(() => userPreferencesStore.drawerMiniState);

    const isMasterInboxRoute = computed(() => activeRoutePath.value.includes('/unibox/'));
    const isWorkspaceSettingsRoute = computed(() => activeRoutePath.value.includes('/settings/'));

    watch(
      activeRoutePath,
      (newPath) => {
        if (newPath.includes('/outreach/')) {
          lastOutreachRoute.value = newPath;
        } else if (newPath.includes('/settings/')) {
          lastSettingsRoute.value = newPath;
        }
      },
      { immediate: true },
    );

    // engage routes
    const engageRoutes = computed(() => [
      {
        name: 'campaigns',
        label: 'Campaign',
        icon: 'sequences',
        route: '/outreach/campaigns-all',
        isActive: activeRoutePath.value.includes('/outreach/campaigns'),
      },
      // {
      //   name: 'unibox',
      //   label: 'Unibox',
      //   icon: 'inbox',
      //   route: '/unibox/inbox',
      //   isActive: activeRoutePath.value.includes('/unibox'),
      // },
      {
        name: 'contacts',
        label: 'Contacts',
        icon: 'contacts',
        route: '/outreach/contacts/all',
        isActive: activeRoutePath.value.includes('/outreach/contacts'),
      },
      {
        name: 'lists',
        label: 'Lead List',
        icon: 'lists',
        route: '/outreach/lists/all',
        isActive: activeRoutePath.value.includes('/outreach/lists/'),
      },
    ]);

    // infrastructure routes
    const infrastructureRoutes = computed(() => [
      {
        name: 'mailboxes',
        label: 'Mailbox',
        icon: 'mail',
        route: '/outreach/mailboxes',
        isActive: activeRoutePath.value.includes('/outreach/mailbox'),
      },
      {
        name: 'linkedin',
        label: 'Linkedin',
        icon: 'linkedin-1',
        iconClass: 'linkedin-icon',
        route: '/outreach/linkedin/accounts',
        isActive: activeRoutePath.value.includes('/outreach/linkedin'),
      },
      {
        name: 'domains',
        label: 'Domain',
        icon: 'domains',
        route: '/outreach/domains',
        isActive: activeRoutePath.value.includes('/outreach/domain'),
      },
    ]);

    const outreachSections = computed(() => [
      {
        heading: 'Engage',
        routes: engageRoutes.value,
      },
      {
        heading: 'Infrastructure',
        routes: infrastructureRoutes.value,
      },
    ]);

    const developerPageRoutesByWorkspace = computed(() => {
      if (isClientLoggedIn.value) {
        return [];
      }

      return [
        {
          name: 'Webhooks',
          icon: 'webhooks',
          label: 'Webhooks',
          route: '/settings/webhooks',
          isActive: activeRoutePath.value.includes('/settings/webhooks'),
        },
      ];
    });

    const campaignSettingsRoutes = computed(() => {
      const routes = [
        {
          name: 'WarmupProfiles',
          icon: 'warmup-1',
          label: 'Warmup Profiles',
          route: '/settings/warmup-profiles',
          isActive: activeRoutePath.value.includes('/settings/warmup-profiles'),
        },
        {
          name: 'SendingSchedule',
          icon: 'seq-schedule',
          label: 'Sending Schedule',
          route: '/settings/sending-schedule',
          isActive: activeRoutePath.value.includes('/settings/sending-schedule'),
        },
        {
          name: 'SuppressionList',
          icon: 'mails-bounced',
          label: 'Blocklist',
          route: '/settings/suppression-list',
          isActive: activeRoutePath.value.includes('/settings/suppression-list'),
        },
        {
          name: 'ReplyCategorization',
          icon: 'medal',
          label: 'Reply Categorisation',
          route: '/settings/reply-categorization',
          isActive: activeRoutePath.value.includes('/settings/reply-categorization'),
        },
      ];

      if (developerPageRoutesByWorkspace.value.length > 0) {
        routes.push(...developerPageRoutesByWorkspace.value);
      }

      return routes;
    });

    // methods
    const toggleDrawerMiniState = () => {
      userPreferencesStore.toggleDrawerMiniState();
    };

    const navigateToSettings = () => {
      $router.push(lastSettingsRoute.value || '/settings/warmup-profiles');
    };

    const goBackToOutreach = () => {
      $router.push(lastOutreachRoute.value || '/outreach/campaigns-all');
    };

    return {
      drawerMiniState,
      isMasterInboxRoute,
      isWorkspaceSettingsRoute,
      activeRoutePath,

      outreachSections,
      campaignSettingsRoutes,

      toggleDrawerMiniState,
      navigateToSettings,
      goBackToOutreach,
    };
  },
});
</script>

<style lang="scss" scoped>
.secondary-sidebar {
  width: 230px;
  min-width: 230px;
  min-height: inherit;
  height: 100%;
  overflow-y: auto;

  border-radius: 8px 0 0 8px;
  border-right: 1px solid $grey-50;
  background: rgba($color: var(--primary-rgb), $alpha: 0.02);

  padding: 16px 8px;

  flex-direction: column;
  display: flex;

  .secondary-nav-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .nav-header-row {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
      padding: 0 4px;

      .header-section-title {
        color: $grey;
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.39px;
      }

      &.settings-header-row {
        margin-bottom: 8px;
      }

      .back-btn {
        padding: 4px;
        min-height: unset;
      }
    }

    .secondary-route-heading {
      color: $grey;
      font-size: 13px;
      font-weight: 500;
      line-height: 16px;
      letter-spacing: 0.39px;

      padding: 0 8px;
      margin-bottom: 10px;

      &.settings-heading {
        margin-bottom: 14px;
      }
    }

    .nav-sections-scroll-area {
      flex: 1;
      overflow-y: auto;

      .each-secondary-route-container {
        margin-bottom: 18px;

        &:last-child {
          margin-bottom: 0px;
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
              line-height: 16px;
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

    .pinned-bottom-section {
      margin-top: auto;
      padding-top: 12px;

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
          line-height: 16px;
        }

        :deep(.sidebar-route-icon) {
          @include svg-icon-stroke('path, circle, rect, ellipse', $black);
        }

        &.active {
          background: rgba($color: var(--primary-rgb), $alpha: 0.1);

          :deep(.sidebar-route-icon) {
            @include svg-icon-stroke('path, circle, rect, ellipse', $primary);
          }

          .page-label-text {
            color: $primary;
            font-weight: 500;
          }
        }
      }
    }
  }

  &.secondary-sidebar--mini {
    width: 56px;
    min-width: 56px;

    .secondary-nav-container {
      .nav-header-row {
        justify-content: center;

        &.settings-header-row {
          flex-direction: column-reverse;
          gap: 12px;
        }

        .header-section-title {
          display: none;
        }
      }

      .secondary-route-heading {
        display: none;
      }

      .nav-sections-scroll-area {
        overflow-x: hidden;

        .each-secondary-route-container {
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

      .pinned-bottom-section {
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
</style>
