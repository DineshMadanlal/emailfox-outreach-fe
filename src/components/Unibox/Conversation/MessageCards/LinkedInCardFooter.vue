<template>
  <div class="card-footer-actions">
    <q-btn
      flat
      dense
      no-caps
      class="footer-action-btn"
      :disable="isReadOnly"
      @click="!isReadOnly && $emit('reply')"
    >
      <LocalSvgIcon
        image="email-reply"
        class="footer-btn-icon q-mr-xs"
      />
      <span class="btn-text">Reply</span>
      <AppTooltip
        v-if="isReadOnly"
        content="You have read-only access in this workspace"
      />
    </q-btn>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// composables
import { usePermissions } from 'src/composables/usePermissions';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

export default defineComponent({
  name: 'LinkedInCardFooter',

  components: {
    AppTooltip,
  },

  emits: ['reply'],

  setup() {
    // composables
    const { isReadOnly } = usePermissions();

    return {
      // computed
      isReadOnly,
    };
  },
});
</script>

<style lang="scss" scoped>
.card-footer-actions {
  padding: 8px 16px;
  border-top: 1px solid $grey-50;
  display: flex;
  align-items: center;
  background-color: $white;
  border-radius: 0 0 8px 8px;

  .footer-action-btn {
    color: $primary;
    font-size: 14px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 4px;

    :deep(.footer-btn-icon) {
      width: 16px;
      height: 16px;
      @include svg-icon-stroke('path, circle, rect', $primary);
    }

    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.08);
    }
  }
}
</style>
