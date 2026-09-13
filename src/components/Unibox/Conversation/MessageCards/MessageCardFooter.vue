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

    <span class="footer-divider" />

    <q-btn
      flat
      dense
      no-caps
      class="footer-action-btn"
      :disable="isReadOnly"
      @click="!isReadOnly && $emit('forward')"
    >
      <LocalSvgIcon
        image="email-reply"
        class="footer-btn-icon forward-icon q-mr-xs"
      />
      <span class="btn-text">Forward</span>
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
  name: 'MessageCardFooter',

  components: {
    AppTooltip,
  },

  emits: ['reply', 'forward'],

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
  gap: 8px;
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

    :deep(.forward-icon) {
      transform: rotateY(180deg);
    }

    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.08);
    }
  }

  .footer-divider {
    width: 1px;
    height: 14px;
    background-color: $grey-100;
  }
}
</style>
