<template>
  <div class="invitation-withdrawl custom-scrollbar">
    <!-- Header -->
    <div class="settings-section-header">
      <!-- left side -->
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          LinkedIn Invitation Withdrawal
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          Automatically withdraw pending LinkedIn connection invitations
          after a specified number of days.
        </p>
      </div>
    </div>

    <!-- Content -->
    <div class="settings-section-content">
      <!-- Loading Skeleton -->
      <div
        v-if="isLoading"
        class="withdrawal-loading-container"
      >
        <q-skeleton
          type="text"
          width="75%"
          class="q-mb-sm"
        />
        <q-skeleton
          type="text"
          width="50%"
          class="q-mb-lg"
        />
        <q-skeleton
          type="text"
          width="35%"
          class="q-mb-md"
        />
        <q-skeleton
          type="rect"
          height="240px"
          class="withdrawal-skeleton-card"
        />
      </div>

      <!-- Main Settings Form -->
      <div
        v-else
        class="withdrawal-settings-form"
      >
        <!-- Descriptive Paragraph -->
        <p class="withdrawal-description-text">
          Automatically withdrawing pending invitations helps maintain a high acceptance ratio,
          which is a best practice favored by LinkedIn. It also allows you to resend invitations
          after 3 weeks, providing a new opportunity to connect. This applies to all pending
          connection requests, including invitations sent directly via LinkedIn.
        </p>

        <!-- Subheading -->
        <p class="withdrawal-section-title">
          Withdraw all LinkedIn invitations after
        </p>

        <!-- Options Card -->
        <div class="withdrawal-options-card">
          <div
            v-for="option in WITHDRAWAL_OPTIONS"
            :key="option.id"
            class="withdrawal-option-row"
            :class="{
              'is-selected': selectedMode === option.id,
              'manual-withdraw-row': option.isCustom,
            }"
            @click="onSelectMode(option.id)"
          >
            <div class="manual-row-main">
              <div class="withdrawal-option-left">
                <q-radio
                  dense
                  color="primary"
                  :model-value="selectedMode"
                  :val="option.id"
                  class="withdrawal-radio"
                />
                <span class="withdrawal-option-label">
                  {{ option.label }}
                </span>
              </div>

              <!-- Inline custom days input for Manual Withdraw -->
              <div
                v-if="option.isCustom && selectedMode === option.id"
                class="manual-days-container"
                @click.stop
              >
                <q-input
                  dense
                  outlined
                  autofocus

                  type="number"
                  placeholder="Days"

                  v-model.number="customDays"

                  :disable="isReadOnly"
                  :min="WITHDRAWAL_LIMITS.MIN_DAYS"
                  :max="WITHDRAWAL_LIMITS.MAX_DAYS"

                  class="manual-days-input"
                />
                <span class="manual-days-unit">days</span>
              </div>
            </div>

            <!-- Validation error if outside allowed bounds -->
            <p
              v-if="option.isCustom && selectedMode === option.id && !isManualValid"
              class="manual-error-text"
            >
              Please enter a number between
              {{ WITHDRAWAL_LIMITS.MIN_DAYS }} and {{ WITHDRAWAL_LIMITS.MAX_DAYS }} days.
            </p>
          </div>
        </div>

        <!-- Inline Save Button -->
        <div class="withdrawal-action-container">
          <q-btn
            no-caps
            unelevated
            color="primary"
            label="Save Changes"
            class="save-btn w-fit"
            :loading="isSaving"
            :disable="isSaveDisabled"
            @click="onSaveSettings"
          >
            <AppTooltip
              v-if="isReadOnly"
              content="You have read-only access in this workspace"
            />
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  ref,
  onMounted,
  getCurrentInstance,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';
import { usePermissions } from 'src/composables/usePermissions';

// utils
import { getApiCall, putApiCall } from 'src/utils/apiRequests';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================
const WITHDRAWAL_SETTINGS_ENDPOINT = '/connected-accounts/linkedin/invitation-withdrawal-settings';

const WITHDRAWAL_LIMITS = Object.freeze({
  MIN_DAYS: 1,
  MAX_DAYS: 90,
  DEFAULT_MANUAL_DAYS: 14,
});

const WITHDRAWAL_MODES = Object.freeze({
  PRESET_14: 'PRESET_14',
  PRESET_30: 'PRESET_30',
  PRESET_60: 'PRESET_60',
  MANUAL: 'MANUAL',
  DO_NOT_WITHDRAW: 'DO_NOT_WITHDRAW',
});

