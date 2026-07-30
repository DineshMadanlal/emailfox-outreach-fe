<template>
  <q-layout
    view="hHh lpR fFf"
    class="header-layout"
  >
    <!-- Header -->
    <q-header
      class="bg-secondary authentication-header"
    >
      <q-toolbar class="header-toolbar">
        <!-- Show logo if primary app -->
        <LocalSvgIcon
          image="app-logo"

          :isIconFolder="false"

          v-if="isPrimaryApp"
        />

        <q-space />

        <LoggedInUser
          :drawerMiniState="false"
        />
      </q-toolbar>
    </q-header>

    <!-- Page Container -->
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

// Utils
import { isMainApp } from 'src/utils/applyBranding';

// Components
import LoggedInUser from 'components/Cards/LoggedInUser.vue';

export default defineComponent({
  name: 'HeaderLayout',

  components: {
    LoggedInUser,
  },

  setup() {
    // computed
    const isPrimaryApp = computed(() => isMainApp());

    return {
      // computed
      isPrimaryApp,
    };
  },
});
</script>

<style lang="scss" scoped>
.header-toolbar {
  width: 100%;

  .authentication-header {
    width: 100%;
    padding: 12px 16px;
  }
}
</style>
