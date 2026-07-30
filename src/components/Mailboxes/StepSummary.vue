<template>
  <div class="add-mailbox-step-summary hide-scrollbar">
    <div
      v-for="(data, index) in addMailboxImportSteps"
      :key="`add-mailbox-step-${index}`"
      class="add-mailbox-stepper"

      :class="{
        'completed-step': completedStepsJson[data.value],
        'active-step': data.step === activeStep,
      }"
    >
      <!-- if the step is clickable -->
      <q-item
        v-ripple:primary
        class="add-mailbox-step-item"

        :clickable="completedStepsJson[data.value] || completedStepsJson[data.previousStep]"

        @click="$emit('setStep', data.step)"
      >
        <div class="flex no-wrap items-center">
          <p class="step-number-text">
            {{ data.step }}
          </p>

          <p class="step-label-text">
            {{ data.label }}
          </p>
        </div>
      </q-item>

      <LocalSvgIcon
        v-if="!data.lastStep"

        image="step-separator"
        class="step-separator-icon"
      />
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// constants
import { MAILBOX_IMPORT_STEPS } from 'boot/constants';

export default defineComponent({
  name: 'StepSummary',

  emits: ['setStep'],

  props: {
    activeStep: {
      type: Number,
      required: true,
    },
    completedStepsJson: {
      type: Object,
      required: true,
    },
  },

  setup() {
    // computed
    const addMailboxImportSteps = computed(() => Object.values(MAILBOX_IMPORT_STEPS));

    return {
      // computed
      addMailboxImportSteps,
    };
  },
});
</script>

<style lang="scss" scoped>
.add-mailbox-step-summary {
  width: 100%;
  display: flex;
  align-items: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    overflow-x: auto;
  }

  .add-mailbox-stepper {
    display: flex;
    align-items: center;

    color: $grey;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      &:not(:last-child) {
        margin-right: 4px;
      }
    }

    :deep(.step-separator-icon) {
      margin: 0px 2px;

      @media (max-width: $breakpoint-xs-max) {
        // display: none;
        margin-left: 8px;
      }
    }

    .add-mailbox-step-item {
      min-height: unset;
      padding: 10px 10px;
      border-radius: 8px;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 2px;
      }
    }

    .step-number-text {
      text-align: center;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;
      border: 1px solid $grey-100;
      border-radius: 100%;

      height: 20px;
      width: 20px;

      display: flex;
      align-items: center;
      justify-content: center;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        min-height: 14px;
        min-width: 14px;

        max-height: 14px;
        max-width: 14px;

        font-size: 11px;
      }
    }

    .step-label-text {
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;

      margin-left: 6px;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        margin-left: 4px;
        font-size: 13px;
      }
    }

    &.completed-step {
      .step-number-text {
        color: $white;
        border: 0px;
        background: $positive;
      }

      .step-label-text {
        color: $positive;
        font-weight: 500;
      }
    }

    &.active-step {
      .step-number-text {
        color: $white;
        border: 0px;
        background: $primary;
      }

      .step-label-text {
        color: $primary;
        font-weight: 500;
      }
    }
  }
}
</style>
