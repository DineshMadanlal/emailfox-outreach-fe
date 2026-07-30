<template>
  <div
    class="preferences-sidebar-content"
    :class="{ 'mini': miniDrawer }"
  >
    <q-item
      clickable
      v-for="(page, index) in skyboxRoutes"

      :to="page.route"
      :key="`preferences-page-option-${index}-${page.label}`"

      class="preferences-route-item"
      :class="{ active: activeRoute.includes(page.routeCheck) }"
    >
      <LocalSvgIcon
        :image="page.icon"
        class="preferences-page-icon"
      />

      <!-- Tooltip -->
      <AppTooltip
        v-if="miniDrawer"
        :content="page.label"

        anchor="center right"
        self="center left"
        :offset="[6, 10]"
      />

      <!--  -->
      <p
        v-if="!miniDrawer"
        class="preferences-label-text"
      >
        {{ page.label }}
      </p>

    </q-item>
  </div>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// vue-router
import { useRoute } from 'vue-router';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

export default defineComponent({
  name: 'SkyBoxSidebarContent',

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

    // computed
    const activeRoute = computed(() => $route.path);

    const skyboxRoutes = computed(() => {
      const routes = [
        {
          icon: 'folder',
          name: 'PreferencesViews',
          label: 'Folders',
          route: '/unibox/preferences/folders',
          routeCheck: '/unibox/preferences/folder',
        },
      ];

      return routes;
    });

    return {
      // computed
      skyboxRoutes,
      activeRoute,
    };
  },
});
</script>

<style lang="scss" scoped>
.preferences-sidebar-content {
  width: 100%;

  padding: 20px 6px 20px 6px;

  display: grid;
  grid-row-gap: 6px;

  .preferences-route-item {
    display: flex;
    border-radius: 6px;
    align-items: center;
    min-height: unset;

    padding: 10px 16px;

    &.active {
      background-color: $grey-50;
    }

    .preferences-label-text {
      margin-left: 12px;

      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }

    :deep(.preferences-page-icon) {
      min-width: 16px;
      min-height: 16px;

      max-width: 16px;
      max-height: 16px;
    }

    &.active {
      :deep(.preferences-page-icon) {
        path {
          stroke: $black;

          &.bounced-path {
            stroke: unset;
            fill: $black;
          }
        }

        circle {
          fill: $black;
        }
      }

      .preferences-label-text {
        font-weight: 500;
      }
    }
  }

  &.mini {
    .preferences-label-text {
      display: none;
    }

    .preferences-route-item {
      flex-direction: column;
    }
  }
}
</style>
