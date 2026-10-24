<template>
  <div class="current-outreach-card">
    <!-- Card Header -->
    <div class="outreach-card-header">
      <h6 class="card-title">
        Current Outreach
      </h6>

      <router-link
        :to="campaignsRoute"
        class="view-all-btn"
      >
        View All
      </router-link>
    </div>

    <!-- Card Body -->
    <div class="outreach-card-body">
      <!-- Sequence Title -->
      <h6
        :title="seqName"
        class="sequence-name ellipsis"
      >
        {{ seqName }}
      </h6>

      <!-- Status & Step indicator -->
      <div class="sequence-status-row">
        <span
          class="status-text"
          :class="statusClass"
        >
          {{ statusText }}
        </span>

        <span class="dot-separator">•</span>

        <span class="step-count-text">
          Step {{ currentStepNumber }} of {{ totalSteps }}
        </span>
      </div>

      <!-- Progress Bar -->
      <div class="progress-bar-track">
        <div
          class="progress-bar-fill"
          :style="{ width: `${progressPercentage}%` }"
        />
      </div>

      <!-- Outreach Metadata List -->
      <div class="outreach-details-list">
        <!-- Scheduled -->
        <div class="detail-row">
          <span class="detail-label">Scheduled</span>
          <span class="detail-value">
            {{ scheduledFormatted }}
          </span>
        </div>

        <!-- Sender -->
        <div class="detail-row">
          <span class="detail-label">Sender</span>
          <span
            :title="senderEmail"
            class="detail-value ellipsis"
          >
            {{ senderEmail }}
          </span>
        </div>

        <!-- Started On -->
        <div class="detail-row">
          <span class="detail-label">Started on</span>
          <span class="detail-value">
            {{ startedOnFormatted }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// vue router
import { useRoute } from 'vue-router';

// utils
import { formatDate2 } from 'src/utils/dates';

export default defineComponent({
  name: 'CurrentOutreach',

  props: {
    currentOutreachJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    const route = useRoute();
    const contactId = computed(() => route.params.contactId);

    const campaignsRoute = computed(() => `/outreach/contacts/${contactId.value}/campaigns`);

    const outreachData = computed(() => props.currentOutreachJson || {});

    const seqName = computed(() => outreachData.value.seq_name || '-');
    const currentStepNumber = computed(() => outreachData.value.current_step_number ?? 0);
    const totalSteps = computed(() => outreachData.value.total_steps || 0);

    const progressPercentage = computed(() => {
      if (totalSteps.value <= 0) return 0;
      const pct = (currentStepNumber.value / totalSteps.value) * 100;
      return Math.min(Math.max(pct, 0), 100);
    });

    const statusText = computed(() => {
      const s = outreachData.value.status || '';
      if (!s) return '-';
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    });

    const statusClass = computed(() => {
      const s = (outreachData.value.status || '').toUpperCase();
      if (['ACTIVE', 'RUNNING'].includes(s)) return 'status-active';
      if (['PAUSED', 'AUTO_PAUSED'].includes(s)) return 'status-paused';
      if (['COMPLETED'].includes(s)) return 'status-completed';
      return 'status-active';
    });

    const scheduledFormatted = computed(() => {
      if (outreachData.value.next_execution_at) {
        try {
          return formatDate2(outreachData.value.next_execution_at);
        } catch (e) {
          return outreachData.value.next_execution_at;
        }
      }
      return 'NA';
    });

    const senderEmail = computed(() => outreachData.value.sender_email || 'NA');

    const startedOnFormatted = computed(() => {
      if (outreachData.value.started_on) {
        try {
          return formatDate2(outreachData.value.started_on);
        } catch (e) {
          return outreachData.value.started_on;
        }
      }
      return '-';
    });

    return {
      campaignsRoute,
      seqName,
      statusText,
      statusClass,
      currentStepNumber,
      totalSteps,
      progressPercentage,
      scheduledFormatted,
      senderEmail,
      startedOnFormatted,
    };
  },
});
</script>

<style lang="scss" scoped>
.current-outreach-card {
  width: 100%;
  background-color: $white;
  border: 1px solid $grey-50;
  border-radius: 8px;
  display: flex;
  flex-direction: column;

  .outreach-card-header {
    width: 100%;
    padding: 16px 20px 14px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid $grey-50;

    .card-title {
      color: $black;
      font-size: 16px;
      font-weight: 600;
      line-height: 20px;
      margin: 0;
    }

    .view-all-btn {
      color: $primary;
      font-size: 13px;
      font-weight: 500;
      line-height: 16px;
      padding: 4px 12px;
      border-radius: 9999px;
      border: 1px solid $blue-grey;
      text-decoration: none;
      transition: all 0.2s ease-in-out;

      &:hover {
        background-color: rgba(var(--primary-rgb), 0.05);
        border-color: $primary;
      }
    }
  }

  .outreach-card-body {
    padding: 16px 20px 20px 20px;
    display: flex;
    flex-direction: column;

    .sequence-name {
      color: $black;
      font-size: 16px;
      font-weight: 600;
      line-height: 22px;
      margin: 0 0 4px 0;
    }

    .sequence-status-row {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 12px;

      .status-text {
        font-size: 13px;
        font-weight: 500;
        line-height: 16px;

        &.status-active {
          color: $positive;
        }

        &.status-paused {
          color: $warning;
        }

        &.status-completed {
          color: $grey;
        }
      }

      .dot-separator {
        color: $grey;
        font-size: 12px;
      }

      .step-count-text {
        color: $grey;
        font-size: 13px;
        font-weight: 400;
        line-height: 16px;
      }
    }

    .progress-bar-track {
      width: 100%;
      height: 6px;
      border-radius: 9999px;
      background-color: rgba(var(--primary-rgb), 0.1);
      margin-bottom: 20px;
      overflow: hidden;

      .progress-bar-fill {
        height: 100%;
        border-radius: 9999px;
        background-color: $primary;
        transition: width 0.3s ease-in-out;
      }
    }

    .outreach-details-list {
      display: flex;
      flex-direction: column;
      gap: 14px;

      .detail-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;

        .detail-label {
          color: $grey;
          font-size: 13px;
          font-weight: 400;
          line-height: 16px;
          flex-shrink: 0;
        }

        .detail-value {
          color: $black;
          font-size: 13px;
          font-weight: 500;
          line-height: 16px;
          text-align: right;
        }
      }
    }
  }
}
</style>
