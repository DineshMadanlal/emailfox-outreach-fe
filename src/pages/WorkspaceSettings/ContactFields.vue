<template>
  <div class="contact-fields-settings">
    <!-- Header -->
    <div class="settings-section-header">
      <!-- left side -->
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          Contact Fields
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          Manage the contact fields for your workspace.
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
  name: 'ContactFields',
});
</script>

<style lang="scss" scoped>
.contact-fields-settings {
  width: 100%;
}
</style>
