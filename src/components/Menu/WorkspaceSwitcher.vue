<template>
  <q-card class="workspace-switcher-card">
    <!-- View All Workspaces -->
    <div
      class="workspaces-list-container"
      :class="{ loading: isApiLoading }"
    >
      <ApiLoader
        v-if="isApiLoading && allWorkspaces.length === 0"
        show
      />

      <q-item
        v-for="workspace in allWorkspaces"
        :key="`each-workspace-${workspace.id}`"

        clickable
        class="workspace-switcher-item"
        :class="{ active: activeWorkspaceJson.id === workspace.id }"

        type="a"
        :href="getWorkspaceUrl(workspace)"
      >
        <div class="flex no-wrap items-center">
          <LogoOrText :workspace="workspace" />

          <p class="workspace-route-text">
            {{ workspace.name }}
          </p>
        </div>
      </q-item>
    </div>

    <!-- Create workspace -->
    <q-item
      clickable
      class="workspace-switcher-item create-workspace-item"

      type="a"
      target="_blank"
      :href="workspceActionUrl('create')"
    >
      <div class="flex no-wrap items-center">
        <div class="workspace-box">
          <LocalSvgIcon
            image="plus"
            class="workspace-page-icon"
          />
        </div>

        <p class="workspace-route-text">
          Create a New Workspace
        </p>
      </div>
    </q-item>
  </q-card>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// vue router
import { useRoute } from 'vue-router';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import LogoOrText from 'components/Workspaces/LogoOrText.vue';

// pinia store
import { useUserPreferencesStore } from 'src/stores/userPreferences.js';

// composables
import { useWorkspace } from 'src/composables/useWorkspace';

export default defineComponent({
  name: 'WorkspaceSwitcher',

  components: {
    ApiLoader,
    LogoOrText,
  },

  props: {
    isApiLoading: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    // router
    const $route = useRoute();

    // Access the user store
    const userPreferencesStore = useUserPreferencesStore();

    // composables
    const {
      activeWorkspaceJson,

      getWorkspaceUrl,
      workspceActionUrl,
    } = useWorkspace();

    // computed
    const allWorkspaces = computed(() => userPreferencesStore.getAllWorkspaces);

    const currentRoute = computed(() => {
      const currentPath = $route.fullPath;
      const pathSegments = currentPath.split('/').filter(Boolean);

      // remove the first segment which is workspace slug
      const routeWithoutSlug = pathSegments.slice(1).join('/');

      return routeWithoutSlug || 'outreach/campaigns-all';
    });

    return {
      // computed
      allWorkspaces,
      currentRoute,
      activeWorkspaceJson,

      // methods
      getWorkspaceUrl,
      workspceActionUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
.workspace-switcher-card {
  padding: 3px;
  width: 100%;
  max-width: 280px;
  border-radius: 6px;
  background: $white;
  /* Dropdown Shadow */
  box-shadow: 0 1px 12px 2px rgba(0, 0, 0, 0.12);

  @include custom-scrollbar;

  .workspaces-list-container {
    max-height: 400px;
    overflow-y: auto;
    margin-bottom: 3px;

    &.loading {
      position: relative;
      height: 100px;
    }
  }

  .workspace-switcher-item {
    min-height: unset;
    padding: 6px 12px;
    border-radius: 6px;
    border-bottom: 1px solid rgba($color: var(--grey-50-rgb), $alpha: 0.4);

    .workspace-box {
      padding: 8px;
      border-radius: 5px;
      background: $grey-50;

      min-height: 32px;
      min-width: 32px;
      max-height: 32px;
      max-width: 32px;

      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.workspace-page-icon) {
        @include svg-icon-stroke('path, circle', $grey);
      }
    }

    .workspace-route-text {
      margin-left: 12px;

      font-size: 14px;
      font-weight: 400;
      line-height: 16px;
      color: rgba($color: var(--black-rgb), $alpha: 0.8);
    }

    &:last-child {
      border-bottom: none;
    }

    &.create-workspace-item {
      border-top: 1px solid rgba($color: var(--grey-50-rgb), $alpha: 0.4);
    }

    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
    }

    &.active {

      &::before {
        content: "";
        position: absolute;
        left: 0px;
        top: 12px;
        bottom: 12px;
        width: 3px;
        border-radius: 10px;
        background: $primary;
      }

      .workspace-route-text {
        font-weight: 500;
      }
    }
  }
}
</style>
