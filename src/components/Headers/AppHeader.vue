<template>
  <!-- header -->
  <div
    id="appHeader"
    class="app-header"
    :style="{ height: `${appHeaderHeight}px` }"
  >
    <!-- container -->
    <div class="app-header-container">
      <slot name="headerLeftMostSection" />

      <h3 class="app-header-text">
        {{ title }}
      </h3>

      <slot name="headerLeftSection" />

      <q-space />

      <slot name="headerRightSection" />

      <!-- button -->
      <q-btn
        flat
        round
        dense

        icon="menu"
        class="app-header-menu-icon"

        @click="toggleLeftDrawer()"
      />
    </div>

    <slot name="headerBottomSection" />
  </div>
</template>
<script>
// vue
import { defineComponent, computed } from 'vue';

// Import the Pinia store
import { storeExclusions } from 'src/stores/storeExclusions.js';

export default defineComponent({
  name: 'AppHeader',

  props: {
    title: {
      type: String,
      default: 'Settings',
    },
  },

  setup() {
    // Access the user store
    const storeExclusionsPinia = storeExclusions();

    // computed
    const appHeaderHeight = computed(() => storeExclusionsPinia.appHeaderHeight);

    return {
      // computed
      appHeaderHeight,

      // methods
      toggleLeftDrawer: storeExclusionsPinia.toggleLeftDrawer,
    };
  },

});
</script>

<style lang="scss" scoped>
.app-header {
  width: 100%;
  padding: 20px;

  top: 0px;
  position: sticky;

  z-index: 3;
  background: $white;
  // border-bottom: 1px solid $grey-50;
  border-radius: 8px 8px 0px 0px;

  height: fit-content !important;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 16px;
  }

  .app-header-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;

    .app-header-text {
      color: $black;
      font-size: 18px;
      font-weight: 600;
    }

    .app-header-menu-icon {
      display: none;
      margin-left: 8px;

      // sm max
      @media (max-width: $breakpoint-sm-max) {
        display: block;
      }
    }
  }
}
</style>
