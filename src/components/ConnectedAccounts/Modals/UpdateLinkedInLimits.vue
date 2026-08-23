<template>
  <q-card
    flat
    class="update-linkedin-limits-card app-modal-card"
  >
    <q-form
      class="full-width app-modal-form"
      ref="saveLinkedInLimitsFormRef"

      @submit.prevent.stop="onSubmit"
    >
      <!-- header -->
      <div class="app-modal-header">
        <!-- header text -->
        <h4 class="modal-header-text">
          Update Account Limits
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
        <!-- Presets Selection Cards (3 Tiers: Safest, Balanced, Aged Accounts) -->
        <div class="presets-container">
          <div class="presets-header-row">
            <span class="presets-section-title">Select Preset Profile</span>
            <q-btn
              flat
              dense
              no-caps
              size="sm"
              color="primary"
              :icon-right="showGuidelines ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
              :label="showGuidelines ? 'Hide Guidelines' : 'View Guidelines'"
              @click="showGuidelines = !showGuidelines"
            />
          </div>

          <div class="preset-cards-grid">
            <div
              v-for="tier in presetTiers"
              :key="tier.key"
              class="preset-card"
              :class="{ 'preset-card--active': activePreset === tier.key }"
              @click="applyPreset(tier.key)"
            >
              <div class="preset-card-header">
                <div class="preset-title-wrap">
                  <div class="preset-title">{{ tier.title }}</div>
                  <div class="preset-desc">{{ tier.subtitle }}</div>
                </div>
                <div class="preset-indicator">
                  <q-icon
                    v-if="activePreset === tier.key"
                    name="check_circle"
                    color="primary"
                    size="20px"
                  />
                  <div v-else class="preset-radio-unselected" />
                </div>
              </div>
              <div class="preset-badge-tag" :class="tier.badgeClass">
                {{ tier.tag }}
              </div>
            </div>
          </div>

          <!-- Collapsible Guidelines Table (4 Columns) -->
          <q-slide-transition>
            <div v-if="showGuidelines" class="guidelines-table-wrapper">
              <table class="guidelines-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Safest</th>
                    <th>Balanced (Recommended)</th>
                    <th>Aged Accounts</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="config in limitsConfigList"
                    :key="`guide-${config.key}`"
                  >
                    <td class="font-medium">{{ config.label }}</td>
                    <td>{{ config.safestText }}</td>
                    <td>{{ config.balancedText }}</td>
                    <td>{{ config.agedText }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </q-slide-transition>
        </div>

        <!-- Section Title for Inputs -->
        <div class="limits-inputs-header">
          <span class="limits-inputs-title">Daily Action Limits</span>
          <span class="limits-inputs-subtitle">Fine-tune individual maximums per day</span>
        </div>

        <!-- Total Actions / Day (Primary full-width input) -->
        <div class="total-actions-wrapper">
          <InputLabel
            isImportant
            :label="totalActionsConfig.label"
          />

          <q-input
            v-model.number="formLimits.LINKEDIN_TOTAL_ACTIONS"

            dense
            outlined
            hide-bottom-space

            :min="1"
            :rules="[val =>
              (val !== null && val !== '' && val >= 0) || 'Please enter a valid number']"

            type="number"
            lazy-rules="ondemand"
            class="limit-input total-actions-input"
            placeholder="Enter total daily actions"

            @update:model-value="onInputChange"
          />

          <div class="limit-hint">
            {{ totalActionsConfig.hint }}
          </div>

          <div
            v-if="formLimits.LINKEDIN_TOTAL_ACTIONS > totalActionsConfig.safeMax"
            class="limit-caution"
          >
            <q-icon name="warning" size="14px" />
            <span>This is above the safe range
              ({{ totalActionsConfig.safeMax }} max)
              and is usually recommended only for aged LinkedIn profiles.</span>
          </div>
        </div>

        <!-- 2-Column Grid for Actions -->
        <div class="actions-grid">
          <div
            v-for="config in gridLimitsConfigList"
            :key="config.key"
            class="action-limit-item"
          >
            <InputLabel
              isImportant
              :label="config.label"
            />

            <q-input
              v-model.number="formLimits[config.key]"
              dense
              outlined
              hide-bottom-space

              :min="0"
              :rules="[val =>
                (val !== null && val !== '' && val >= 0) || 'Please enter a valid number']"

              type="number"
              lazy-rules="ondemand"
              class="limit-input"
              :placeholder="`Enter ${config.label.toLowerCase()}`"

              @update:model-value="onInputChange"
            />

            <div class="limit-hint">
              {{ config.hint }}
            </div>

            <div
              v-if="formLimits[config.key] > config.safeMax"
              class="limit-caution"
            >
              <q-icon name="warning" size="14px" />
              <span>Above safe range ({{ config.safeMax }} max) - usually for aged profiles.</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="app-modal-footer">
        <!-- Update -->
        <q-btn
          no-caps
          unelevated

          type="submit"
          color="primary"
          label="Save"

          :loading="isSaving"
        />

        <!-- Cancel -->
        <q-btn
          flat
          no-caps
          unelevated

          color="primary"
          label="Cancel"
          class="light-primary-btn q-ml-md"

          v-close-popup
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance, watch, computed,
} from 'vue';

