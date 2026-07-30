<template>
  <q-card flat class="campaign-overview">
    <!-- header -->
    <div class="overview-header">
      <h6 class="overview-title-text">
        Campaign Overview
      </h6>

      <q-space />

      <!-- Manage -->
      <q-btn
        flat
        dense
        no-caps
        unelevated

        color="primary"
        label="Manage"

        class="action-btn"
      />
    </div>

    <!-- content -->
    <div class="overview-content">
      <div
        class="each-seq-detail"
        v-for="(detail, index) in campaignOverviewDetails"
        :key="`seq-overview-detail-${index}`"
      >
        <div class="detail-icon-block">
          <LocalSvgIcon
            :image="detail.icon"
            classes="detail-icon"
          />
        </div>

        <div>
          <div class="detail-header-text">
            {{ detail.header }}
          </div>

          <div class="detail-desc-text">
            {{ detail.desc }}
          </div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers';

export default defineComponent({
  name: 'CampaignOverview',

  setup() {
    // computed
    const campaignOverviewDetails = computed(() => {
      const details = [
        {
          icon: 'seq-delivered',
          header: 'Campaigns',
          desc: '4 Steps',
        },
        {
          icon: 'contacts',
          header: 'Contacts',
          desc: `${getNumeralAmount(12000)} Contacts`,
        },
        {
          icon: 'seq-sent',
          header: 'Sender Accounts',
          desc: `${getNumeralAmount(8000)} Accounts`,
        },
        {
          icon: 'seq-schedule',
          header: 'Sending Schedule',
          desc: 'Pacific SA Standard Time on Mon, Tue, Wed, Thu, Fri',
        },
      ];

      return details;
    });

    return {
      // computed
      campaignOverviewDetails,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-overview {
  width: 100%;
  border-radius: 6px;
  border: 1px solid $grey-50;

  .overview-header {
    display: flex;
    align-items: center;

    padding: 16px 20px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }

    .overview-title-text {
      color: $black;
      font-family: Inter;
      font-size: 16px;
      font-style: normal;
      font-weight: 600;
    }

    .action-btn {
      padding: 3px 12px;
      border-radius: 36px;
      border: 1px solid $blue-grey;
    }
  }

  .overview-content {
    width: 100%;

    .each-seq-detail {
      display: flex;
      padding: 20px;
      gap: 16px;
      border-top: 1px solid $grey-50;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 16px 12px;
      }

      .detail-icon-block {
        min-width: 26px;
        min-height: 26px;
        max-width: 26px;
        max-height: 26px;

        display: flex;
        align-items: center;
        justify-content: center;

        border-radius: 4px;
        border: 1px solid rgba($color: var(--primary-rgb), $alpha: 0.2);
        background: rgba($color: var(--primary-rgb), $alpha: 0.1);

        :deep(.detail-icon) {
          min-width: 14px;
          min-height: 14px;
          max-width: 14px;
          max-height: 14px;

          @include svg-icon-stroke('path, circle, rect', $grey);
        }
      }

      .detail-header-text {
        color: $secondary;
        font-size: 14px;
        font-weight: 600;
      }

      .detail-desc-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;

        max-width: 300px;

        margin-top: 4px;
      }
    }
  }
}
</style>
