<template>
  <q-card flat class="app-modal-card add-entry-card">
    <q-form
      class="full-width"
      ref="addEntryFormRef"

      @submit.prevent.stop="onSaveEntry"
    >
      <!-- header -->
      <div class="app-modal-header">
        <!--  -->
        <h4 class="modal-header-text">
          Add Email/Domain
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
        <!--  -->
        <div class="full-width">
          <InputLabel
            label="Address Type"
          />

          <div class="q-gutter-md">
            <!-- Domain -->
            <q-radio
              dense

              v-model="entryType"
              :val="SUPPRESSION_LIST_TYPES.DOMAIN.value"
              :label="SUPPRESSION_LIST_TYPES.DOMAIN.label"
            />

            <!-- Email -->
            <q-radio
              dense

              v-model="entryType"
              :val="SUPPRESSION_LIST_TYPES.EMAIL.value"
              :label="SUPPRESSION_LIST_TYPES.EMAIL.label"
            />
          </div>
        </div>

        <!-- Domain Input -->
        <div
          v-if="entryType === SUPPRESSION_LIST_TYPES.DOMAIN.value"
          class="full-width"
        >
          <InputLabel
            label="Domain Name"
          />

          <!-- Input -->
          <q-input
            dense
            outlined
            autofocus
            hide-bottom-space

            v-model="domainInput"

            class="input-width-maxed"
            placeholder="e.g. example.com"
            lazy-rules="ondemand"
            hint="All emails from this domain will be blocked from campaigns"
            :rules="domainRules"

            @update:model-value="onInputChange"
          />
        </div>

        <!-- Email Input -->
        <div
          v-else
          class="full-width"
        >
          <InputLabel
            label="Email Address"
          />

          <!-- Input -->
          <q-input
            dense
            outlined
            autofocus
            hide-bottom-space

            v-model="emailInput"

            class="input-width-maxed"
            placeholder="e.g. john@example.com"
            lazy-rules="ondemand"
            :rules="emailRules"

            @update:model-value="onInputChange"
          />
        </div>
      </div>

      <!-- footer -->
      <div class="app-modal-footer">
        <!-- Save -->
        <q-btn
          no-caps
          unelevated

          label="Save"
          type="submit"
          color="primary"

          :loading="isApiProcessing"
        ></q-btn>
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
import InputLabel from 'components/Form/InputLabel.vue';

// utils
import { postApiCall } from 'src/utils/apiRequests';

// constants
import { DOMAIN_REGEX, EMAIL_REGEX } from 'src/boot/constants';
import { SUPPRESSION_LIST_TYPES, SUPPRESSION_TYPE } from 'boot/campaign-constants';

export default defineComponent({
  name: 'AddEntry',

  emits: ['onSuccessfulAdd'],

  components: {
    InputLabel,
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      entryType: SUPPRESSION_LIST_TYPES.DOMAIN.value,
      domainInput: '',
      emailInput: '',

      // boolean
      isApiProcessing: false,

      // ref
      addEntryFormRef: null,
    });

    // methods
    const onInputChange = () => {
      // reset validation
      state.addEntryFormRef.resetValidation();
    };

    const onSaveEntry = async () => {
      try {
        const isValid = await state.addEntryFormRef.validate();

        if (isValid) {
          state.isApiProcessing = true;

          const payload = {
            value: state.entryType === SUPPRESSION_LIST_TYPES.DOMAIN.value
              ? state.domainInput : state.emailInput,
            reason: 'Blocked by user',
            suppression_type: SUPPRESSION_TYPE.MANUAL_BLOCK.value,
          };

          //
          await postApiCall({
            includeWorkspace: true,
            endpoint: '/global-suppressions',
            payload,
          });

          appContext.config.globalProperties.$toast({
            message: 'Entry added successfully',
          });

          emit('onSuccessfulAdd');
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // methods
      onSaveEntry,
      onInputChange,

      // hardcoded
      SUPPRESSION_LIST_TYPES,

      domainRules: [
        (val) => !!val || 'Domain name is required',
        (val) => DOMAIN_REGEX.test(val) || 'Please enter a valid domain name',
      ],
      emailRules: [
        (val) => !!val || 'Email address is required',
        (val) => EMAIL_REGEX.test(val) || 'Please enter a valid email address',
      ],
    };
  },
});
</script>

<style lang="scss" scoped>
.add-entry-card {
  max-width: 600px;

  .app-modal-content {
    display: flex;
    flex-direction: column;
    gap: 32px;

    .input-width-maxed {
      max-width: 500px;
    }
  }
}
</style>
