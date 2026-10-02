<template>
  <q-card flat class="app-modal-card create-field-card">
    <q-form
      class="full-width"
      ref="createFieldFormRef"
      @submit.prevent.stop="onSaveField"
    >
      <!-- header -->
      <div class="app-modal-header">
        <h4 class="modal-header-text">
          Create Custom Field
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

      <!-- content -->
      <div class="app-modal-content">
        <div class="full-width">
          <InputLabel
            isImportant
            label="Field Name"
          />

          <q-input
            dense
            outlined
            autofocus
            hide-bottom-space

            v-model="fieldName"

            lazy-rules="ondemand"
            class="input-width-maxed"
            placeholder="Eg. Timezone"
            :rules="[val => !!val && val.trim().length > 0 || 'Field name is required']"

            @update:model-value="onInputChange"
          />
        </div>
      </div>

      <!-- footer -->
      <div class="app-modal-footer">
        <q-btn
          no-caps
          unelevated

          type="submit"
          label="Save"
          color="primary"
          class="save-btn"

          :loading="isApiLoading"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// lodash
import kebabCase from 'lodash/kebabCase';

// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance, onMounted,
} from 'vue';

// components
import InputLabel from 'components/Form/InputLabel.vue';

export default defineComponent({
  name: 'CreateFieldModal',

  emits: ['onFieldCreated'],

  components: {
    InputLabel,
  },

  props: {
    prefillFieldName: {
      type: String,
      default: '',
    },
  },

  setup(props, { emit }) {
    const { appContext } = getCurrentInstance();

    const state = reactive({
      fieldName: props.prefillFieldName || '',
      isApiLoading: false,
      createFieldFormRef: null,
    });

    onMounted(() => {
      if (props.prefillFieldName) {
        state.fieldName = props.prefillFieldName;
      }
    });

    const onInputChange = () => {
      if (state.createFieldFormRef) {
        state.createFieldFormRef.resetValidation();
      }
    };

    const onSaveField = async () => {
      try {
        const isValid = await state.createFieldFormRef.validate();
        if (!isValid) return;

        state.isApiLoading = true;

        const trimmedName = state.fieldName.trim();
        const formattedName = kebabCase(trimmedName).replace(/-/g, '_');

        const newField = {
          label: trimmedName,
          value: formattedName,
        };

        emit('onFieldCreated', newField);
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to create field',
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // methods
      onInputChange,
      onSaveField,
    };
  },
});
</script>

<style lang="scss" scoped>
.create-field-card {
  max-width: 500px;
  width: 100%;

  .app-modal-content {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .input-width-maxed {
      width: 100%;
    }
  }

  .app-modal-footer {
    display: flex;
    justify-content: flex-start;
    padding: 16px 24px 24px 24px;

    .save-btn {
      min-width: 80px;
    }
  }
}
</style>
