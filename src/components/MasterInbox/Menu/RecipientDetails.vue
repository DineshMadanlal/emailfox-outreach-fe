<template>
  <q-card class="recipient-details-card">
    <!-- from -->
    <div class="flex no-wrap">
      <p class="detail-label-text">from:</p>

      <div class="recipient-details-row">
        <p class="detail-value-text">
          {{ from }}
        </p>
      </div>
    </div>

    <!-- To -->
    <div class="flex no-wrap">
      <p class="detail-label-text">to:</p>

      <div class="recipient-details-row">
        <p
          class="detail-value-text"
          v-for="(data, index) in toRecipients"
          :key="`to-email-field-${index}`"
        >
        {{ data.name }} {{ data.email }}
        </p>
      </div>
    </div>

    <!-- CC -->
    <div
      v-if="ccRecipients.length > 0"
      class="flex no-wrap"
    >
      <p class="detail-label-text">cc:</p>

      <div class="recipient-details-row">
        <p
          class="detail-value-text"
          v-for="(data, index) in ccRecipients"
          :key="`cc-email-field-${index}`"
        >
        {{ data.name }} {{ data.email }}
        </p>
      </div>
    </div>

    <!-- BCC -->
    <div
      v-if="bccRecipients.length > 0"
      class="flex no-wrap"
    >
      <p class="detail-label-text">bcc:</p>

      <div class="recipient-details-row">
        <p
          class="detail-value-text"
          v-for="(data, index) in bccRecipients"
          :key="`bcc-email-field-${index}`"
        >
        {{ data.name }} {{ data.email }}
        </p>
      </div>
    </div>

    <!-- Date -->
    <div class="flex no-wrap">
      <p class="detail-label-text">date:</p>

      <div class="recipient-details-row">
        <p class="detail-value-text">
          {{ formatDateTimeWithYear(mailedAt) }}
        </p>
      </div>
    </div>
  </q-card>
</template>

<script>
import { defineComponent } from 'vue';

// utils
import { formatDateTimeWithYear } from 'src/utils/dates';

export default defineComponent({
  name: 'RecipientDetails',

  props: {
    from: {
      type: String,
      default: '',
    },
    mailedAt: {
      type: String,
      default: '',
    },
    toRecipients: {
      type: Array,
      required: true,
      default: () => [],
    },
    ccRecipients: {
      type: Array,
      required: true,
      default: () => [],
    },
    bccRecipients: {
      type: Array,
      required: true,
      default: () => [],
    },
  },

  emits: ['onReply', 'onForward'],

  setup() {
    return {
      formatDateTimeWithYear,
    };
  },
});
</script>

<style lang="scss" scoped>
.recipient-details-card {
  padding: 12px 20px;

  width: 100%;
  max-width: 446px;

  display: grid;
  grid-row-gap: 12px;

  border-radius: 6px;
  border: 1px solid $grey-50;
  box-shadow: 0px 6px 24px 4px rgba(0, 0, 0, 0.13);

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    max-width: 300px;
  }

  .detail-label-text {
    color: $grey;
    font-size: 14px;
    font-weight: 400;

    min-width: 35px;
    margin-right: 8px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      margin-right: 8px;
    }
  }

  .detail-value-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
  }

  .recipient-details-row {
    display: flex;
    flex-direction: column;

    gap: 4px;
  }
}
</style>
