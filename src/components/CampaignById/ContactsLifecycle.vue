<template>
  <q-card flat class="contacts-lifecycle-card">
    <!-- header -->
    <h6 class="contact-lifecycle-header-text">
      Contact Lifecycle
    </h6>

    <p class="contact-lifecycle-desc-text">
      Current Status Distribution ({{ getNumeralAmount(totalContacts) }} total contacts)
    </p>

    <div class="contacts-status-breakdown-grid">
      <div
        v-for="status in statusDistribution"
        :key="status.key"
        class="each-contact-status-block"
      >
        <div class="flex no-wrap items-center">
          <p class="contact-status-label-text">
            {{ status.label }}

            <span>
              ({{ status.percentage }}%)
            </span>
          </p>

          <q-space />

          <p class="contact-status-value-text">
            {{ getNumeralAmount(status.count) }}
          </p>
        </div>

        <q-linear-progress
          rounded
          :value="status.percentage / 100"

          color="positive"
          class="status-usage-progress"
        >
        </q-linear-progress>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, computed, reactive, toRefs,
} from 'vue';

// utils
import { findPercentage, getNumeralAmount } from 'src/utils/numbers';

export default defineComponent({
  name: 'ContactsLifecycle',

  setup() {
    // state
    const state = reactive({
      stats: {
        active: Math.floor(Math.random() * 5000) + 100,
        completed: Math.floor(Math.random() * 3000) + 100,
        replied: Math.floor(Math.random() * 1000) + 50,
        unsubscribed: Math.floor(Math.random() * 500) + 20,
        bounced: Math.floor(Math.random() * 200) + 10,
      },
    });

    // computed
    const totalContacts = computed(() => Math.floor(Math.random() * 10000) + 4000);

    const statusDistribution = computed(() => {
      const total = totalContacts.value;

      return [
        {
          key: 'active',
          label: 'Active in Sequence',
          count: state.stats.active,
          percentage: findPercentage({
            part: state.stats.active,
            whole: total,
          }),
        },
        {
          key: 'completed',
          label: 'Completed',
          count: state.stats.completed,
          percentage: findPercentage({
            part: state.stats.completed,
            whole: total,
          }),
        },
        {
          key: 'replied',
          label: 'Replied',
          count: state.stats.replied,
          percentage: findPercentage({
            part: state.stats.replied,
            whole: total,
          }),
        },
        {
          key: 'unsubscribed',
          label: 'Unsubscribed',
          count: state.stats.unsubscribed,
          percentage: findPercentage({
            part: state.stats.unsubscribed,
            whole: total,
          }),
        },
        {
          key: 'bounced',
          label: 'Bounced',
          count: state.stats.bounced,
          percentage: findPercentage({
            part: state.stats.bounced,
            whole: total,
          }),
        },
      ];
    });

    return {
      // state
      ...toRefs(state),

      // computed
      totalContacts,
      statusDistribution,

      // methods
      getNumeralAmount,
    };
  },
});
</script>

<style lang="scss" scoped>
.contacts-lifecycle-card {
  width: 100%;
  padding: 20px;

  border-radius: 6px;
  background: $white;
  border: 1px solid $grey-50;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 12px;
  }

  .contact-lifecycle-header-text {
    color: $black;
    font-size: 16px;
    font-weight: 600;

    margin-bottom: 7px;
  }

  .contact-lifecycle-desc-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px; /* 114.286% */

    margin-bottom: 24px;
  }

  .contacts-status-breakdown-grid {
    display: flex;
    flex-direction: column;
    gap: 32px;

    .each-contact-status-block {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .contact-status-label-text {
        color: $black;
        font-size: 16px;
        font-weight: 500;

        span {
          color: $grey;
          font-size: 14px;
          font-weight: 400;
        }
      }

      .contact-status-value-text {
        color: $black;
        text-align: right;
        font-size: 16px;
        font-weight: 500;
      }

      :deep(.status-usage-progress) {
        height: 8px;
        border-radius: 1px;

        .q-linear-progress__model--determinate {
          background: rgba($color: var(--positive-rgb), $alpha: 0.4);
        }

        .q-linear-progress__track--light {
          background: $grey-50;
        }
      }
    }
  }
}
</style>
