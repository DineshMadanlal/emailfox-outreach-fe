<template>
  <!-- Auth Layout -->
  <q-layout view="hHh lpR fFf" class="auth-layout">
    <!-- Header -->
    <!--<q-header
      class="auth-header"
    >
      <!~~ Toolbar ~~>
      <q-toolbar
        class="auth-header-toolbar"
      >
      </q-toolbar>
    </q-header>-->

    <q-page-container>
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>

  </q-layout>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// stores
import { useAuthStore } from 'src/stores/auth';

export default defineComponent({
  name: 'AuthLayout',

  setup() {
    // store
    const authStorePinia = useAuthStore();

    // computed
    const isPrimaryPlatform = computed(() => authStorePinia.isPrimaryPlatform);
    const activeWorkspaceData = computed(() => authStorePinia.getActiveWorkspaceData);

    return {
      // computed
      isPrimaryPlatform,

      activeWorkspaceData,
    };
  },
});
</script>

<style lang="scss" scoped>
.auth-layout {
  background: rgba($color: var(--grey-rgb), $alpha: 0.05);

  // Auth Header
  .auth-header {
    background-color: $secondary;
    box-shadow: 0px 2px 4px rgba(141, 143, 169, 0.1);

    // Auth Header Toolbar
    .auth-header-toolbar {
      min-height: 60px;

      .app-p-logo-link {
        display: flex;
        height: fit-content;

        max-height: 30px;
        width: 130px;
      }

      .logo-link {
        display: flex;
        height: fit-content;
      }
    }

  }

  :deep(.auth-submit-btn) {
    height: 44px;
  }
}
</style>
