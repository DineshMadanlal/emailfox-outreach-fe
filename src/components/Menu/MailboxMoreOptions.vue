<template>
  <q-list class="mailbox-more-options-list">
    <!-- Delete Domain -->
    <q-item
      clickable

      class="mailbox-option-item delete-mailbox-item"

      @click="$emit('deleteMailbox')"
    >
      <q-item-section>
        <div class="flex no-wrap items-center">
          <LocalSvgIcon image="delete" class="delete-icon" />

          <p class="mailbox-item-label">
            Delete Mailbox
          </p>
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MailboxMoreOptions',

  emits: ['deleteMailbox'],
});
</script>

<style lang="scss" scoped>
.mailbox-more-options-list {
  min-width: 240px;

  .mailbox-option-item {
    min-height: unset;
    padding: 10px 12px;
    cursor: pointer;

    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
    }

    :deep(.delete-icon) {
      @include svg-icon-stroke('path, circle, rect', $grey);
    }

    .mailbox-item-label {
      color: $black;
      font-size: 14px;
      font-weight: 400;

      margin-left: 8px;
    }

    &.delete-mailbox-item {
      :deep(.delete-icon) {
        @include svg-icon-stroke('path, circle, rect', $negative);
      }

      .mailbox-item-label {
        color: $negative;
      }

      &:hover {
        background-color: rgba($color: var(--negative-rgb), $alpha: 0.1);
      }
    }
  }
}
</style>
