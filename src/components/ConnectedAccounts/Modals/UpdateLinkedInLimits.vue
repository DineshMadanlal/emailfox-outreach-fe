<template>
  <q-card
    flat
    class="update-linkedin-limits-card app-modal-card"
  >
    <q-form
      class="full-width"
      ref="saveApiRateLimitFormRef"

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
        <InputLabel
          isImportant
          label="API Rate Limit per Day"
        />

        <q-input
          v-model.number="apiRateLimit"
          dense
          outlined

          :min="0"
          :rules="[val => !!val || 'Please enter a valid number']"

          type="number"
          lazy-rules="ondemand"
          class="daily-limit-input"
          placeholder="Enter API rate limit per day"

          @update:model-value="onInputChange"
        />
      </div>

      <!-- Footer -->
      <div class="app-modal-footer">
        <q-btn
          no-caps
          unelevated

          type="submit"
          color="primary"
          label="Update Rate Limit"

          :loading="isSaving"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance,
} from 'vue';

// Components
import InputLabel from 'src/components/Form/InputLabel.vue';

// Utils
import { postApiCall } from 'src/utils/apiRequests.js';

export default defineComponent({
  name: 'UpdateLinkedInLimits',

  emits: ['rateLimitsUpdated'],

  components: {
    InputLabel,
  },

  props: {
    selectedRows: {
      type: Array,
      default: () => [],
    },
  },

  setup(props, { emit }) {
    // get current instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      apiRateLimit: 100,
      isSaving: false,

      saveApiRateLimitFormRef: null,
    });

    const onInputChange = () => {
      state.saveApiRateLimitFormRef.resetValidation();
    };

    const onSubmit = async () => {
      try {
        state.isSaving = true;

        const payload = {
          api_rate_limit: state.apiRateLimit,
          linkedin_ids: props.selectedRows.map((row) => row.id),
        };

        await postApiCall({
          payload,
          includeWorkspace: true,
          endpoint: 'connected-accounts/linkedin/bulk-update',
        });

        emit('rateLimitsUpdated');

        appContext.config.globalProperties.$toast({
          message: 'API Rate Limit updated successfully',
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

      // methods
      onSubmit,
      onInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.update-linkedin-limits-card {
  max-width: 640px;

  .app-modal-content {
    .daily-limit-input {
      width: 100%;
      max-width: 400px;
    }
  }
}
</style>
