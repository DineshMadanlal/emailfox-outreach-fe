<template>
  <q-card flat class="create-warmup-profile-card app-modal-card">
    <q-form
      class="warmup-profile-form"
      ref="saveWarmupProfileRef"

      @submit.prevent.stop="onSaveWarmupProfile"
    >
      <!-- header -->
      <div class="app-modal-header">
        <!-- header text -->
        <h4 class="modal-header-text">
          {{ saveProfileHeaderText }}
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

      <!-- Content -->
      <div class="app-modal-content">
        <!-- Profile Name -->
        <div class="profile-name-section">
          <InputLabel
            isImportant
            label="Profile Name"
          />

          <q-input
            dense
            outlined
            hide-bottom-space

            lazy-rules="ondemand"
            class="profile-name-input"

            v-model="profileName"

            :readonly="readOnly"
            :autofocus="isNewProfile"
            :rules="profileNameRules"

            @update:model-value="onInputChange"
          />
        </div>

        <div class="general-preference-section">
          <p class="warmup-form-header-text">
            General Preference
          </p>

          <div class="general-form-grid">
            <!--  -->
            <div class="two-input-grid">
              <!-- Start with Emails/Day -->
              <div class="full-width">
                <InputLabel
                  isImportant
                  label="Start with Emails/Day"
                />

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  :min="1"
                  :max="10"
                  type="number"
                  :readonly="readOnly"

                  v-model.number="startEmailsPerDay"

                  @update:model-value="onInputChange"
                />
              </div>

              <!-- Warmup Email Ramp-up -->
              <div class="full-width">
                <InputLabel
                  isImportant
                  label="Warmup Email Ramp-up"
                />

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  :min="1"
                  :max="40"
                  type="number"
                  :readonly="readOnly"

                  v-model.number="rampUpPerDay"

                  @update:model-value="onInputChange"
                />
              </div>
            </div>

            <!--  -->
            <div class="two-input-grid">
              <!-- Maximum Email Sent/Day -->
              <div class="full-width">
                <InputLabel
                  isImportant
                  label="Maximum Email Sent/Day"
                />

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  :min="1"
                  :max="40"
                  type="number"
                  :readonly="readOnly"

                  v-model.number="maxEmailsPerDay"

                  @update:model-value="onInputChange"
                />
              </div>

              <!-- Warmup Reply Rate % -->
              <div class="full-width">
                <InputLabel
                  isImportant
                  label="Warmup Reply Rate %"
                />

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  :min="1"
                  :max="50"
                  type="number"
                  :readonly="readOnly"

                  v-model.number="replyRate"

                  @update:model-value="onInputChange"
                />
              </div>
            </div>

            <!--  -->
            <div class="two-input-grid">
              <div class="full-width">
                <InputLabel
                  isImportant
                  label="Schedule Timezone"
                />

                <!-- Add your modal content here -->
                <SelectTimezone
                  :readonly="readOnly"
                  :rules="timezoneRules"

                  lazy-rules="ondemand"
                  v-model="scheduleTimezone"

                  @update:model-value="onInputChange"
                />
              </div>
            </div>
          </div>
        </div>

        <p class="warmup-form-header-text">
          Email Sending Schedule
        </p>

        <p class="warmup-form-label-text">
          Choose when warmup emails should be sent to best match natural sending behavior.
        </p>

        <div class="warmup-sending-schedule-container">
          <q-item
            clickable

            v-for="(option, index) of warmupSendingScheduleOptions"
            :key="`warmup-sending-option-${index}`"

            class="each-warmup-sending-item"
            :class="{ active: sendingSchedule === option.value }"
          >
            <q-radio
              dense

              :disable="readOnly"
              :val="option.value"
              v-model="sendingSchedule"

              @update:model-value="onInputChange"

              class="warmup-schedule-radio"
            >
              <div class="warmup-radio-content">
                <!-- label -->
                <p class="sending-label-text">
                  {{ option.label }}
                </p>

                <!-- recommended -->
                <p
                  class="recommended-badge"
                  v-if="option.recommended"
                >
                  Recommended
                </p>
              </div>

              <p class="sending-description-text">
                {{ option.description }}
              </p>
            </q-radio>
          </q-item>
        </div>
      </div>

      <!-- Footer -->
      <div class="app-modal-footer">
        <!--  -->
        <q-btn
          no-caps
          v-close-popup

          color="primary"
          label="Okay, close"

          v-if="readOnly"
        />

        <!--  -->
        <q-btn
          v-else

          no-caps
          unelevated
          :loading="isApiLoading"

          type="submit"
          color="primary"
          label="Save & continue"
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
import SelectTimezone from 'components/Dropdown/SelectTimezone.vue';

