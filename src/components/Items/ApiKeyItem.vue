<template>
  <q-item
    v-bind="itemProps"

    class="api-key-item"
  >
    <div>
      <!-- Name -->
      <div class="flex no-wrap">
        <p class="api-key-name-text">
          {{ opt.name }}
        </p>

        <!-- Inactive status -->
        <p
          v-if="!opt.is_valid"
          class="inactive-text"
        >
          Inactive
        </p>
      </div>

      <!-- API Key -->
      <p class="api-key-value-text">
        {{ opt.api_key }}
      </p>

    </div>
  </q-item>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ApiKeyItem',

  props: {
    itemProps: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    opt: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },
});
</script>

<style lang="scss" scoped>
.api-key-item {
  width: 100%;
  min-height: unset;
  padding: 10px 16px;

  .api-key-name-text {
    font-size: 14px;
    font-weight: 500;
    line-height: 16px;
  }

  .inactive-text {
    border-radius: 4px;
    background: $grey-50;
    border: 1px solid $grey-100;

    color: $grey;
    font-size: 12px;
    font-weight: 500;
    line-height: 14px; /* 116.667% */

    padding: 0px 6px;

    margin-left: 8px;
  }

  .api-key-value-text {
    color: $grey;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px; /* 114.286% */

    margin-top: 5px;
  }
}
</style>
