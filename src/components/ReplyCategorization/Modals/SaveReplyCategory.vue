<template>
  <q-card flat class="save-reply-category-card app-modal-card">
    <q-form
      class="full-width"
      ref="saveReplyCategoryFormRef"

      @submit.prevent.stop="onSaveReplyCategory"
    >
      <!-- Header -->
      <div class="app-modal-header">
        <!--  -->
        <h4 class="modal-header-text">
          {{ isNewReplyCategory ? 'Add' : 'Edit' }} Reply Category
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
        <div class="reply-category-form-group">
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
              :autofocus="isNewReplyCategory"

              v-model="form.name"

              lazy-rules="ondemand"
              placeholder="Eg. Support, Sales, Marketing"

              :maxlength="100"
              :rules="[
                val => !!val || 'Name is required',
                val => (val && val.length <= 100) || 'Name must not exceed 100 characters'
              ]"

              @update:model-value="onInputChange"

              class="form-input"
            />
          </div>

          <!-- Sentiment -->
          <div class="full-width">
            <InputLabel
              isImportant
              label="Sentiment"
            />

            <SelectReplySentiment
              v-model="form.sentiment"
              @update:model-value="onInputChange"

              class="form-input"
            />
          </div>

          <!-- Description -->
          <div class="full-width">
            <InputLabel
              label="Description"
            />

            <!-- textarea -->
            <q-input
              dense
              outlined
              no-error-icon
              hide-bottom-space

              v-model="form.description"

              type="textarea"
              lazy-rules="ondemand"
              placeholder="Eg. For all support related replies"

              :maxlength="255"
              :rules="[
                val => (val.length <= 255) || 'Description must not exceed 255 characters'
              ]"

              @update:model-value="onInputChange"

              class="form-input custom-scrollbar"
              input-class="form-textarea"
            />
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
          label="Save Reply Category"

          :loading="loaders.isSaving"
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
import SelectReplySentiment from 'components/Dropdown/SelectReplySentiment.vue';

// Utils
import { postApiCall, patchApiCall } from 'src/utils/apiRequests.js';

// Constants
import { REPLY_SENTIMENT } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'SaveReplyCategory',

  emits: ['newReplyCategoryCreated', 'existingReplyCategoryUpdated'],

  components: {
    InputLabel,
    SelectReplySentiment,
  },

  props: {
    editReplyCategoryJson: {
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
        description: '',
        sentiment: REPLY_SENTIMENT.Positive.value,
      },

      loaders: {
        isSaving: false,
        isTesting: false,
      },

      // refs
      saveReplyCategoryFormRef: null,
    });

    //
    const isNewReplyCategory = computed(() => isEmpty(props.editReplyCategoryJson));

    // methods
    const onInputChange = () => {
      state.saveReplyCategoryFormRef.resetValidation();
    };

    const getReplyCategoryPayload = () => {
      const payload = {
        name: state.form.name,
        sentiment: state.form.sentiment,
        description: state.form.description,
      };

      return payload;
    };

    const createNewReplyCategory = async (payload) => {
      try {
        state.loaders.isSaving = true;

        await postApiCall({
          payload,
          endpoint: '/reply-categories',
          includeWorkspace: true,
        });

        emit('newReplyCategoryCreated');

        appContext.config.globalProperties.$toast({
          message: 'Reply category created successfully',
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

    const updateExistingReplyCategory = async (payload) => {
      try {
        state.loaders.isSaving = true;

        await patchApiCall({
          payload,
          endpoint: `/reply-categories/${props.editReplyCategoryJson.id}`,
          includeWorkspace: true,
        });

        appContext.config.globalProperties.$toast({
          message: 'Reply category updated successfully',
        });

        emit('existingReplyCategoryUpdated', {
          ...props.editReplyCategoryJson,
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

    const onSaveReplyCategory = () => {
      const payload = getReplyCategoryPayload();

      if (isNewReplyCategory.value) {
        createNewReplyCategory(payload);
      } else {
        updateExistingReplyCategory(payload);
      }
    };

    onMounted(() => {
      if (!isNewReplyCategory.value) {
        state.form = {
          name: props.editReplyCategoryJson.name,
          description: props.editReplyCategoryJson.description,
          sentiment: props.editReplyCategoryJson.sentiment,
        };
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isNewReplyCategory,

      // methods
      onInputChange,
      onSaveReplyCategory,
    };
  },
});
</script>

<style lang="scss" scoped>
.save-reply-category-card {
  max-width: 600px;

  .app-modal-content {
    width: 100%;

    .reply-category-form-group {
      max-width: 500px;
      display: flex;
      flex-direction: column;
      gap: 24px;

      .form-input {
        width: 100%;
        max-width: 460px;

        :deep(.form-textarea) {
          resize: none;
          height: 94px;
        }
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
