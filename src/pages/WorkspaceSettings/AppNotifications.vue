<template>
  <div class="notification-settings">
    <!-- Header -->
    <div class="settings-section-header">
      <!-- header text -->
      <p class="settings-header-text">
        Notifications
      </p>

      <!-- label text -->
      <p class="settings-label-text">
        Receive personalized notifications and alerts.
      </p>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// quasar
import { useMeta } from 'quasar';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

export default defineComponent({
  name: 'AppNotifications',

  setup() {
    // composition API
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Notifications'));
  },
});
</script>

<style lang="scss" scoped>
.notification-settings {
  width: 100%;
}
</style>
