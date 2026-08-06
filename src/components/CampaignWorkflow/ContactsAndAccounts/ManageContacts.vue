<template>
  <q-card flat class="add-options-card">
    <!-- header -->
    <div class="options-header">
      <div class="header-icon-squared">
        <LocalSvgIcon image="contacts" class="option-header-icon" />
      </div>

      <p class="option-header-text">
        Add Contacts
      </p>
    </div>

    <!-- content -->
    <div class="options-content">

    </div>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SaveContacts',

  props: {
    campaignById: {
      type: Object,
      default: () => ({}),
    },
  },
});
</script>

<style lang="scss" scoped>
.add-options-card {
  width: 100%;
  max-width: 745px;
  border: 1px solid $grey-50;

  // header
  .options-header {
    display: flex;
    flex-wrap: wrap;
    padding: 16px 20px;
    align-items: center;

    gap: 12px;
    border-bottom: 1px solid $grey-50;

    .header-icon-squared {
      height: 26px;
      min-width: 26px;
      max-width: 26px;

      padding: 5px;
      border-radius: 4px;
      border: 1px solid rgba(var(--primary-rgb), 0.2);
      background: rgba(var(--primary-rgb), 0.1);

      :deep(.option-header-icon) {
        width: 100%;
        height: 100%;

        @include svg-icon-stroke('path, circle, rect, ellipse', $grey);
      }
    }

    .option-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;
    }
  }

  // content
  .options-content {
    width: 100%;
    padding: 16px 20px;
  }

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    // header
    .options-header {
      padding: 16px 12px;
    }

    // content
    .options-content {
      padding: 16px 12px;
    }
  }
}
</style>
