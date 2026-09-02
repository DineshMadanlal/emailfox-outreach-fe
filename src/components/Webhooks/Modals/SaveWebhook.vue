<template>
  <q-card flat class="save-webhook-card app-modal-card">
    <q-form
      class="full-width"
      ref="saveWebhookFormRef"

      @submit.prevent.stop="onSaveWebhook"
    >
      <!-- Header -->
      <div class="app-modal-header">
        <!--  -->
        <h4 class="modal-header-text">
          {{ isNewWebhook ? 'Add' : 'Edit' }} Webhook
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
        <div class="webhook-form-group">
          <!-- Name -->
          <div class="full-width">
            <InputLabel
              isImportant
              label="Name"
            />

            <q-input
              dense
              outlined
              no-error-icon
              hide-bottom-space
              :autofocus="isNewWebhook"

              v-model="form.name"

              lazy-rules="ondemand"
              placeholder="Eg. Slack Alert, CRM Push"

              :maxlength="100"
              :rules="[
                val => !!val || 'Name is required',
                val => (val && val.length <= 100) || 'Name must not exceed 100 characters'
              ]"

              @update:model-value="onInputChange"

              class="form-input"
            />
          </div>

          <!-- URL -->
          <div class="full-width">
            <InputLabel
              isImportant
              label="Webhook URL"
            />

            <q-input
              dense
              outlined
              no-error-icon
              hide-bottom-space

              v-model="form.url"

              ref="webhookUrlFormRef"

              lazy-rules="ondemand"
              placeholder="Eg. https://your-domain.com/webhook/endpoint"

              :maxlength="2048"
              :rules="[
                val => !!val || 'URL is required',
                val => (val && val.length <= 2048) || 'URL must not exceed 2048 characters',
                val => HTTP_OR_HTTPS_REGEX.test(val) || 'URL must start with http:// or https://'
              ]"

              @update:model-value="onInputChange"

              class="form-input"
            />
          </div>

          <!-- Event Types List -->
          <div class="event-types-form custom-scrollbar">
            <InputLabel
              isImportant
              label="Select Event Types"
            />

            <q-field
              borderless
              no-error-icon
              hide-bottom-space
              :model-value="form.event_types.length > 0"

              :rules="[val => val || 'At least one event type must be selected']"
              lazy-rules="ondemand"
              class="event-types-list"

              ref="eventTypesFormRef"
            >
              <div
                v-for="(event) in webhookEventTypes"
                :key="`webhook-event-type-${event.value}`"
                class="event-type-item"
              >
                <q-checkbox
                  dense
                  v-model="form.event_types"

                  :val="event.value"
                  :label="event.label"

                  class="app-checkbox full-width"

                  @update:model-value="onInputChange"
                />
              </div>
            </q-field>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="app-modal-footer">
        <!-- Save -->
        <q-btn
          no-caps
          unelevated

          type="submit"
          color="primary"
          label="Save Webhook"

          :loading="loaders.isSaving"
        />

        <!-- Test Webhook -->
        <q-btn

          flat
          no-caps
          unelevated

          color="primary"
          class="light-primary-btn"

          :label="testWebhookCta"
          :loading="loaders.isTesting"
          :disable="eventTypesLength !== 1"

          @click="onTestWebhook"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, computed, reactive, toRefs, getCurrentInstance, onMounted,
} from 'vue';

// Components
import InputLabel from 'components/Form/InputLabel.vue';

// Utils
import { isSlackWebhookUrl } from 'src/utils/helperFunctions.js';
import { postApiCall, patchApiCall } from 'src/utils/apiRequests.js';

