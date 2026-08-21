<template>
  <div class="settings-full-section custom-tracking-domain-section">
    <div class="section-heading-row">
      <LocalSvgIcon
        image="compose"
        classes="section-header-icon"
      />
      <h6 class="section-title">
        Custom Tracking Domain
      </h6>
    </div>

    <p class="section-description">
      Improve deliverability and build trust by using your own domain
      for email tracking links. Tracking links will appear as
      part of your brand instead of a shared tracking domain.
    </p>

    <!-- Configured Value or Add Button -->
    <div v-if="customTrackingDomain" class="configured-item-box">
      <div class="flex items-center no-wrap">
        <span class="configured-value-text">{{ customTrackingDomain }}</span>
      </div>
      <q-btn
        flat
        dense
        no-caps
        color="primary"
        class="edit-btn"
        @click="$emit('editCustomTrackingDomain')"
      >
        <LocalSvgIcon
          image="edit"
          classes="edit-icon"
        />
        <span>Edit</span>
      </q-btn>
    </div>

    <q-card
      v-else
      flat
      class="action-box-card"
      @click="$emit('addCustomTrackingDomain')"
    >
      <p class="action-box-text">
        + Add CNAME Record
      </p>
    </q-card>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'CustomTrackingDomain',

  props: {
    mailboxByJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  emits: ['addCustomTrackingDomain', 'editCustomTrackingDomain'],

  setup(props) {
    const customTrackingDomain = computed(() => (
      props.mailboxByJson.custom_tracking_domain
      || props.mailboxByJson.tracking_domain
      || ''
    ));

    return {
      customTrackingDomain,
    };
  },
});
</script>

<style lang="scss" scoped>
.settings-full-section {
  display: flex;
  flex-direction: column;

  .section-heading-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
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

  .section-description {
    color: rgba($color: var(--black-rgb), $alpha: 0.7);
    font-size: 13px;
    font-weight: 400;
    line-height: 1.5;
    margin: 0 0 16px 0;
    max-width: 780px;
  }

  .configured-item-box {
    border: 1px solid $grey-50;
    border-radius: 6px;
    background: $white;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 600px;

    .configured-value-text {
      color: $black;
      font-size: 14px;
      font-weight: 500;
    }
  }

  .action-box-card {
    border: 1px solid $grey-50;
    border-radius: 6px;
    background: $white;
    padding: 14px 16px;
    cursor: pointer;
    max-width: 600px;
    transition: border-color 0.2s ease;

    &:hover {
      border-color: rgba($color: var(--primary-rgb), $alpha: 0.4);
    }

    .action-box-text {
      color: $primary;
      font-size: 13px;
      font-weight: 600;
      margin: 0;
    }
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