// utils
import { createWarmupProfile, updateWarmupProfile } from 'src/utils/warmupApi';

// constants
import { WARMUP_SENDING_SCHEDULE, WARMUP_SENDING_SCHEDULE_LABLES } from 'boot/warmup-constants';

export default defineComponent({
  name: 'SaveWarmupProfile',

  emits: ['createdWarmupProfileDetails', 'updatedWarmupProfileDetails'],

  components: {
    InputLabel,
    SelectTimezone,
  },

  props: {
    readOnly: {
      type: Boolean,
      default: false,
    },
    warmupProfileId: {
      type: [String, Number],
      default: null,
    },
    warmupProfileDetails: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      profileName: '',

      scheduleTimezone: null,
      startEmailsPerDay: 3,
      rampUpPerDay: 3,
      maxEmailsPerDay: 30,
      replyRate: 30,

      sendingSchedule: WARMUP_SENDING_SCHEDULE.ONLY_WEEKDAYS,

      saveWarmupProfileRef: null,

      isApiLoading: false,
    });

    // computed
    const isNewProfile = computed(() => !props.warmupProfileId);

    const saveProfileHeaderText = computed(() => {
      if (props.readOnly) {
        return 'View Profile';
      }

      return isNewProfile.value ? 'New Profile' : 'Edit Profile';
    });

    const warmupSendingScheduleOptions = computed(() => {
      const options = [
        {
          ...WARMUP_SENDING_SCHEDULE_LABLES[WARMUP_SENDING_SCHEDULE.ONLY_WEEKDAYS],
          value: WARMUP_SENDING_SCHEDULE.ONLY_WEEKDAYS,
        },
        {
          ...WARMUP_SENDING_SCHEDULE_LABLES[WARMUP_SENDING_SCHEDULE.INCLUDE_WEEKENDS],
          value: WARMUP_SENDING_SCHEDULE.INCLUDE_WEEKENDS,
        },
      ];

      return options;
    });

    // methods
    const onInputChange = () => {
      state.saveWarmupProfileRef.resetValidation();
    };

    const onSaveWarmupProfile = async () => {
      try {
        state.isApiLoading = true;

        const payload = {
          name: state.profileName,
          schedule_timezone: state.scheduleTimezone,
          start_value: state.startEmailsPerDay,
          ramp_up_value: state.rampUpPerDay,
          max_warmup_value: state.maxEmailsPerDay,
          reply_rate: state.replyRate,
          sending_schedule: state.sendingSchedule,
        };

        if (isNewProfile.value) {
          // Call API to create new warmup profile with payload
          const response = await createWarmupProfile(payload);

          emit('createdWarmupProfileDetails', {
            id: response.id,
            ...payload,
          });
        } else {
          // Call API to update existing warmup profile with payload and props.warmupProfileId
          await updateWarmupProfile(props.warmupProfileId, payload);

          emit('updatedWarmupProfileDetails', {
            id: props.warmupProfileId,
            ...payload,
          });
        }

        // positive notification
        appContext.config.globalProperties.$toast({
          message: 'Warmup profile saved successfully',
        });
      } catch (error) {
        // Handle error
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    // life cycle hooks
    onMounted(() => {
      if (props.warmupProfileDetails?.id) {
        // prefill
        state.profileName = props.warmupProfileDetails.name || '';
        state.scheduleTimezone = props.warmupProfileDetails.schedule_timezone || null;
        state.startEmailsPerDay = props.warmupProfileDetails.start_value || 3;
        state.rampUpPerDay = props.warmupProfileDetails.ramp_up_value || 3;
        state.maxEmailsPerDay = props.warmupProfileDetails.max_warmup_value || 40;
        state.replyRate = props.warmupProfileDetails.reply_rate || 30;
        state.sendingSchedule = props.warmupProfileDetails.sending_schedule
          || WARMUP_SENDING_SCHEDULE.ONLY_WEEKDAYS;
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isNewProfile,
      saveProfileHeaderText,
      warmupSendingScheduleOptions,

      // methods
      onInputChange,
      onSaveWarmupProfile,

      profileNameRules: [
        (val) => val.length > 2 || 'Minimum of 3 characters required',
      ],
      timezoneRules: [
        (val) => !!val || 'Timezone is required',
      ],
    };
  },
});
</script>

<style lang="scss" scoped>
.create-warmup-profile-card {
  $modalHeaderHeight: 68px;
  position: relative;
  max-width: 738px;

  // sm min
  @media (min-width: $breakpoint-sm-min) {
    width: 738px;
    min-height: 100%;

    display: flex;
    flex-direction: column;

    .app-modal-content {
      flex: 1;
    }
  }

  @media (min-width: 601px) {
    border-radius: 8px 0px 0px 8px !important;
  }

  @media (min-width: 601px) and (max-width: 737px) {
    // For medium screens, we can set a specific width or use a percentage
    width: calc(100vw - 32px);
  }

  .warmup-profile-form {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .app-modal-header {
    background: $grey-50;
    height: $modalHeaderHeight;
  }

  .app-modal-content {
    .profile-name-section {
      margin-bottom: 32px;
      padding-bottom: 32px;

      border-bottom: 1.2px solid rgba($color: var(--grey-50-rgb), $alpha: 0.6);

      .profile-name-input {
        max-width: 390px;
      }
    }

    .warmup-form-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;
    }

    .warmup-form-label-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-top: 6px;
      margin-bottom: 20px;
    }

    .warmup-sending-schedule-container {
      display: flex;
      gap: 20px;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        flex-direction: column;
      }

      .each-warmup-sending-item {
        width: 100%;
        border-radius: 8px;
        background: $white;
        border: 1px solid $grey-50;

        padding: 20px 16px;

        &.active {
          border-radius: 8px;
          background: rgba($color: var(--primary-rgb), $alpha: 0.04);
          border: 1px solid rgba($color: var(--primary-rgb), $alpha: 0.1);
        }

        .warmup-schedule-radio {
          display: flex;
          align-items: flex-start;

          :deep(.q-radio__label) {
            padding-left: 12px;
          }
        }

        .warmup-radio-content {
          gap: 6px;
          display: flex;
          align-items: center;

          .sending-label-text {
            color: $black;
            font-size: 14px;
            font-weight: 500;
            line-height: normal;
          }

          .recommended-badge {
            padding: 1px 6px;
            color: $black;
            font-size: 12px;
            font-weight: 400;
            line-height: 14px;

            border-radius: 40px;
            background: rgba($color: var(--primary-rgb), $alpha: 0.2);
          }
        }

        .sending-description-text {
          color: $grey;
          font-size: 14px;
          font-weight: 400;
          line-height: 20px;

          margin-top: 4px;
        }
      }
    }

    .general-preference-section {
      margin-bottom: 32px;
      padding-bottom: 32px;

      border-bottom: 1.2px solid rgba($color: var(--grey-50-rgb), $alpha: 0.6);

      .general-form-grid {
        margin-top: 20px;

        display: grid;
        grid-row-gap: 32px;
      }
    }
  }

  .app-modal-footer {

  }
}
</style>
