<template>
  <div
    class="list-option-item"
  >
    <!-- folder -->
    <div class="folder-icon-container">
      <LocalSvgIcon
        image="folder"
        class="folder-icon"
      />
    </div>
    <!-- name -->
    <p class="list-name-text">
      {{ listJson.list_name }}
    </p>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CampaignListItem',

  props: {
    listJson: {
      type: Object,
      default: () => ({}),
    },
  },
});
</script>

<style lang="scss" scoped>
.list-option-item {
  width: fit-content;
  border-radius: 56px;
  border: 1px solid $grey-50;
  background: $white;
  padding: 6px 8px;

  display: flex;
  align-items: center;
  gap: 8px;

  .folder-icon-container {
    min-width: 32px;
    min-height: 32px;
    max-width: 32px;
    max-height: 32px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;
    background: rgba(var(--primary-rgb), 0.1);

    :deep(.folder-icon) {
      width: 16px;
      height: 16px;

      @include svg-icon-stroke('path, circle, rect, ellipse', $primary);
    }
  }

  .list-name-text {
    color: $black;
    font-size: 14px;
    line-height: 16px;
    font-weight: 500;
  }
}
</style>