const MODE_VALUE_MAP = Object.freeze({
  [WITHDRAWAL_MODES.PRESET_14]: 14,
  [WITHDRAWAL_MODES.PRESET_30]: 30,
  [WITHDRAWAL_MODES.PRESET_60]: 60,
  [WITHDRAWAL_MODES.DO_NOT_WITHDRAW]: null,
});

const WITHDRAWAL_OPTIONS = Object.freeze([
  {
    id: WITHDRAWAL_MODES.PRESET_14,
    label: '14 days',
    isCustom: false,
  },
  {
    id: WITHDRAWAL_MODES.PRESET_30,
    label: '30 days',
    isCustom: false,
  },
  {
    id: WITHDRAWAL_MODES.PRESET_60,
    label: '60 days',
    isCustom: false,
  },
  {
    id: WITHDRAWAL_MODES.MANUAL,
    label: 'Manual Withdraw',
    isCustom: true,
  },
  {
    id: WITHDRAWAL_MODES.DO_NOT_WITHDRAW,
    label: 'Do not withdraw',
    isCustom: false,
  },
]);

/**
 * Resolves the active mode based on raw day values returned by the API.
 * @param {number|null|undefined} days
 * @returns {string} Mode key from WITHDRAWAL_MODES
 */
const resolveModeFromDays = (days) => {
  if (days === null || days === undefined || days === 0) {
    return WITHDRAWAL_MODES.DO_NOT_WITHDRAW;
  }

  const matchingPreset = Object.entries(MODE_VALUE_MAP).find(
    ([, value]) => value === Number(days),
  );

  return matchingPreset ? matchingPreset[0] : WITHDRAWAL_MODES.MANUAL;
};

export default defineComponent({
  name: 'InvitationWithdrawl',

  components: {
    AppTooltip,
  },

  setup() {
    // App context for global toast notifications
    const { appContext } = getCurrentInstance();

    // Composables
    const { generateMetadata } = useAppHelpersApi();
    const { isReadOnly } = usePermissions();

    // Metadata
    useMeta(generateMetadata('LinkedIn Invitation Withdrawal'));

    // Reactive component state
    const state = reactive({
      isLoading: false,
      isSaving: false,
      initialWithdrawAfterDays: null,
      lastRunAt: null,
    });

    // Default mode: DO_NOT_WITHDRAW (withdraw_after_days = null)
    const selectedMode = ref(WITHDRAWAL_MODES.DO_NOT_WITHDRAW);

    // Custom days state for manual entry
    const customDays = ref(WITHDRAWAL_LIMITS.DEFAULT_MANUAL_DAYS);

    // Validation: checks whether manual input is within valid bounds [1, 99]
    const isManualValid = computed(() => {
      if (selectedMode.value !== WITHDRAWAL_MODES.MANUAL) return true;
      const val = Number(customDays.value);
      return (
        Number.isInteger(val)
        && val >= WITHDRAWAL_LIMITS.MIN_DAYS
        && val <= WITHDRAWAL_LIMITS.MAX_DAYS
      );
    });

    // Resolve current selected withdraw_after_days value for payload / diff checking
    const currentWithdrawAfterDays = computed(() => {
      if (selectedMode.value === WITHDRAWAL_MODES.MANUAL) {
        return isManualValid.value ? Number(customDays.value) : null;
      }
      return MODE_VALUE_MAP[selectedMode.value] ?? null;
    });

    // Determine if form state has unsaved changes compared to baseline
    const hasChanges = computed(() => {
      if (selectedMode.value === WITHDRAWAL_MODES.MANUAL && !isManualValid.value) {
        return false;
      }
      return currentWithdrawAfterDays.value !== state.initialWithdrawAfterDays;
    });

    // Determine if Save button should be disabled
    const isSaveDisabled = computed(() => (
      isReadOnly.value
        || state.isSaving
        || !hasChanges.value
        || (selectedMode.value === WITHDRAWAL_MODES.MANUAL && !isManualValid.value)
    ));

    // User selected an option
    const onSelectMode = (mode) => {
      if (isReadOnly.value) return;
      selectedMode.value = mode;

      if (mode === WITHDRAWAL_MODES.MANUAL && !isManualValid.value) {
        customDays.value = WITHDRAWAL_LIMITS.DEFAULT_MANUAL_DAYS;
      }
    };

    // Fetch workspace invitation withdrawal settings
    const fetchSettings = async () => {
      try {
        state.isLoading = true;

        const response = await getApiCall({
          endpoint: WITHDRAWAL_SETTINGS_ENDPOINT,
          includeWorkspace: true,
        });

        const fetchedDays = response?.withdraw_after_days;
        const resolvedMode = resolveModeFromDays(fetchedDays);

        selectedMode.value = resolvedMode;

        if (resolvedMode === WITHDRAWAL_MODES.MANUAL) {
          customDays.value = Number(fetchedDays);
          state.initialWithdrawAfterDays = Number(fetchedDays);
        } else {
          state.initialWithdrawAfterDays = MODE_VALUE_MAP[resolvedMode] ?? null;
        }

        state.lastRunAt = response?.last_run_at || null;
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to fetch invitation withdrawal settings',
        });
      } finally {
        state.isLoading = false;
      }
    };

    // Save updated invitation withdrawal settings
    const onSaveSettings = async () => {
      if (isSaveDisabled.value) return;

      try {
        state.isSaving = true;

        const payload = {
          withdraw_after_days: currentWithdrawAfterDays.value,
        };

        const response = await putApiCall({
          endpoint: WITHDRAWAL_SETTINGS_ENDPOINT,
          includeWorkspace: true,
          payload,
        });

        // Sync baseline with updated value
        state.initialWithdrawAfterDays = currentWithdrawAfterDays.value;
        if (response?.settings?.last_run_at) {
          state.lastRunAt = response.settings.last_run_at;
        }

        appContext.config.globalProperties.$toast({
          success: true,
          message: response?.message || 'Invitation withdrawal settings saved successfully',
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to update invitation withdrawal settings',
        });
      } finally {
        state.isSaving = false;
      }
    };

    onMounted(() => {
      fetchSettings();
    });

    return {
      // Constants exposed to template
      WITHDRAWAL_OPTIONS,
      WITHDRAWAL_LIMITS,

      // State & Computeds
      ...toRefs(state),

      // computed
      selectedMode,
      customDays,
      isManualValid,
      hasChanges,
      isSaveDisabled,
      isReadOnly,

      // Methods
      onSelectMode,
      onSaveSettings,
    };
  },
});
</script>

