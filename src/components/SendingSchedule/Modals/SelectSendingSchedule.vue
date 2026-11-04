<template>
  <q-card
    flat
    class="select-schedule-card app-modal-card"
    :style="{
      display: modals.showSaveSchedule ? 'none' : 'flex',
    }"
  >
    <!-- Save/Edit Schedule Nested Dialog -->
    <q-dialog
      v-model="modals.showSaveSchedule"
      class="app-modal-dialog"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveSchedule
        :isReadOnly="isReadOnly"
        :scheduleDetails="scheduleDetailsToEdit"
        @newCreated="onNewScheduleCreated"
        @existingUpdated="onExistingScheduleUpdated"
      />
    </q-dialog>

    <!-- Header -->
    <div class="app-modal-header">
      <h4 class="modal-header-text">
        Select Schedule
      </h4>

      <q-space />

      <!-- Close -->
      <q-btn
        flat
        round
        dense
        v-close-popup
        color="negative"
        class="app-negative-button"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />
      </q-btn>
    </div>

    <!-- Search bar (only when schedules exist) -->
    <div
      v-if="schedules.length > 0"
      class="modal-search-wrapper"
    >
      <AppSearchInput
        :debounce="500"
        v-model="filters.searchText"

        placeholder="Search schedule"
      />
    </div>

    <!-- Content: Master-Detail or Empty/Loading State -->
    <div class="app-modal-content">
      <!-- 1. Initial Loading State -->
      <div
        v-if="isApiLoading && !schedules.length"
        class="modal-loading-state full-width flex flex-center"
      >
        <ApiLoader show size="36px" />
      </div>

      <!-- 2. Zero State: No schedules created yet in workspace -->
      <div
        v-else-if="!schedules.length"
        class="modal-empty-state full-width flex flex-center"
      >
        <SendingScheduleIllustration
          @create="onOpenCreateSchedule"
        />
      </div>

      <!-- 3. Master-Detail Container (when schedules exist) -->
      <div
        v-else
        class="select-schedule-container custom-scrollbar"
      >
        <!-- Left Column: List -->
        <div class="schedule-left-section">
          <div
            v-if="!filteredSchedules.length"
            class="no-results-text"
          >
            No schedules found
          </div>

          <div
            v-else
            class="schedule-items-list"
          >
            <div
              v-for="schedule in filteredSchedules"
              :key="`each-schedule-${schedule.id}`"

              class="each-schedule-item"
              :class="{ 'active-schedule': schedule.id === activeScheduleId }"

              @click="onSelectScheduleItem(schedule.id)"
            >
              <div class="schedule-name-text">
                {{ schedule.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Preview Pane -->
        <div class="schedule-right-section custom-scrollbar">
          <!-- Preview Card -->
          <div
            v-if="selectedSchedule"
            class="schedule-preview-box"
          >
            <div class="preview-header-tag">
              SCHEDULE PREVIEW
            </div>

            <!-- Schedule Title & Edit Button -->
            <div class="preview-title-row">
              <div>
                <p class="preview-title">
                  {{ selectedSchedule.name }}
                </p>
                <p class="preview-active-days">
                  {{ activeDaysCount }} active days per week
                </p>
              </div>

              <q-btn
                flat
                dense
                no-caps

                color="primary"
                class="edit-schedule-btn"

                @click="onOpenEditSchedule"
              >
                <div class="flex no-wrap items-center">
                  <LocalSvgIcon
                    image="edit"
                    classes="edit-icon"
                  />
                  <span class="q-ml-xs">Edit</span>
                </div>
              </q-btn>
            </div>

            <!-- Timezone Row -->
            <div class="preview-meta-row timezone-row">
              <q-icon
                name="public"
                size="18px"
                class="meta-icon"
              />
              <span class="meta-text">
                {{ selectedTimezoneLabel }}
              </span>
            </div>

            <q-separator class="preview-separator" />

            <!-- Weekly Hours Section -->
            <div class="weekly-hours-section">
              <div class="weekly-hours-header">
                <q-icon
                  name="schedule"
                  size="18px"
                  class="meta-icon"
                />
                <span class="weekly-hours-title">Weekly Hours</span>
                <span class="weekly-hours-subtitle">(24 hrs format)</span>
              </div>

              <!-- Days List -->
              <div
                v-if="formattedWindows.length"
                class="weekly-hours-list"
              >
                <div
                  v-for="item in formattedWindows"
                  :key="item.day_of_week"
                  class="weekly-hour-row"
                >
                  <span class="day-label">{{ item.dayName }}</span>
                  <span class="time-range">{{ item.timeRange }}</span>
                </div>
              </div>
              <div
                v-else
                class="no-windows-text"
              >
                No active sending windows configured.
              </div>
            </div>

            <q-separator class="preview-separator" />

            <!-- Public Holidays Section -->
            <div class="preview-meta-row holidays-row">
              <q-icon
                name="event"
                size="18px"
                class="meta-icon"
              />
              <div class="holidays-content">
                <span class="meta-text">
                  {{ selectedSchedule.skip_holidays ?
                    'Skip Public Holidays' : 'Do not skip public holidays' }}
                </span>
                <span
                  v-if="selectedSchedule.skip_holidays && holidayCountryText"
                  class="holiday-country-subtext"
                >
                  Holiday country: {{ holidayCountryText }}
                </span>
              </div>
            </div>
          </div>

          <div
            v-else
            class="no-preview-placeholder"
          >
            Select a schedule to view its details
          </div>
        </div>
      </div>
    </div>

    <!-- Footer (only when schedules exist) -->
    <div
      v-if="schedules.length > 0"
      class="app-modal-footer"
    >
      <!-- Select CTA (Primary Blue) -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Select Schedule"
        :disable="!activeScheduleId"

        @click="onConfirmSelect"
      />

      <!-- Add New Schedule CTA (Light Primary Blue) -->
      <q-btn
        flat
        no-caps
        unelevated

        color="primary"
        label="Add New Schedule"
        class="light-primary-btn"

        @click="onOpenCreateSchedule"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, onMounted, watch, getCurrentInstance,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';
import SaveSchedule from 'src/components/SendingSchedule/Modals/SaveSchedule.vue';
import SendingScheduleIllustration from 'components/Illustrations/SendingSchedule.vue';

// Composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Utils
import { fetchWarmupProfiles } from 'src/utils/warmupApi';
import { getTimezoneJson } from 'src/utils/campaignApi';

// Constants
import { SCHEDULE_DAYS_LABEL } from 'boot/campaign-constants.js';

export default defineComponent({
  name: 'SelectSendingSchedule',

  emits: ['useSendingSchedule', 'scheduleUpdated'],

  components: {
    ApiLoader,
    AppSearchInput,
    SaveSchedule,
    SendingScheduleIllustration,
  },

  props: {
    isReadOnly: {
      type: Boolean,
      default: false,
    },
    selectedScheduleId: {
      type: [String, Number],
      default: null,
    },
  },

  setup(props, { emit }) {
    const { appContext } = getCurrentInstance();
    const { isMobileDevice } = useAppHelpersApi();

    const state = reactive({
      schedules: [],
      activeScheduleId: props.selectedScheduleId || null,
      isApiLoading: false,

      scheduleDetailsToEdit: {},

      filters: {
        searchText: '',
      },
      modals: {
        showSaveSchedule: false,
      },
    });

    // Computed
    const filteredSchedules = computed(() => {
      const search = (state.filters.searchText || '').trim().toLowerCase();
      if (!search) return state.schedules;

      return state.schedules.filter((schedule) => (
        schedule.name?.toLowerCase().includes(search)
      ));
    });

    const selectedSchedule = computed(() => {
      if (state.activeScheduleId) {
        const found = state.schedules.find(
          (item) => item.id === state.activeScheduleId,
        );
        if (found) return found;
      }
      return filteredSchedules.value[0] || null;
    });

    const activeDaysCount = computed(() => (
      selectedSchedule.value?.windows?.length || 0
    ));

    const selectedTimezoneLabel = computed(() => {
      const tz = selectedSchedule.value?.timezone;
      if (!tz) return '';

      const tzObj = getTimezoneJson(tz);
      if (tzObj) {
        return `${tzObj.label} (${tzObj.gmt || 'GMT'})`;
      }
      return tz;
    });

    const formattedWindows = computed(() => {
      const windows = selectedSchedule.value?.windows;
      if (!windows?.length) return [];

      // Create a shallow copy before sorting to prevent state mutation
      return [...windows]
        .sort((a, b) => (a.day_of_week ?? 0) - (b.day_of_week ?? 0))
        .map((window) => {
          const dayName = SCHEDULE_DAYS_LABEL[window.day_of_week]?.slice(0, 3) || `Day ${window.day_of_week}`;
          const startTime = window.start_time?.slice(0, 5) || '00:00';
          const endTime = window.end_time?.slice(0, 5) || '00:00';
          return {
            day_of_week: window.day_of_week,
            dayName,
            timeRange: `${startTime} – ${endTime}`,
          };
        });
    });

    const holidayCountryText = computed(() => {
      const schedule = selectedSchedule.value;
      if (!schedule?.skip_holidays) return '';
      return schedule.holiday_country || schedule.holiday_country_code || 'All';
    });

    // Methods
    const onSelectScheduleItem = (id) => {
      state.activeScheduleId = id;
    };

    const fetchSchedules = async (preferredId = null) => {
      try {
        state.isApiLoading = true;

        const response = await fetchWarmupProfiles({
          apiParams: {
            offset: 0,
            limit: 100,
          },
          apiEndPoint: '/sending-schedules',
        });

        const list = response?.data || [];
        state.schedules = list;

        // Maintain selection priority:
        // 1. Explicit preferredId (e.g. from just editing or creating)
        // 2. Currently active selection (if still present in fresh list)
        // 3. props.selectedScheduleId (campaign's assigned schedule)
        // 4. First schedule in the list
        let targetId = null;

        if (preferredId && list.some((item) => item.id === preferredId)) {
          targetId = preferredId;
        } else if (state.activeScheduleId
          && list.some((item) => item.id === state.activeScheduleId)) {
          targetId = state.activeScheduleId;
        } else if (props.selectedScheduleId
          && list.some((item) => item.id === props.selectedScheduleId)) {
          targetId = props.selectedScheduleId;
        } else if (list.length) {
          targetId = list[0].id;
        }

        //
        state.activeScheduleId = targetId;
      } catch (error) {
        appContext.config.globalProperties.$toast?.({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    const onConfirmSelect = () => {
      if (!selectedSchedule.value) return;
      emit('useSendingSchedule', selectedSchedule.value);
    };

    const onOpenCreateSchedule = () => {
      state.scheduleDetailsToEdit = {};
      state.modals.showSaveSchedule = true;
    };

    const onOpenEditSchedule = () => {
      if (!selectedSchedule.value) return;

      state.scheduleDetailsToEdit = { ...selectedSchedule.value };
      state.modals.showSaveSchedule = true;
    };

    const onNewScheduleCreated = (newSchedule) => {
      state.modals.showSaveSchedule = false;

      fetchSchedules(newSchedule?.id);
    };

    const onExistingScheduleUpdated = () => {
      const currentId = state.scheduleDetailsToEdit?.id || state.activeScheduleId;
      state.modals.showSaveSchedule = false;
      fetchSchedules(currentId);
      emit('scheduleUpdated', currentId);
    };

    watch(
      () => props.selectedScheduleId,
      (newId) => {
        if (newId) {
          state.activeScheduleId = newId;
        }
      },
    );

    onMounted(() => {
      fetchSchedules();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      filteredSchedules,
      selectedSchedule,
      activeDaysCount,
      selectedTimezoneLabel,
      formattedWindows,
      holidayCountryText,

      // methods
      onSelectScheduleItem,
      onConfirmSelect,
      onOpenCreateSchedule,
      onOpenEditSchedule,
      onNewScheduleCreated,
      onExistingScheduleUpdated,
    };
  },
});
</script>

<style lang="scss" scoped>
.select-schedule-card {
  max-width: 640px;
  flex-direction: column;

  .modal-search-wrapper {
    margin-top: 16px;
    padding: 0px 16px;
  }

  .app-modal-footer {
    gap: 16px;
  }

  .app-modal-content {
    display: flex;
    min-height: 400px;
    max-height: 520px;
    overflow: hidden;

    .modal-loading-state,
    .modal-empty-state {
      width: 100%;
      min-height: 380px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .select-schedule-container {
      width: 100%;
      display: flex;
      gap: 16px;

      @media (max-width: $breakpoint-xs-max) {
        flex-direction: column;
      }

      // Left Column
      .schedule-left-section {
        width: 240px;
        flex-shrink: 0;
        overflow-y: auto;
        padding-right: 8px;

        @media (max-width: $breakpoint-xs-max) {
          width: 100%;
          max-height: 140px;
        }

        .schedule-items-list {
          display: flex;
          flex-direction: column;
          gap: 6px;

          .each-schedule-item {
            min-height: 36px;
            padding: 10px;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.15s ease;

            .schedule-name-text {
              font-size: 14px;
              color: rgba(var(--black-rgb), 0.8);
              font-weight: 400;
            }

            &:hover {
              background-color: rgba(var(--primary-rgb), 0.05);
            }

            &.active-schedule {
              background-color: rgba(var(--primary-rgb), 0.1);

              .schedule-name-text {
                color: $primary;
                font-weight: 500;
              }
            }
          }
        }

        .loading-container,
        .no-results-text {
          padding: 24px 12px;
          text-align: center;
          color: $grey;
          font-size: 14px;
        }
      }

      // Right Column
      .schedule-right-section {
        flex: 1;
        min-width: 0;
        overflow-y: auto;

        .schedule-preview-box {
          background-color: rgba(var(--grey-50-rgb), 0.4);
          border: 1px solid $grey-50;

          border-radius: 10px;
          padding: 20px;
          display: flex;
          flex-direction: column;

          gap: 14px;

          .preview-header-tag {
            font-size: 11px;
            font-weight: 700;
            color: $grey;
            letter-spacing: 0.5px;
          }

          .preview-title-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 12px;

            .preview-title {
              font-size: 17px;
              font-weight: 600;
              color: $black;
              margin: 0;
              line-height: 1.3;
            }

            .preview-active-days {
              font-size: 13px;
              color: $grey;
              margin: 4px 0 0;
            }

            .edit-schedule-btn {
              padding: 4px 8px;
              font-size: 13px;
              font-weight: 500;
              border-radius: 6px;

              :deep(.edit-icon) {
                width: 14px;
                height: 14px;

                @include svg-icon-stroke('path', $primary);
              }
            }
          }

          .preview-meta-row {
            display: flex;
            align-items: center;
            gap: 8px;

            .meta-icon {
              color: $grey;
              flex-shrink: 0;
            }

            .meta-text {
              font-size: 14px;
              color: $black;
              font-weight: 500;
            }

            &.holidays-row {
              align-items: flex-start;

              .holidays-content {
                display: flex;
                flex-direction: column;
                gap: 2px;

                .holiday-country-subtext {
                  font-size: 13px;
                  color: $grey;
                }
              }
            }
          }

          .preview-separator {
            background-color: $grey-50;
            margin: 2px 0;
          }

          .weekly-hours-section {
            display: flex;
            flex-direction: column;
            gap: 10px;

            .weekly-hours-header {
              display: flex;
              align-items: center;
              gap: 8px;

              .meta-icon {
                color: $grey;
              }

              .weekly-hours-title {
                font-size: 14px;
                font-weight: 600;
                color: $black;
              }

              .weekly-hours-subtitle {
                font-size: 12px;
                color: $grey;
              }
            }

            .weekly-hours-list {
              display: flex;
              flex-direction: column;
              gap: 8px;
              padding-left: 26px;

              .weekly-hour-row {
                display: flex;
                align-items: center;
                gap: 28px;
                font-size: 13px;

                .day-label {
                  width: 36px;
                  color: $grey;
                  font-weight: 500;
                }

                .time-range {
                  color: $black;
                  font-weight: 500;
                }
              }
            }

            .no-windows-text {
              padding-left: 26px;
              font-size: 13px;
              color: $grey;
              font-style: italic;
            }
          }
        }

        .loading-container,
        .no-preview-placeholder {
          height: 100%;
          min-height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: $grey;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