// Constants
import { HTTP_OR_HTTPS_REGEX } from 'src/boot/constants';
import { WEBHOOK_EVENT_TYPE, WEBHOOK_TYPES } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'SaveWebhook',

  emits: ['newWebhookCreated', 'existingWebhookUpdated'],

  components: {
    InputLabel,
  },

  props: {
    editWebhookJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      form: {
        name: '',
        url: '',
        event_types: [],
        webhook_type: WEBHOOK_TYPES.HTTP,
      },

      loaders: {
        isSaving: false,
        isTesting: false,
      },

      // refs
      saveWebhookFormRef: null,
      webhookUrlFormRef: null,
      eventTypesFormRef: null,
    });

    //
    const isNewWebhook = computed(() => isEmpty(props.editWebhookJson));

    const eventTypesLength = computed(() => state.form.event_types.length);

    const testWebhookCta = computed(() => {
      if (state.form.url && eventTypesLength.value !== 1) {
        return 'Select exactly one event type to test';
      }

      return 'Test Webhook';
    });

    const webhookEventTypes = computed(() => Object.values(WEBHOOK_EVENT_TYPE));

    // methods
    const onInputChange = () => {
      state.saveWebhookFormRef.resetValidation();
    };

    const getWebhookPayload = () => {
      const payload = {
        name: state.form.name,
        url: state.form.url,
        event_types: state.form.event_types,
        webhook_type: state.form.webhook_type,
      };

      if (isSlackWebhookUrl(state.form.url)) {
        payload.webhook_type = WEBHOOK_TYPES.SLACK;
      }

      return payload;
    };

    const createNewWebhook = async (payload) => {
      try {
        state.loaders.isSaving = true;

        await postApiCall({
          payload,
          endpoint: '/webhooks',
          includeWorkspace: true,
        });

        emit('newWebhookCreated');

        appContext.config.globalProperties.$toast({
          message: 'Webhook created successfully',
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.isSaving = false;
      }
    };

    const updateExistingWebhook = async (payload) => {
      try {
        state.loaders.isSaving = true;

        await patchApiCall({
          payload,
          endpoint: `/webhooks/${props.editWebhookJson.id}`,
          includeWorkspace: true,
        });

        appContext.config.globalProperties.$toast({
          message: 'Webhook updated successfully',
        });

        emit('existingWebhookUpdated', {
          ...props.editWebhookJson,
          ...payload,
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.isSaving = false;
      }
    };

    const onSaveWebhook = () => {
      const payload = getWebhookPayload();

      if (isNewWebhook.value) {
        createNewWebhook(payload);
      } else {
        updateExistingWebhook(payload);
      }
    };

    const onTestWebhook = async () => {
      try {
        // url and event type check is required.. ignore name
        let isValid = await state.webhookUrlFormRef.validate();
        isValid = isValid && await state.eventTypesFormRef.validate();

        if (isValid) {
          state.loaders.isTesting = true;

          await postApiCall({
            payload: {
              url: state.form.url,
              event_type: state.form.event_types[0],
            },
            includeWorkspace: true,
            endpoint: '/webhooks/test-endpoint',
          });

          // Show a success message when the webhook test is successful
          appContext.config.globalProperties.$toast({
            message: 'Webhook test successful',
          });
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.isTesting = false;
      }
    };

    onMounted(() => {
      if (!isNewWebhook.value) {
        state.form = {
          name: props.editWebhookJson.name,
          url: props.editWebhookJson.url,
          event_types: props.editWebhookJson.event_types,
          webhook_type: props.editWebhookJson.webhook_type,
        };
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isNewWebhook,
      webhookEventTypes,
      eventTypesLength,
      testWebhookCta,

      // methods
      onSaveWebhook,
      onTestWebhook,
      onInputChange,

      // hardcoded
      HTTP_OR_HTTPS_REGEX,
    };
  },
});
</script>

<style lang="scss" scoped>
.save-webhook-card {
  max-width: 600px;

  .app-modal-content {
    width: 100%;

    .webhook-form-group {
      max-width: 500px;
      display: flex;
      flex-direction: column;
      gap: 24px;

      .form-input {
        width: 100%;
        max-width: 460px;
      }
    }

    .event-types-form {
      width: 100%;

      .event-types-list {
        width: 100%;
        border-radius: 8px;
        border: 1px solid $grey-50;

        overflow-y: auto;

        max-height: 300px;

        :deep(.q-field__control) {
          color: $black;

          .q-field__control-container {
            flex-direction: column;
          }
        }

        .event-type-item {
          border-bottom: 1px solid $grey-50;

          .app-checkbox {
            padding: 18px 16px;
          }

          &:last-child {
            border-bottom: none;
          }
        }
      }
    }
  }

  .app-modal-footer {
    gap: 16px;
  }
}
</style>
