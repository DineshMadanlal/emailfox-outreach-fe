<template>
  <q-card flat class="add-sequence-step-options-card">
    <!-- header -->
    <div class="step-menu-header">
      <p class="step-menu-header-text">
        Add a step
      </p>

      <div class="divider" />
    </div>

    <div class="sequence-steps-wrapper">
      <!-- Options -->
      <q-item
        clickable

        v-for="(option, index) in sequenceStepOptions"
        :key="`add-sequence-step-option-${index}`"

        class="each-sequence-step-item"

        @click="option.clickAction()"
      >
        <div class="sequence-step-content">
          <ChannelIcon
            :icon="option.icon"
            :theme="option.iconTheme"
          />

          <p class="step-title-text">
            {{ option.title }}
          </p>
        </div>
      </q-item>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, computed,
} from 'vue';

// Components
import ChannelIcon from 'components/CampaignWorkflow/SequenceCanvas/ChannelIcon.vue';

export default defineComponent({
  name: 'AddSequenceStepOptions',

  emits: ['onEmailFollowUp', 'onLinkedInFollowUp', 'onConditionFollowUp'],

  components: {
    ChannelIcon,
  },

  props: {
    isEmailOutreachCampaign: {
      type: Boolean,
      default: false,
    },
    isLinkedInOutreachCampaign: {
      type: Boolean,
      default: false,
    },
    isMultiChannelOutreachCampaign: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    // computed
    const sequenceStepOptions = computed(() => {
      const options = [
        {
          icon: 'mail',
          iconTheme: 'warning',
          title: 'Email Action',
          clickAction: () => {
            emit('onEmailFollowUp');
          },
        },
        {
          icon: 'people',
          iconTheme: 'primary',
          title: 'LinkedIn Actions',
          clickAction: () => {
            emit('onLinkedInFollowUp');
          },
        },
        {
          icon: 'condition',
          iconTheme: 'tertiary',
          title: 'Condition',
          clickAction: () => {
            emit('onConditionFollowUp');
          },
        },
      ];

      if (props.isEmailOutreachCampaign) {
        return [{
          icon: 'mail',
          iconTheme: 'warning',
          title: 'Email Action',
          clickAction: () => {
            emit('onEmailFollowUp');
          },
        }];
      }

      if (props.isLinkedInOutreachCampaign) {
        return [{
          icon: 'people',
          iconTheme: 'primary',
          title: 'LinkedIn Actions',
          clickAction: () => {
            emit('onLinkedInFollowUp');
          },
        },
        {
          icon: 'condition',
          iconTheme: 'tertiary',
          title: 'Condition',
          clickAction: () => {
            emit('onConditionFollowUp');
          },
        }];
      }

      if (props.isMultiChannelOutreachCampaign) {
        return options;
      }

      return options;
    });

    return {
      // computed
      sequenceStepOptions,
    };
  },
});
</script>

<style lang="scss" scoped>
.add-sequence-step-options-card {
  width: 100%;
  max-width: 360px;
  padding: 16px 8px;
  min-width: 300px;
  border: 1px solid $grey-50;

  // breakpoint max-width 360px
  @media (min-width: 361px) {
    min-width: 360px;
  }

  .step-menu-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 0px 4px;

    margin-bottom: 12px;

    .step-menu-header-text {
      font-size: 14px;
      font-weight: 600;
      color: $black;
      white-space: nowrap;
    }

    .divider {
      width: 100%;
      height: 1px;
      background-color: $grey-50;
    }
  }

  .sequence-steps-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .each-sequence-step-item {
    min-height: unset;
    padding: 8px 4px;
    border-radius: 6px;

    .sequence-step-content {
      display: flex;
      align-items: center;
      gap: 12px;

      .step-title-text {
        font-size: 14px;
        font-weight: 400;
        color: $black;
      }
    }
  }
}
</style>
