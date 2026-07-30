<template>
  <q-card flat class="app-modal-card save-schedule-card">
    <q-form
      class="schedule-form"
      ref="saveScheduleRef"

      @submit.prevent.stop="onSubmitForm"
    >
      <!-- header -->
      <div class="app-modal-header">
        <!-- header text -->
        <h4 class="modal-header-text">
          {{ isNewSchedule ? 'New Schedule' : 'Edit Schedule' }}
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

      <!-- content -->
      <div class="app-modal-content">
        <!--  -->
        <div class="schedule-top-form">
          <!-- Name -->
          <div class="full-width">
            <InputLabel
              isImportant
              label="Name"
            />

            <q-input
              dense
              outlined
              hide-bottom-space
              :autofocus="isNewSchedule"

              v-model="name"

              lazy-rules="ondemand"
              placeholder="e.g. Weekday Schedule"
              :rules="[val => !!val || 'Name is required']"

              @update:model-value="onInputChange"
            />
          </div>

          <!-- Timezone -->
          <div class="full-width">
            <InputLabel
              isImportant
              label="Timezone"
            />

            <SelectTimezone
              :rules="timezoneRules"

              lazy-rules="ondemand"
              v-model="timezone"

              @update:model-value="onInputChange"
            />
          </div>

          <!-- Skip Holidays -->
          <div class="full-width">
            <q-checkbox
              dense
              v-model="skipHolidays"

              class="app-checkbox"
              label="Skip public holidays"
            >
            </q-checkbox>

            <div
              v-if="skipHolidays"
              class="holiday-country-container"
            >
              <InputLabel
                isImportant
                label="Holiday Country"
              />

              <CountriesSelect
                v-model="holidayCountry"
              />
            </div>
          </div>
        </div>

        <!-- Set Date & Time -->
        <div class="set-date-time-form">
          <p class="date-time-text">
            Set Date & Time
          </p>

          <div class="schedule-days-container">
            <!-- schedule row -->
            <div
              v-for="(item, index) in scheduleDays"
              :key="`day-${index}`"
              class="schedule-day-row"

              :class="{ 'not-enabled': !item.enabled }"
            >
              <!-- Checkbox -->
              <q-checkbox
                dense
                v-model="item.enabled"

                class="app-checkbox"
              >
                <!-- Label -->
                <div
                  class="day-label"
                  :data-short="SCHEDULE_DAYS_LABEL[item.day_of_week].slice(0, 3)"
                  :data-full="SCHEDULE_DAYS_LABEL[item.day_of_week]"
                >
                </div>
              </q-checkbox>

              <!-- Start Time -->
              <TimePicker
                v-model="item.startTime"
                class="time-picker"
                moreClass="dead-small"

                @update:model-value="onInputChange"

                v-if="item.enabled"
              />

              <div class="border-space" />

              <!-- End Time -->
              <TimePicker
                v-model="item.endTime"
                class="time-picker"
                moreClass="dead-small"

                @update:model-value="onInputChange"

                v-if="item.enabled"
              />

              <!-- Copy -->
              <q-btn
                flat
                round
                dense
                class="copy-btn"
              >
                <div class="copy-btn-content">
                  <LocalSvgIcon
                    image="copy"
                    classes="copy-icon"
                  />

                  <!-- Menu -->
                  <ScheduleCopyOptions
                    @copyAllDays="copyToAllDays(index)"
                    @copyWeekdays="copyToWeekdays(index)"
                    @copyWeekends="copyToWeekends(index)"
                  />
                </div>
              </q-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- footer -->
      <div class="app-modal-footer">
        <!-- Save -->
        <q-btn
          no-caps
          unelevated

          :loading="isApiLoading"

          label="Save"
          type="submit"
          color="primary"
          class="q-mr-md"
        />

        <!-- Cancel -->
        <q-btn
          flat
          no-caps
          unelevated
          v-close-popup

          :loading="isApiLoading"

          label="Cancel"
          color="primary"

          class="light-primary-btn"
        />
      </div>
    </q-form>
  </q-card>
