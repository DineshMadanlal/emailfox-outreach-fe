<template>
  <q-card flat class="settings-card custom-signature-card">
    <div class="card-header">
      <div class="flex no-wrap items-center">
        <LocalSvgIcon
          image="signature"
          classes="section-header-icon"
        />
        <h6 class="section-title">
          Signature
        </h6>
      </div>

      <q-btn
        flat
        dense
        no-caps
        color="primary"
        class="edit-btn"
        @click="$emit('editSignature')"
      >
        <LocalSvgIcon
          image="edit"
          classes="edit-icon"
        />
        <span>Edit</span>
      </q-btn>
    </div>

    <div class="card-body signature-body custom-scrollbar">
      <div
        v-if="mailboxByJson.signature"
        class="signature-content"
        v-html="mailboxByJson.signature"
      />
      <p
        v-else
        class="empty-signature-text"
      >
        No custom signature set. Click Edit to add one.
      </p>
    </div>
  </q-card>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CustomSignature',

  props: {
    mailboxByJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  emits: ['editSignature'],
});
</script>

<style lang="scss" scoped>
.settings-card {
  border-radius: 8px;
  border: 1px solid $grey-50;
  background: $white;
  display: flex;
  flex-direction: column;

  .card-header, .card-body {
    padding: 20px;

    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid $grey-50;
  }

  .card-body {
    &.signature-body {
      .signature-content {
        color: $black;
        font-size: 14px;
        max-height: 300px;
      }

      .empty-signature-text {
        color: $grey-400;
        font-size: 13px;
        margin: 0;
        font-style: italic;
      }
    }
  }

  .section-header-icon {
    width: 16px;
    height: 16px;
  }

  .section-title {
    color: $black;
    font-size: 16px;
    font-weight: 600;
    margin-left: 12px;
  }

  .edit-btn {
    font-size: 14px;
    font-weight: 500;
    padding: 2px 6px;

    :deep(.edit-icon) {
      width: 14px;
      height: 14px;
      margin-right: 4px;

      @include svg-icon-stroke('path', $primary);
    }
  }
}
</style>
