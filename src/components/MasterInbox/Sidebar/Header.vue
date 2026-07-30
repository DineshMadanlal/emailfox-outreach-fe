<template>
  <div
    class="master-inbox-sidebar-header"
    :class="{ 'mini': miniDrawer }"

    v-if="!isMobileDevice"
  >
    <!-- header -->
    <h5
      class="master-inbox-drawer-title"
    >
      {{ isPrimaryPlatform ? 'SkyBox' : 'Unibox' }}
    </h5>

    <q-space />

    <!-- mini button -->
    <q-btn
      flat
      round
      unelevated

      size="xs"
      color="secondary"
      class="sidebar-drawer-resizer"

      @click="toggleDrawerMiniState()"
    >
      <LocalSvgIcon
        image="expand-hide"
        classes="expand-hide-icon"
      />
    </q-btn>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// stores
import { useAuthStore } from 'src/stores/auth';

export default defineComponent({
  name: 'SkyBoxSidebarHeader',

  emits: ['toggleDrawerMiniState'],

  props: {
    miniDrawer: {
      type: Boolean,
      default: false,
    },
    isMobileDevice: {
      type: Boolean,
      default: false,
    },
  },

  setup(_, { emit }) {
    // store
    const authStorePinia = useAuthStore();

    // computed
    const isPrimaryPlatform = computed(() => authStorePinia.isPrimaryPlatform);

    // methods
    const toggleDrawerMiniState = () => {
      // emit event
      emit('toggleDrawerMiniState');
    };

    return {
      // computed
      isPrimaryPlatform,

      // methods
      toggleDrawerMiniState,
    };
  },
});
</script>

<style lang="scss" scoped>
.master-inbox-sidebar-header {
  width: 100%;
  display: flex;
  align-items: center;

  padding: 20px 16px 0px 16px;

  .master-inbox-drawer-title {
    color: $black;
    font-size: 18px;
    font-weight: 600;
  }

  .sidebar-drawer-resizer {
    // xs max
    @media (max-width: $breakpoint-sm-max) {
      display: none;
    }
  }

  :deep(.expand-hide-icon) {
    transition: transform 0.3s;
  }

  &.mini {
    .master-inbox-drawer-title {
      display: none;
    }

    :deep(.expand-hide-icon) {
      transform: rotate3d(0, 0, 1, 180deg);
    }
  }
}
</style>
