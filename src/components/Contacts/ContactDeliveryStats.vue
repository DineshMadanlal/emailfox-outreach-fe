<template>
  <div class="contact-delivery-stats-container">
    <div class="contact-delivery-stats">
      <div
        v-for="stat in deliveryStats"
        :key="`contact-delivery-stat-${stat.key}`"

        class="each-delivery-stat-block"
      >
        <LocalSvgIcon
          :image="stat.icon"
          :class="`each-stat-icon ${stat.color}`"
        />

        <div class="stat-text">
          <div class="stat-label">
            {{ stat.label }}
          </div>

          <div class="stat-value">
            {{ getNumeralAmount(stat.value) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed, reactive } from 'vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers.js';

export default defineComponent({
  name: 'ContactDeliveryStats',

  props: {
    campaignId: {
      type: [String, Number],
      default: null,
    },
  },

  setup() {
    // state
    const state = reactive({
      contactStats: {
        yet_to_send: 3500,
        delivered: 7000,
        opened: 4500,
        replied: 1200,
        bounced: 300,
      },
    });

    // computed
    const deliveryStats = computed(() => {
      if (!state.contactStats) return [];

      const {
        yet_to_send = 0,
        delivered = 0,
        opened = 0,
        replied = 0,
        bounced = 0,
      } = state.contactStats;

      return [
        {
          key: 'yet_to_send',
          label: 'Yet to Send',
          value: yet_to_send,
          icon: 'seq-inprogress',
          color: 'grey',
        },
        {
          key: 'delivered',
          label: 'Delivered',
          value: delivered,
          icon: 'seq-delivered',
          color: 'primary',
        },
        {
          key: 'opened',
          label: 'Opened',
          value: opened,
          icon: 'seq-opened',
          color: 'warning',
        },
        {
          key: 'replied',
          label: 'Replied',
          value: replied,
          icon: 'seq-replied',
          color: 'positive',
        },
        {
          key: 'bounced',
          label: 'Bounced',
          value: bounced,
          icon: 'seq-bounced',
          color: 'negative',
        },
      ];
    });

    return {
      // computed
      deliveryStats,

      // method
      getNumeralAmount,
    };
  },
});
</script>

<style lang="scss" scoped>
.contact-delivery-stats-container {
  width: 100%;
  padding: 16px;
  border-bottom: 1px solid $grey-50;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 12px;
  }

  .contact-delivery-stats {
    width: 100%;

    border-radius: 8px;
    background: rgba($color: var(--grey-50-rgb), $alpha: 0.3);

    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;

    gap: 32px;

    overflow-x: hidden;
    overflow-y: auto;

    padding: 24px 20px;

    // include custom scrollbar
    @include custom-scrollbar;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      gap: 16px;
      flex-wrap: nowrap;
      overflow-x: auto;

      padding: 16px 12px;
    }

    .each-delivery-stat-block {
      display: flex;
      gap: 8px;
      min-width: 120px;

      &:not(:first-child) {
        padding-left: 12px;
        border-left: 1px solid $grey-50;
      }

      &:last-child {
        padding-right: 72px;

        // md max
        @media (max-width: $breakpoint-md-max) {
          padding-right: 32px;
        }
      }

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        border-left: 0px !important;
        padding-left: 0px !important;
        padding-right: 0px !important;
      }

      :deep(.each-stat-icon) {
        &.grey {
          @include svg-icon-stroke('path, circle, rect', $grey);

          circle {
            &:last-child {
              fill: $grey;
            }
          }
        }

        &.warning {
          @include svg-icon-stroke('circle, path, rect', $warning);
        }

        &.negative {
          @include svg-icon-fill('path', $negative);
          @include svg-icon-stroke('circle, rect', $negative);

          circle {
            &:last-child {
              fill: $negative;
            }
          }
        }
      }

      .stat-text {
        .stat-label {
          color: $grey-800;
          font-size: 14px;
          line-height: 16px;
          white-space: nowrap;
        }

        .stat-value {
          color: $black;
          font-size: 18px;
          font-weight: 500;

          margin-top: 6px;
        }
      }
    }
  }
}
</style>
