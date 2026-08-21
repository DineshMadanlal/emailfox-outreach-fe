<template>
  <q-card flat class="settings-card general-preference-card">
    <!-- card header -->
    <div class="card-header">
      <div class="flex no-wrap items-center">
        <LocalSvgIcon
          image="more-filter"
          classes="section-header-icon"
        />

        <h6 class="section-title">
          General Preference
        </h6>
      </div>

      <q-btn
        flat
        dense
        no-caps
        color="primary"
        class="edit-btn"
        @click="$emit('editGeneralPreference')"
      >
        <LocalSvgIcon
          image="edit"
          classes="edit-icon"
        />
        <span>Edit</span>
      </q-btn>
    </div>

    <!-- Card Body -->
    <div class="card-body general-preference-body">
      <!-- Maximum Emails/Day -->
      <div class="preference-item">
        <div class="flex no-wrap items-center">
          <p class="preference-label q-mr-sm">
            Maximum Emails/Day
          </p>
        </div>
        <p class="preference-value">
          {{ mailboxByJson.sending_limit_per_day || 0 }}
        </p>
      </div>

      <!-- Minimum Time Gap -->
      <div class="preference-item">
        <div class="flex no-wrap items-center">
          <p class="preference-label q-mr-sm">
            Minimum Time Gap
          </p>
        </div>

        <p class="preference-value">
          {{ mailboxByJson.minimum_time_gap_mins || 0 }} min
        </p>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'GeneralPreference',

  props: {
    mailboxByJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  emits: ['editGeneralPreference'],
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
    &.general-preference-body {
      display: flex;
      flex-direction: column;
      gap: 32px;

      .preference-item {
        display: flex;
        flex-direction: column;
        gap: 8px;

        .preference-label {
          color: $black;
          font-size: 14px;
        }

        .preference-value {
          color: $black;
          font-size: 16px;
          font-weight: 600;
        }
      }
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
</style>
