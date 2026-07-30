<template>
  <q-card flat class="app-modal-card save-script-card">
    <q-form
      class="full-width"
      ref="saveScriptFormRef"

      @submit.prevent.stop="onSubmitForm"
    >
      <!-- header -->
      <div class="app-modal-header">
        <h4 class="modal-header-text">
          {{ isNewScript ? 'New' : 'Edit' }} Script
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
        <!-- Name -->
        <div class="full-width">
          <InputLabel
            isImportant
            label="Script Name"
          />

          <q-input
            dense
            outlined
            autofocus
            hide-bottom-space

            v-model="name"

            class="input-width-maxed"
            lazy-rules="ondemand"
            placeholder="e.g. Google Analytics"
            :rules="[val => !!val || 'Script Name is required']"

            @update:model-value="onInputChange"
          />
        </div>

        <!-- Placement -->
        <div class="full-width">
          <InputLabel
            isImportant
            label="Placement"
            tooltip="Choose whether this script should be injected into the <head>
              or before the closing <body> tag. Most analytics tools go in the <head>"
          />

          <q-select
            dense
            outlined
            emit-value
            map-options
            options-dense
            hide-bottom-space

            option-label="label"
            option-value="value"
            class="input-width-maxed"
            dropdown-icon="keyboard_arrow_down"

            v-model="placement"
            :options="SCRIPT_PLACEMENT_OPTIONS"

            lazy-rules="ondemand"
            :rules="[val => !!val || 'Placement is required']"

            @update:model-value="onInputChange"
          />
        </div>

        <!-- Script -->
        <div class="full-width">
          <InputLabel
            isImportant
            label="Enter or Copy & Paste the script*"
          />

          <LineNumberTextarea
            v-model="script"

            placeholder="e.g. <script>console.log('Hello World');</script>"

            lazy-rules="ondemand"
            :rules="[val => !!val || 'Script is required']"

            @update:model-value="onInputChange"
          />
        </div>
      </div>
      <!-- footer -->
      <div class="app-modal-footer">
        <!-- Save Script Button -->
        <q-btn
          no-caps
          unelevated

          label="Save"
          type="submit"
          color="primary"
          :loading="isSaveApiLoading"
        ></q-btn>
      </div>
    </q-form>
  </q-card>
</template>
<script>
// vue
import {
  defineComponent, computed, reactive, toRefs, getCurrentInstance,
  onMounted,
} from 'vue';

// Components
import InputLabel from 'components/Form/InputLabel.vue';
import LineNumberTextarea from 'components/Input/LineNumberTextarea.vue';

// Utils
import { postApiCall } from 'src/utils/apiRequests.js';

// constants
import { SCRIPT_PLACEMENT_OPTIONS, SCRIPT_STATUS } from 'boot/constants.js';

export default defineComponent({
  name: 'SaveScript',

  emits: ['onSuccessSaveScript'],

  components: {
    InputLabel,
    LineNumberTextarea,
  },

  props: {
    editScriptJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      name: '',
      placement: SCRIPT_PLACEMENT_OPTIONS[0].value,
      script: '',

      saveScriptFormRef: null,
      isSaveApiLoading: false,
    });

    // computed
    const scriptId = computed(() => props.editScriptJson?.id || null);
    const isNewScript = computed(() => Object.keys(props.editScriptJson).length === 0);

    // methods
    const onSubmitForm = async () => {
      try {
        state.isSaveApiLoading = true;

        const payload = {
          name: state.name,
          script: state.script,
          placement: state.placement,
        };

        //
        if (scriptId.value) {
          payload.id = scriptId.value;
          payload.status = props.editScriptJson?.status;
        } else {
          payload.status = SCRIPT_STATUS.ACTIVE;
        }

        // API call to save folder
        const response = await postApiCall({
          endpoint: '/partners/custom-scripts',
          payload,
        });

        appContext.config.globalProperties.$toast({
          message: 'Script saved successfully',
        });

        emit('onSuccessSaveScript', response.script);
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error,
        });
      } finally {
        state.isSaveApiLoading = false;
      }
    };

    const onInputChange = () => {
      state.saveScriptFormRef.resetValidation();
    };

    onMounted(() => {
      // If editing an existing script, populate the form fields
      if (!isNewScript.value) {
        state.name = props.editScriptJson.name || '';
        state.placement = props.editScriptJson.placement || SCRIPT_PLACEMENT_OPTIONS[0].value;
        state.script = props.editScriptJson.script || '';
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isNewScript,

      // methods
      onSubmitForm,
      onInputChange,

      // constants
      SCRIPT_PLACEMENT_OPTIONS,
    };
  },
});
</script>

<style lang="scss" scoped>
.save-script-card {
  max-width: 600px;

  .app-modal-content {
    display: grid;
    grid-row-gap: 20px;

    .input-width-maxed {
      max-width: 390px;
    }
  }
}
</style>
