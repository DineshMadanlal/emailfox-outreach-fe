<template>
  <div class="user-settings-main-index">
    <!-- button -->
    <q-btn
      flat
      round
      dense

      icon="menu"
      class="app-header-menu-icon"

      @click="toggleLeftDrawer()"
    />

    <router-view />
  </div>
</template>
<script>
// vue
import { defineComponent } from 'vue';

// Import the Pinia store
import { storeExclusions } from 'src/stores/storeExclusions.js';

export default defineComponent({
  name: 'MainIndex',

  setup() {
    // Access the user store
    const storeExclusionsPinia = storeExclusions();

    return {
      // methods
      toggleLeftDrawer: storeExclusionsPinia.toggleLeftDrawer,
    };
  },
});
</script>

<style lang="scss" scoped>
.user-settings-main-index {
  width: 100%;
  flex: 1;
  overflow-y: auto;

  display: flex;

  .app-header-menu-icon {
    display: none;

    // sm max
    @media (max-width: $breakpoint-sm-max) {
      display: block;

      position: absolute;
      right: 12px;
      top: 24px;

      z-index: 4;
    }
  }

  // header
  :deep(.settings-section-header) {
    width: 100%;
    padding-bottom: 16px;
    border-bottom: 1px solid $grey-50;

    position: sticky;
    top: 0;
    z-index: 3;
    background-color: $white;

    padding: 24px 32px 16px 32px;

    display: flex;
    justify-content: space-between;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }

    // sm max
    @media (max-width: $breakpoint-sm-max) {
      padding: 24px 20px;

      flex-wrap: wrap;
      gap: 16px;
    }

    .settings-header-text {
      color: $black;
      font-size: 18px;
      font-weight: 600;
    }

    .settings-label-text {
      margin-top: 6px;

      font-size: 14px;
      font-weight: 400;
      line-height: 16px;
      color: rgba($color: var(--black-rgb), $alpha: 0.5);
    }

    .settings-header-right-side {
      // sm max
      @media (max-width: $breakpoint-sm-max) {
        padding-right: 36px;
      }
    }
  }

  // content
  :deep(.settings-section-content) {
    padding: 24px 32px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }

    // sm max
    @media (max-width: $breakpoint-sm-max) {
      padding: 24px 20px;
    }
  }
}
</style>