<style lang="scss" scoped>
.invitation-withdrawl {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.withdrawal-loading-container {
  max-width: 680px;

  .withdrawal-skeleton-card {
    max-width: 440px;
    border-radius: 8px;
  }
}

.withdrawal-settings-form {
  display: flex;
  flex-direction: column;

  .withdrawal-description-text {
    font-size: 12px;
    font-weight: 400;
    line-height: 18px;
    max-width: 840px;
    margin-bottom: 20px;
    color: rgba($color: var(--black-rgb), $alpha: 0.8);
  }

  .withdrawal-section-title {
    font-size: 14px;
    font-weight: 600;
    line-height: 18px;
    color: $black;
    margin-bottom: 16px;
  }

  .withdrawal-options-card {
    width: 100%;
    max-width: 500px;
    background-color: $white;
    border: 1px solid $grey-50;
    border-radius: 8px;
    overflow: hidden;

    .withdrawal-option-row {
      display: flex;
      flex-direction: column;
      padding: 14px 16px;
      cursor: pointer;
      border-bottom: 1px solid $grey-50;
      transition: background-color 0.15s ease;

      &:last-child {
        border-bottom: none;
      }

      &:hover:not(.is-selected) {
        background-color: rgba($color: var(--secondary-rgb), $alpha: 0.07);
      }

      &.is-selected {
        background-color: rgba($color: var(--primary-rgb), $alpha: 0.05);

        .withdrawal-option-label {
          color: $black;
          font-weight: 500;
        }
      }

      .withdrawal-option-left {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .withdrawal-radio {
        pointer-events: none;
      }

      .withdrawal-option-label {
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;
        color: $black;
        user-select: none;
      }

      &.manual-withdraw-row {
        .manual-row-main {
          display: flex;
          align-items: center;
          justify-content: space-between;
          width: 100%;
          gap: 12px;
        }

        .manual-days-container {
          display: flex;
          align-items: center;
          gap: 6px;

          .manual-days-input {
            width: 76px;

            :deep(.q-field__control) {
              height: 32px;
              min-height: 32px;
              padding: 0 8px;
            }

            :deep(.q-field__native) {
              height: 32px;
              min-height: 32px;
              font-size: 13px;
              text-align: center;
              padding: 0;
            }
          }

          .manual-days-unit {
            font-size: 13px;
            color: rgba($color: var(--black-rgb), $alpha: 0.7);
            user-select: none;
          }
        }

        .manual-error-text {
          font-size: 12px;
          color: $negative;
          margin-top: 6px;
          margin-left: 32px;
        }
      }
    }
  }

  .withdrawal-action-container {
    margin-top: 24px;

    .save-btn {
      min-width: 120px;
    }
  }
}
</style>
