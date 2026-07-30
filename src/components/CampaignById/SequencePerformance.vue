<template>
  <q-card flat class="sequence-performance-card">
    <!-- header -->
    <div class="sequence-performance-header-details">
      <p class="sequence-performance-header-text">
        Sequence-Level Performance
      </p>

      <p class="sequence-performance-desc-subtext">
        Performance metrics by email sequence
      </p>
    </div>

    <!-- content -->
    <q-table
      hide-pagination
      :rows="tableRows"
      :columns="tableColumns"

      :pagination="TABLE_PAGINATION"

      separator="cell"
      class="app-table"
      no-data-label="No sequences found."
    >
      <!-- sequence -->
      <template v-slot:body-cell-sequence="props">
        <q-td
          :props="props"
        >
          <div>
            {{ props.rowIndex +1 }}. {{ props.row.name }}
          </div>
        </q-td>
      </template>

      <!-- day -->
      <template v-slot:body-cell-day="props">
        <q-td
          :props="props"
        >
          <div>
            {{ props.row.day }}
          </div>
        </q-td>
      </template>

      <!-- sent -->
      <template v-slot:body-cell-sent="props">
        <q-td
          :props="props"
        >
          <div class="flex no-wrap items-center">
            <LocalSvgIcon
              image="seq-sent"
              classes="seq-sent-icon"
            />

            <div class="q-ml-sm">
              {{ props.row.sent }}
            </div>
          </div>
        </q-td>
      </template>

      <!-- opened -->
      <template v-slot:body-cell-opened="props">
        <q-td
          :props="props"
        >
          <div class="flex no-wrap">
            <LocalSvgIcon
              image="seq-opened"
              classes="seq-opened-icon"
            />

            <div class="q-ml-sm">
              <div class="seq-percentage-text">
                {{ findPercentage({
                  part: props.row.opened,
                  whole: props.row.sent,
                }) }}%
              </div>
              <div class="seq-value-text">
                {{ props.row.opened }}
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- replied -->
      <template v-slot:body-cell-replied="props">
        <q-td
          :props="props"
        >
          <div class="flex no-wrap">
            <LocalSvgIcon
              image="seq-replied"
              classes="seq-replied-icon"
            />

            <div class="q-ml-sm">
              <div class="seq-percentage-text">
                {{ findPercentage({
                  part: props.row.replied,
                  whole: props.row.sent,
                }) }}%
              </div>
              <div class="seq-value-text">
                {{ props.row.replied }}
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- positive_reply -->
      <template v-slot:body-cell-positive_reply="props">
        <q-td
          :props="props"
        >
          <div class="flex no-wrap">
            <LocalSvgIcon
              image="star"
              classes="seq-positive-reply-icon"
            />

            <div class="q-ml-sm">
              <div class="seq-percentage-text">
                {{ findPercentage({
                  part: props.row.positive_reply,
                  whole: props.row.replied,
                }) }}%
              </div>
              <div class="seq-value-text">
                {{ props.row.positive_reply }}
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- bounced -->
      <template v-slot:body-cell-bounced="props">
        <q-td
          :props="props"
        >
          <div class="flex no-wrap">
            <LocalSvgIcon
              image="seq-bounced"
            />

            <div class="q-ml-sm">
              <div class="seq-percentage-text">
                {{ findPercentage({
                  part: props.row.bounced,
                  whole: props.row.sent,
                }) }}%
              </div>
              <div class="seq-value-text">
                {{ props.row.bounced }}
              </div>
            </div>
          </div>
        </q-td>
      </template>

      <!-- unsubscribed -->
      <template v-slot:body-cell-unsubscribed="props">
        <q-td
          :props="props"
        >
          <div class="flex no-wrap">
            <LocalSvgIcon
              image="circle-close"
              classes="seq-unsubscribed-icon"
            />

            <div class="q-ml-sm">
              <div class="seq-percentage-text">
                {{ findPercentage({
                  part: props.row.unsubscribed,
                  whole: props.row.sent,
                }) }}%
              </div>
              <div class="seq-value-text">
                {{ props.row.unsubscribed }}
              </div>
            </div>
          </div>
        </q-td>
      </template>
    </q-table>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, computed, reactive, toRefs,
} from 'vue';

// numbers
import { findPercentage } from 'src/utils/numbers.js';

// constants
import { TABLE_PAGINATION } from 'boot/constants';

export default defineComponent({
  name: 'SequencePerformance',

  setup() {
    // state
    const state = reactive({
      tableRows: [
        {
          id: 1,
          step: 1,
          name: 'Email 1',
          day: 'Day 0',

          sent: 1500,
          opened: 940,
          replied: 4294,
          positive_reply: 4294,
          bounced: 150,
          unsubscribed: 0,
        },
        {
          id: 2,
          step: 2,
          name: 'Follow-up 1',
          day: 'Day 2',

          sent: 1500,
          opened: 800,
          replied: 4294,
          positive_reply: 4294,
          bounced: 150,
          unsubscribed: 0,
        },
        {
          id: 3,
          step: 3,
          name: 'Follow-up 2', // follow-up
          day: 'Day 5',

          sent: 1320,
          opened: 930,
          replied: 4294,
          positive_reply: 4294,
          bounced: 150,
          unsubscribed: 0,
        },
        {
          id: 4,
          step: 4,
          name: 'Follow-up 3', // follow-up
          day: 'Day 9',

          sent: 1110,
          opened: 120,
          replied: 4294,
          positive_reply: 4294,
          bounced: 150,
          unsubscribed: 0,
        },
      ],
    });

    // computed
    const tableColumns = computed(() => [
      {
        name: 'sequence',
        label: 'Sequence',
        align: 'left',
      },
      {
        name: 'day',
        label: 'Day',
        align: 'left',
      },
      {
        name: 'sent',
        label: 'Sent',
        align: 'left',
      },
      {
        name: 'opened',
        label: 'Opened',
        align: 'left',
      },
      {
        name: 'replied',
        label: 'Replied',
        align: 'left',
      },
      {
        name: 'positive_reply',
        label: 'Positive Reply',
        align: 'left',
      },
      {
        name: 'bounced',
        label: 'Bounced',
        align: 'left',
      },
      {
        name: 'unsubscribed',
        label: 'Unsubscribed',
        align: 'left',
      },
    ]);

    return {
      // state
      ...toRefs(state),

      // computed
      tableColumns,

      // methods
      findPercentage,

      // constant
      TABLE_PAGINATION,
    };
  },
});
</script>

<style lang="scss" scoped>
.sequence-performance-card {
  width: 100%;

  border-radius: 6px;
  border: 1px solid $grey-50;
  background: $white;

  .sequence-performance-header-details {
    padding: 20px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;
    }

    .sequence-performance-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;
    }

    .sequence-performance-desc-subtext {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-top: 6px;
    }
  }

  .app-table {
    :deep(.seq-replied-icon) {
      @include svg-icon-stroke('path, rect', $primary);
    }

    :deep(.seq-positive-reply-icon) {
      @include svg-icon-stroke('path, rect', $positive);
    }

    .seq-percentage-text {
      color: $black;
      font-size: 14px;
      font-weight: 500;
      line-height: 16px; /* 114.286% */
    }

    .seq-value-text {
      color: $grey;
      font-size: 13px;
      font-weight: 400;
      line-height: 16px; /* 123.077% */

      margin-top: 4px;
    }
  }
}
</style>
