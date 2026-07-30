<template>
  <q-card
    flat
    class="variants-testing-card"

    v-if="sequences.length && areResultsFetchedOnce"
  >
    <!-- Loader -->
    <ApiLoader
      :show="true"

      v-if="isApiLoading"
    />

    <!-- header -->
    <div class="variants-testiung-header-details">
      <p class="variants-testiung-header-text">
        A/B Testing Results
      </p>

      <p class="variants-testiung-desc-subtext">
        Variant performance comparison
      </p>
    </div>

    <!-- content -->
    <q-tabs
      dense
      mobile-arrows
      narrow-indicator
      :breakpoint="0"

      v-model="activeSequenceId"

      align="left"
      class="app-tabs"
      active-color="primary"
      indicator-color="primary"
    >
      <q-tab
        no-caps

        v-for="seq in sequences"
        :key="`tab-seq-${seq.id}`"
        :name="seq.id"
        :label="seq.name"
      />
    </q-tabs>

    <q-tab-panels
      v-model="activeSequenceId"
      animated
      class="variant-testing-tab-panels"
    >
      <q-tab-panel
        v-for="seq in sequences"
        :key="`each-seq-${seq.id}`"
        :name="seq.id"

        class="each-tab-panel"
      >
        <!-- content -->
        <q-table
          hide-pagination
          :rows="sequenceVariants"
          :columns="tableColumns"

          :pagination="TABLE_PAGINATION"

          separator="cell"
          class="app-table"
          no-data-label="No sequences found."
        >
          <!-- Variant -->
          <template v-slot:body-cell-variant="props">
            <q-td
              :props="props"
            >
              <div class="text-weight-medium">
                {{ props.row.variant }}
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

          <!-- Opened -->
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

          <!-- Replied -->
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

          <!-- Status -->
          <template v-slot:body-cell-status="props">
            <q-td
              :props="props"
            >
              <StatusBadge
                icon="circle-tick"
                status="Winner"
                color="positive"

                v-if="props.row.isWinner"
              />

              <div
                v-else
              >
                -
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
    </q-tab-panels>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, onMounted, reactive, toRefs, computed,
} from 'vue';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import StatusBadge from 'components/CampaignById/StatusBadge.vue';

// utils
import { findPercentage } from 'src/utils/numbers.js';
import { waitForTimeInSeconds } from 'src/utils/helperFunctions';

// constants
import { TABLE_PAGINATION } from 'boot/constants';

export default defineComponent({
  name: 'VariantsTestingResults',

  components: {
    ApiLoader,
    StatusBadge,
  },

  setup() {
    // state
    const state = reactive({
      activeSequenceId: null,

      sequences: [],

      isApiLoading: false,
      areResultsFetchedOnce: false,
    });

    // computed
    const sequenceVariants = computed(() => {
      const activeSequence = state.sequences.find(
        (seq) => seq.id === state.activeSequenceId,
      );

      return activeSequence ? activeSequence.variants : [];
    });

    const tableColumns = [
      {
        name: 'variant', label: 'Variant', align: 'left',
      },
      {
        name: 'sent', label: 'Sent', align: 'left',
      },
      {
        name: 'opened', label: 'Opened', align: 'left',
      },
      {
        name: 'replied', label: 'Replied', align: 'left',
      },
      {
        name: 'status', label: 'Status', align: 'left',
      },
    ];

    // methods
    const fetchSequences = async () => {
      state.isApiLoading = true;

      // simulate API call
      await waitForTimeInSeconds(0.2);

      // mock data
      const results = [
        {
          id: 1,
          name: 'Sequence 1',
          variants: [
            {
              variant: 'A', sent: 375, opened: 90, replied: 13,
            },
            {
              variant: 'B', sent: 375, opened: 100, replied: 15,
            },
            {
              variant: 'C', sent: 375, opened: 145, replied: 25, isWinner: true,
            },
            {
              variant: 'D', sent: 375, opened: 200, replied: 12,
            },
          ],
        },
        {
          id: 2,
          name: 'Sequence 2',
          variants: [
            {
              variant: 'A', sent: 410, opened: 68.2, replied: 6.4, status: null,
            },
            {
              variant: 'B', sent: 410, opened: 70.1, replied: 6.9, status: 'winner',
            },
          ],
        },
        {
          id: 3,
          name: 'Sequence 3',
        },
      ];

      // sequences with variants array
      state.sequences = results.filter(
        (sequence) => sequence.variants && sequence.variants.length > 0,
      );

      // set default active sequence
      if (state.sequences.length > 0) {
        state.activeSequenceId = state.sequences[0].id;

        //
        state.areResultsFetchedOnce = true;
      }

      state.isApiLoading = false;
    };

    onMounted(() => {
      // fetch sequences for tabs
      fetchSequences();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      tableColumns,

      // computed
      sequenceVariants,

      // methods
      findPercentage,

      // constants
      TABLE_PAGINATION,
    };
  },
});
</script>

<style lang="scss" scoped>
.variants-testing-card {
  width: 100%;

  border-radius: 6px;
  border: 1px solid $grey-50;
  background: $white;

  .variants-testiung-header-details {
    padding: 20px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;
    }

    .variants-testiung-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;
    }

    .variants-testiung-desc-subtext {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-top: 6px;
    }
  }

  .variant-testing-tab-panels {
    padding: 0px;

    .each-tab-panel {
      padding: 0px;

      .app-table {
        border: 0px;

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
  }
}
</style>
