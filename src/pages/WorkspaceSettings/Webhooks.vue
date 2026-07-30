<template>
  <div class="webhooks-settings">
    <!-- Header -->
    <div class="settings-section-header">
      <!-- left side -->
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          Webhooks
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          Manage your workspace webhooks.
        </p>
      </div>

      <!-- right side -->
      <div class="settings-header-right-side">
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'WebhooksSettings',
});
</script>

<style lang="scss" scoped>
.webhooks-settings {
  width: 100%;
}
</style>
