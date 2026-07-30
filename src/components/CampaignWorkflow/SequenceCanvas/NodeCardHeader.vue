<template>
  <div class="node-card-header">
    <!-- Icon -->
    <WorkflowStepIcon
      :icon="data.icon"
      :theme="data.theme"
    />

    <!-- Title -->
    <p class="card-title-text">
      {{ data.title }}
    </p>

    <q-space />

    <div
      v-if="isEmailStep"
      class="email-step-actions"
    >
      <!-- Delete Step -->
      <q-btn

        flat
        dense
        no-caps
        unelevated

        color="negative"
        class="nodrag app-negative-button"

        @click.stop="$emit('onDelete')"

        v-if="isEmailSingleVariant"
      >
        <LocalSvgIcon
          image="delete"
          classes="app-negative-icon"
        />
      </q-btn>

      <!-- More Options -->
      <MoreButton
        v-else
        class="more-button"
      >
        <EmailVariantsMoreOptions
          @deleteSequence="$emit('onDelete')"
          @editVariantConfigurations="$emit('editVariantConfigurations')"
        />
      </MoreButton>
    </div>

    <!-- Delete Step -->
    <q-btn
      v-else

      flat
      dense
      no-caps
      unelevated

      color="negative"
      class="nodrag app-negative-button"

      @click.stop="$emit('onDelete')"
    >
      <LocalSvgIcon
        image="delete"
        classes="app-negative-icon"
      />
    </q-btn>
  </div>
</template>
<script>
// vue
import { defineComponent } from 'vue';

// Components
import MoreButton from 'components/Buttons/MoreButton.vue';
import EmailVariantsMoreOptions from 'components/Menu/EmailVariantsMoreOptions.vue';
import WorkflowStepIcon from 'components/CampaignWorkflow/SequenceCanvas/WorkflowStepIcon.vue';

export default defineComponent({
  name: 'NodeCardHeader',

  emits: ['onDelete', 'editVariantConfigurations'],

  components: {
    MoreButton,
    EmailVariantsMoreOptions,
    WorkflowStepIcon,
  },

  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
    isEmailStep: {
      type: Boolean,
      default: false,
    },
    isEmailSingleVariant: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.node-card-header {
  width: 100%;
  padding: 10px 12px;

  display: flex;
  align-items: center;

  .card-title-text {
    color: $grey;
    font-size: 14px;
    line-height: 20px;
    margin-left: 12px;
  }

  .more-button {
    padding: 0px 2px;
  }
}
</style>
