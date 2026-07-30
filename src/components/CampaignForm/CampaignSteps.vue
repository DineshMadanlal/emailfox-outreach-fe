<template>
  <div class="campaign-form-stepper-block">
    <div
      v-for="(data, index) in sequenceFormSteps"
      :key="`campaign-form-stepper-step-${index}`"
      class="campaign-stepper"

      :class="{
        'completed-step': data.isStepCompleted,
        'active-step': data.isStepActive,
      }"
    >
      <!-- if the step is clickable -->
      <q-item
        v-ripple:primary
        class="domain-step-item"

        clickable

        :to="data.toRoute"
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
import { computed, defineComponent } from 'vue';

// vue router
import { useRoute } from 'vue-router';

// constants
import { SEQUENCE_FORM_STEPS } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'SequenceSteps',

  emits: ['setStep'],

  props: {
    campaignByIdJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    // router
    const $route = useRoute();

    // computed
    const activeRoutePath = computed(() => $route.path);

    const campaignId = computed(() => props.campaignByIdJson.id);

    const sequenceFormSteps = computed(() => {
      const steps = [
        {
          ...SEQUENCE_FORM_STEPS.SETUP_SEQUENCE,
          toRoute: 'sequence',
          isStepActive: activeRoutePath.value.includes(`/outreach/campaigns/${campaignId.value}/edit/sequence`),
        },
        {
          ...SEQUENCE_FORM_STEPS.SAVE_CONTACTS,
          toRoute: 'contacts',
          isStepActive: activeRoutePath.value.includes(`/outreach/campaigns/${campaignId.value}/edit/contacts`),
        },
        {
          ...SEQUENCE_FORM_STEPS.SETTINGS,
          toRoute: 'settings',
          isStepActive: activeRoutePath.value.includes(`/outreach/campaigns/${campaignId.value}/edit/settings`),
        },
      ];

      return steps;
    });

    return {
      // computed
      sequenceFormSteps,
    };
  },
});
</script>

<style lang="scss" scoped>
.campaign-form-stepper-block {
  display: flex;
  align-items: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    overflow-x: auto;
  }

  .campaign-stepper {
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

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        display: none;
      }
    }

    .domain-step-item {
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