</template>
<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, getCurrentInstance,
  onMounted,
} from 'vue';

// Components
import InputLabel from 'components/Form/InputLabel.vue';
import TimePicker from 'components/Input/TimePicker.vue';
import SelectTimezone from 'components/Dropdown/SelectTimezone.vue';
import CountriesSelect from 'components/Dropdown/CountriesSelect.vue';
import ScheduleCopyOptions from 'components/Menu/ScheduleCopyOptions.vue';

// Utils
import {
  updateScheduleById, createSchedule,
} from 'src/utils/campaignApi';

// constants
import { SCHEDULE_DEFAULT_TIME, SCHEDULE_DAYS_LABEL } from 'boot/campaign-constants.js';

export default defineComponent({
  name: 'SaveSchedule',

  emits: ['newCreated', 'existingUpdated'],

  components: {
    InputLabel,
    TimePicker,
    CountriesSelect,
    SelectTimezone,
    ScheduleCopyOptions,
  },

  props: {
    scheduleDetails: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      // form
      name: '',
      timezone: '',
      skipHolidays: false,
      holidayCountry: null,

      scheduleDays: [
        {
          day_of_week: 0,
          enabled: false,
          startTime: SCHEDULE_DEFAULT_TIME.startTime,
          endTime: SCHEDULE_DEFAULT_TIME.endTime,
        },
        {
          day_of_week: 1,
          enabled: true,
          startTime: SCHEDULE_DEFAULT_TIME.startTime,
          endTime: SCHEDULE_DEFAULT_TIME.endTime,
        },
        {
          day_of_week: 2,
          enabled: true,
          startTime: SCHEDULE_DEFAULT_TIME.startTime,
          endTime: SCHEDULE_DEFAULT_TIME.endTime,
        },
        {
          day_of_week: 3,
          enabled: true,
          startTime: SCHEDULE_DEFAULT_TIME.startTime,
          endTime: SCHEDULE_DEFAULT_TIME.endTime,
        },
        {
          day_of_week: 4,
          enabled: true,
          startTime: SCHEDULE_DEFAULT_TIME.startTime,
          endTime: SCHEDULE_DEFAULT_TIME.endTime,
        },
        {
          day_of_week: 5,
          enabled: true,
          startTime: SCHEDULE_DEFAULT_TIME.startTime,
          endTime: SCHEDULE_DEFAULT_TIME.endTime,
        },
        {
          day_of_week: 6,
          enabled: false,
          startTime: SCHEDULE_DEFAULT_TIME.startTime,
          endTime: SCHEDULE_DEFAULT_TIME.endTime,
        },
      ],

      // loading
      isApiLoading: false,

      // ref
      saveScheduleRef: null,
    });

    // computed
    const isNewSchedule = computed(() => !props.scheduleDetails?.id);

    // methods
    const onInputChange = () => {
      state.saveScheduleRef.resetValidation();
    };

    const copySchedule = (index, predicate) => {
      const source = state.scheduleDays[index];

      state.scheduleDays.forEach((day) => {
        if (!predicate(day)) return;

        day.startTime = source.startTime;
        day.endTime = source.endTime;
      });
    };

    const copyToAllDays = (index) => {
      copySchedule(index, () => true);
    };

    const copyToWeekdays = (index) => {
      copySchedule(index, (day) => day.day_of_week >= 1 && day.day_of_week <= 5);
    };

    const copyToWeekends = (index) => {
      copySchedule(index, (day) => day.day_of_week === 0 || day.day_of_week === 6);
    };

    const onSubmitForm = async () => {
      try {
        const isValid = await state.saveScheduleRef.validate();
        if (!isValid) return;

        //
        state.isApiLoading = true;

        const windows = [];

        state.scheduleDays.forEach((item) => {
          if (item.enabled) {
            // window json
            const windowJson = {
              day_of_week: item.day_of_week,
              start_time: item.startTime,
              end_time: item.endTime,
            };

            if (item.id) {
              windowJson.id = item.id;
            }

            windows.push(windowJson);
          }
        });

        const payload = {
          name: state.name,
          timezone: state.timezone,
          skip_holidays: state.skipHolidays,
          windows,
        };

        if (state.skipHolidays) {
          payload.holiday_country_code = state.holidayCountry;
        }

        if (isNewSchedule.value) {
          await createSchedule(payload);
          emit('newCreated');
        } else {
          await updateScheduleById({
            id: props.scheduleDetails.id,
            payload,
          });
          emit('existingUpdated');
        }

        appContext.config.globalProperties.$toast({
          message: 'Saved Successfully',
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    // lifecycle
    onMounted(() => {
      if (props.scheduleDetails?.id) {
        const {
          name, timezone, skip_holidays,
          holiday_country_code, windows,
        } = props.scheduleDetails;

        state.name = name || '';
        state.timezone = timezone || '';
        state.skipHolidays = skip_holidays || false;
        state.holidayCountry = holiday_country_code || null;

        // Reset all days first
        state.scheduleDays.forEach((day) => {
          day.enabled = false;
          day.startTime = SCHEDULE_DEFAULT_TIME.startTime;
          day.endTime = SCHEDULE_DEFAULT_TIME.endTime;
        });

        // Apply saved windows
        windows?.forEach((window) => {
          const day = state.scheduleDays.find(
            (item) => item.day_of_week === window.day_of_week,
          );

          if (!day) return;

          day.enabled = true;
          day.id = window.id;
          day.startTime = window.start_time?.slice(0, 5); // 09:00:00 -> 09:00
          day.endTime = window.end_time?.slice(0, 5); // 18:00:00 -> 18:00
        });
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isNewSchedule,

      // methods
      onSubmitForm,
      onInputChange,
      copyToAllDays,
      copyToWeekdays,
      copyToWeekends,

      // rules
      timezoneRules: [
        (val) => !!val || 'Timezone is required',
      ],

      // constants
      SCHEDULE_DAYS_LABEL,
    };
  },
});
</script>

<style lang="scss" scoped>
.save-schedule-card {
  max-width: 600px;

  .app-modal-content {
    .schedule-top-form {
      width: 100%;
      max-width: 360px;

      display: flex;
      flex-direction: column;
      gap: 24px;
      margin-bottom: 32px;

      .holiday-country-container {
        width: 100%;
        padding-top: 12px;
        padding-left: 36px;
      }
    }

    .set-date-time-form {
      .date-time-text {
        color: $black;
        font-size: 16px;
        font-weight: 600;

        margin-bottom: 16px;
      }

      .schedule-days-container {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 24px;

        .schedule-day-row {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 34px;

          // xs max
          @media (max-width: $breakpoint-xs-max) {
            gap: 8px;
          }

          .app-checkbox {
            min-width: 112px;

            .day-label {
              &::before {
                content: attr(data-full);

                // xs max
                @media (max-width: $breakpoint-xs-max) {
                  content: attr(data-short);
                }
              }
            }

            // xs max
            @media (max-width: $breakpoint-xs-max) {
              min-width: 60px;
            }
          }

          .border-space {
            width: 9px;
            height: 1px;
            border-top: 1px solid $grey-200;

            // xs max
            @media (max-width: $breakpoint-xs-max) {
              display: none;
            }
          }

          .copy-btn {
            height: 28px;

            .copy-btn-content {
              display: flex;
              align-items: center;
              height: 100%;

              .copy-icon {
                width: 16px;
                height: 16px;
              }
            }
          }

          &.not-enabled {
            .border-space {
              display: none;
            }

            .copy-btn {
              display: none;
            }
          }
        }
      }
    }
  }
}
</style>