// Components
import InputLabel from 'src/components/Form/InputLabel.vue';

// Utils
import { putApiCall } from 'src/utils/apiRequests.js';

// Constants
import {
  LINKEDIN_LIMITS_CONFIG,
  LINKEDIN_SAFEST_PRESET,
  LINKEDIN_BALANCED_PRESET,
  LINKEDIN_AGED_PRESET,
  LINKEDIN_PRESET_TIERS,
} from 'boot/linkedin-constants';

export default defineComponent({
  name: 'UpdateLinkedInLimits',

  emits: ['sendingLimitsUpdated'],

  components: {
    InputLabel,
  },

  props: {
    editLinkedInJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // get current instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      formLimits: {
        LINKEDIN_TOTAL_ACTIONS: LINKEDIN_BALANCED_PRESET.LINKEDIN_TOTAL_ACTIONS,
        LINKEDIN_VISIT_PROFILE: LINKEDIN_BALANCED_PRESET.LINKEDIN_VISIT_PROFILE,
        LINKEDIN_LIKE_POST: LINKEDIN_BALANCED_PRESET.LINKEDIN_LIKE_POST,
        LINKEDIN_CONNECTION_REQUEST: LINKEDIN_BALANCED_PRESET.LINKEDIN_CONNECTION_REQUEST,
        LINKEDIN_MESSAGE: LINKEDIN_BALANCED_PRESET.LINKEDIN_MESSAGE,
        LINKEDIN_INMAIL: LINKEDIN_BALANCED_PRESET.LINKEDIN_INMAIL,
        LINKEDIN_FOLLOW_PROFILE: LINKEDIN_BALANCED_PRESET.LINKEDIN_FOLLOW_PROFILE,
      },
      showGuidelines: false,
      isSaving: false,
      saveLinkedInLimitsFormRef: null,
    });

    const initLimitsFromProps = () => {
      const existingLimits = props.editLinkedInJson?.limits || {};
      const newLimits = {};

      Object.keys(LINKEDIN_LIMITS_CONFIG).forEach((key) => {
        newLimits[key] = existingLimits[key]?.max ?? LINKEDIN_BALANCED_PRESET[key];
      });

      state.formLimits = { ...newLimits };
    };

    watch(
      () => props.editLinkedInJson,
      () => {
        initLimitsFromProps();
      },
      { immediate: true, deep: true },
    );

    const activePreset = computed(() => {
      const isSafest = Object.keys(LINKEDIN_SAFEST_PRESET).every(
        (key) => Number(state.formLimits[key]) === LINKEDIN_SAFEST_PRESET[key],
      );
      if (isSafest) return 'safest';

      const isBalanced = Object.keys(LINKEDIN_BALANCED_PRESET).every(
        (key) => Number(state.formLimits[key]) === LINKEDIN_BALANCED_PRESET[key],
      );
      if (isBalanced) return 'balanced';

      const isAged = Object.keys(LINKEDIN_AGED_PRESET).every(
        (key) => Number(state.formLimits[key]) === LINKEDIN_AGED_PRESET[key],
      );
      if (isAged) return 'aged';

      return 'custom';
    });

    const presetTiers = computed(() => LINKEDIN_PRESET_TIERS);

    const totalActionsConfig = computed(() => LINKEDIN_LIMITS_CONFIG.LINKEDIN_TOTAL_ACTIONS);

    const limitsConfigList = computed(() => Object.values(LINKEDIN_LIMITS_CONFIG));

    const gridLimitsConfigList = computed(() => [
      LINKEDIN_LIMITS_CONFIG.LINKEDIN_VISIT_PROFILE,
      LINKEDIN_LIMITS_CONFIG.LINKEDIN_LIKE_POST,
      LINKEDIN_LIMITS_CONFIG.LINKEDIN_CONNECTION_REQUEST,
      LINKEDIN_LIMITS_CONFIG.LINKEDIN_MESSAGE,
      LINKEDIN_LIMITS_CONFIG.LINKEDIN_INMAIL,
      LINKEDIN_LIMITS_CONFIG.LINKEDIN_FOLLOW_PROFILE,
    ]);

    const onInputChange = () => {
      if (state.saveLinkedInLimitsFormRef) {
        state.saveLinkedInLimitsFormRef.resetValidation();
      }
    };

    const applyPreset = (presetType) => {
      if (presetType === 'safest') {
        state.formLimits = { ...LINKEDIN_SAFEST_PRESET };
      } else if (presetType === 'aged') {
        state.formLimits = { ...LINKEDIN_AGED_PRESET };
      } else {
        state.formLimits = { ...LINKEDIN_BALANCED_PRESET };
      }
      onInputChange();
    };

    const onSubmit = async () => {
      try {
        state.isSaving = true;

        const payload = Object.keys(LINKEDIN_LIMITS_CONFIG).map((action_type) => ({
          action_type,
          max_count: Number(state.formLimits[action_type]) || 0,
        }));

        await putApiCall({
          payload,
          includeWorkspace: true,
          endpoint: `/connected-accounts/linkedin/${props.editLinkedInJson.id}/limits`,
        });

        // Update limits object
        const updatedLimits = { ...(props.editLinkedInJson.limits || {}) };
        payload.forEach((item) => {
          updatedLimits[item.action_type] = {
            ...(updatedLimits[item.action_type] || {}),
            max: item.max_count,
            used: updatedLimits[item.action_type]?.used || 0,
          };
        });

        emit('sendingLimitsUpdated', {
          ...props.editLinkedInJson,
          limits: updatedLimits,
        });

        appContext.config.globalProperties.$toast({
          message: 'Limits updated successfully',
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isSaving = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed
      activePreset,
      presetTiers,
      totalActionsConfig,
      limitsConfigList,
      gridLimitsConfigList,

      // methods
      onSubmit,
      applyPreset,
      onInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.update-linkedin-limits-card {
  position: relative;
  max-width: 780px;
  display: flex;
  flex-direction: column;
  flex: 1;

  // sm min
  @media (min-width: $breakpoint-sm-min) {
    width: 780px;
    min-height: 100%;

    display: flex;
    flex-direction: column;
  }

  @media (min-width: 601px) {
    border-radius: 8px 0px 0px 8px !important;
  }

  @media (min-width: 601px) and (max-width: 785px) {
    width: calc(100vw - 32px);
  }

  .app-modal-form {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .app-modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;

    .presets-container {
      border-radius: 10px;
      padding: 14px 16px;
      border: 1px solid $grey-50;
      background: rgba(var(--grey-50-rgb), 0.35);

      .presets-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;

        .presets-section-title {
          font-size: 13px;
          font-weight: 600;
          color: $black;
        }
      }

      .preset-cards-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;

        @media (max-width: $breakpoint-xs-max) {
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .preset-card {
          border: 1px solid $grey-50;
          background: $white;
          border-radius: 8px;
          padding: 10px 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 6px;

          &:hover {
            border-color: rgba(var(--primary-rgb), 0.4);
            background: rgba(var(--primary-rgb), 0.02);
          }

          &.preset-card--active {
            border-color: $primary;
            background: rgba(var(--primary-rgb), 0.04);
          }

          .preset-card-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;

            .preset-title-wrap {
              .preset-title {
                font-size: 13px;
                font-weight: 600;
                color: $black;
                line-height: 16px;
              }

              .preset-desc {
                font-size: 11px;
                color: $grey-400;
                margin-top: 2px;
                line-height: 14px;
              }
            }

            .preset-indicator {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 18px;
              height: 18px;
              flex-shrink: 0;

              .preset-radio-unselected {
                width: 14px;
                height: 14px;
                border-radius: 50%;
                border: 1.5px solid $grey-200;
              }
            }
          }

          .preset-badge-tag {
            font-size: 11px;
            font-weight: 600;
            border-radius: 4px;
            padding: 2px 6px;
            width: fit-content;
            line-height: 14px;

            &--safest {
              color: $positive;
              background: rgba(var(--positive-rgb), 0.08);
            }

            &--balanced {
              color: $primary;
              background: rgba(var(--primary-rgb), 0.08);
            }

            &--aged {
              color: $secondary;
              background: rgba(var(--secondary-rgb), 0.08);
            }
          }
        }
      }

      .guidelines-table-wrapper {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid $grey-50;
        overflow-x: auto;

        .guidelines-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;

          th {
            text-align: left;
            padding: 6px 10px;
            background: rgba(0, 0, 0, 0.03);
            color: $grey-700;
            font-weight: 600;
            border-radius: 4px;
          }

          td {
            color: $black;
            padding: 6px 10px;
            border-bottom: 1px solid rgba(0, 0, 0, 0.03);

            &.font-medium {
              font-weight: 500;
            }
          }
        }
      }
    }

    .limits-inputs-header {
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding-top: 4px;

      .limits-inputs-title {
        font-size: 14px;
        font-weight: 600;
        color: $black;
      }

      .limits-inputs-subtitle {
        font-size: 12px;
        color: $grey-400;
      }
    }

    .total-actions-wrapper {
      padding-bottom: 16px;
      border-bottom: 1px solid $grey-50;

      .total-actions-input {
        max-width: 320px;
      }
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 18px 24px;

      @media (max-width: $breakpoint-xs-max) {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .action-limit-item {
        display: flex;
        flex-direction: column;
      }
    }

    .limit-input {
      width: 100%;

      :deep(.q-field__native) {
        font-size: 14px;
      }
    }

    .limit-hint {
      font-size: 12px;
      color: $grey-400;
      margin-top: 4px;
      line-height: 16px;
    }

    .limit-caution {
      font-size: 12px;
      color: $warning;
      margin-top: 4px;
      display: flex;
      align-items: flex-start;
      gap: 4px;
      line-height: 16px;
      font-weight: 500;

      .q-icon {
        margin-top: 1px;
        flex-shrink: 0;
      }
    }
  }
}
</style>
