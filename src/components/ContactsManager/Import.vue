<template>
  <div class="import-contacts">
    <!-- Discard confirmation popup -->
    <q-dialog
      v-model="showDiscardConfirmationModal"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"

      class="app-modal-dialog"
    >
      <DiscardConfirmation
        @onExit="onExitPage"
      />
    </q-dialog>

    <!-- header -->
    <div class="import-contacts-header">
      <div class="flex no-wrap items-center full-width">
        <h4 class="import-header-text">
          Upload Contacts
        </h4>

        <q-space />

        <div class="import-stepper">
          <StepSummary
            :activeStep="activeStep"
            :completedStepsJson="completedStepsJson"

            @setStep="setStep"
          />
        </div>

        <q-space />

        <!-- Close -->
        <q-btn
          flat
          round
          dense

          color="negative"
          class="app-negative-button"

          @click="onClosePage"
        >
          <LocalSvgIcon
            image="close"
            classes="app-negative-icon"
          />
        </q-btn>
      </div>

      <div class="mobile-import-stepper">
        <StepSummary
          :activeStep="activeStep"
          :completedStepsJson="completedStepsJson"

          @setStep="setStep"
        />
      </div>
    </div>

    <!-- content -->
    <div class="import-contacts-content">
      <UploadFile
        v-if="activeStep === CONTACTS_IMPORT_STEPS.UPLOAD_FILE.step"

        showListMapping
        :csvDataJson="csvDataJson"

        v-model:formChanged="formChanged"

        @onCompleteStep="onCompleteUploadFileStep"
      />

      <MapFields
        v-if="activeStep === CONTACTS_IMPORT_STEPS.MAP_FIELDS.step"

        :csvDataJson="csvDataJson"
        :showButtonLoading="isSaveApiLoading"

        @onCompleteStep="onCompleteMapFieldsStep"
      />
    </div>

    <!-- footer -->
    <div class="import-contacts-footer">
      <!-- Back button -->
      <q-btn
        flat
        no-caps
        unelevated

        label="Back"
        color="primary"
        class="light-primary-btn import-footer-back-btn"

        v-if="activeStep !== CONTACTS_IMPORT_STEPS.UPLOAD_FILE.step"

        @click="setStep(activeStep - 1)"
      />

      <!-- This will be using teleport for moving through all the steps -->
      <div id="importContactsFooter" />
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, getCurrentInstance, onMounted, reactive, toRefs,
} from 'vue';

// router
import { useRouter, onBeforeRouteLeave } from 'vue-router';

// components
import StepSummary from 'components/ContactsManager/StepSummary.vue';
import UploadFile from 'components/ContactsManager/UploadFile.vue';
import MapFields from 'components/ContactsManager/MapFields.vue';
import DiscardConfirmation from 'components/Modals/DiscardConfirmation.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { scrollToTheTop } from 'src/utils/htmlScrollApi.js';
import { normalizeCustomFieldKey } from 'src/utils/csvHelpers.js';
import { postApiCall } from 'src/utils/apiRequests.js';

// constants
import { CONTACTS_IMPORT_STEPS } from 'boot/constants';
import { IGNORE_FIELD, CUSTOM_FIELD, CONTACTS_IMPORT_SOURCE_TYPE } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'ImportContacts',

  emits: ['closeModal', 'onListImported'],

  components: {
    StepSummary,
    UploadFile,
    MapFields,
    DiscardConfirmation,
  },

  props: {
    fromCampaignWorkflow: {
      type: Boolean,
      default: false,
    },
    campaignId: {
      type: [String, Number],
      default: null,
    },
  },

  setup(props, { emit }) {
    // router
    const $router = useRouter();

    // app context
    const { appContext } = getCurrentInstance();

    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      activeStep: 1,
      formChanged: false,
      completedStepsJson: {},

      previousRoutePath: '',

      isSaveApiLoading: false,

      csvDataJson: {},

      leaveRoutePath: '',
      showDiscardConfirmationModal: false,
    });

    // methods
    const onExitPage = () => {
      state.formChanged = false;
      state.showDiscardConfirmationModal = false;

      if (props.fromCampaignWorkflow) {
        emit('closeModal');
        return;
      }

      $router.push({ path: state.leaveRoutePath });
    };

    const onClosePage = () => {
      if (state.formChanged) {
        state.leaveRoutePath = state.previousRoutePath;

        state.showDiscardConfirmationModal = true;
      } else {
        if (props.fromCampaignWorkflow) {
          emit('closeModal');
          return;
        }

        // No changes, go back to previous route
        $router.push({ path: state.previousRoutePath });
      }
    };

    const setStep = (stepNumber) => {
      state.activeStep = stepNumber;

      // time out is required for the scroll
      setTimeout(() => {
        scrollToTheTop();
      }, 750);
    };

    const setCompletedSteps = (completedStepValue) => {
      state.completedStepsJson = {
        ...state.completedStepsJson,
        [completedStepValue]: true,
      };
    };

    const onCompleteUploadFileStep = (inputJson) => {
      state.formChanged = true;
      state.csvDataJson = { ...inputJson };

      setCompletedSteps(CONTACTS_IMPORT_STEPS.UPLOAD_FILE.value);

      setStep(CONTACTS_IMPORT_STEPS.MAP_FIELDS.step);
    };

    const addListToSequence = async () => {
      try {
        state.isSaveApiLoading = true;

        const payload = {
          list_ids: [state.csvDataJson.listId],
        };

        await postApiCall({
          payload,
          includeWorkspace: true,
          endpoint: `/sequences/${props.campaignId}/lists`,
        });

        emit('onListImported');
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to add list to the campaign. Please try again.',
        });
      } finally {
        state.isSaveApiLoading = false;
      }
    };

    const importContacts = async (transformedContacts) => {
      try {
        state.isSaveApiLoading = true;

        // payload for the API call
        const payload = {
          contacts: transformedContacts,
          merge_strategy: state.csvDataJson.mergeStrategy,
          source: CONTACTS_IMPORT_SOURCE_TYPE.CSV_UPLOAD,
          source_file_name: state.csvDataJson.fileName,
        };

        await postApiCall({
          endpoint: `lists/${state.csvDataJson.listId}/import`,
          payload,
          includeWorkspace: true,
        });

        state.formChanged = false;

        if (props.fromCampaignWorkflow) {
          // add list to the sequence
          addListToSequence();
        } else {
          // move to the contacts page after successful import
          $router.push(`/outreach/lists/view/${state.csvDataJson.listId}/list-contacts`);
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to import contacts. Please try again.',
        });
      } finally {
        state.isSaveApiLoading = false;
      }
    };

    const onCompleteMapFieldsStep = ({ mappedCsvHeaders }) => {
      const transformedContacts = state.csvDataJson.csvData.map((row) => {
        const contact = {
          custom_fields: {},
        };

        Object.entries(row).forEach(([csvHeader, value], index) => {
          const mappedField = mappedCsvHeaders[index];

          // Ignore this column
          if (mappedField === IGNORE_FIELD.value) {
            return;
          }

          // Skip empty values
          if (value === '' || value == null) {
            return;
          }

          // Custom field
          if (mappedField === CUSTOM_FIELD.value) {
            const normalizedKey = normalizeCustomFieldKey(csvHeader);
            contact.custom_fields[normalizedKey] = value;
            return;
          }

          // System field
          contact[mappedField] = value;
        });

        if (!Object.keys(contact.custom_fields).length) {
          delete contact.custom_fields;
        }

        return contact;
      });

      importContacts(transformedContacts);
    };

    const onComponentMounted = async () => {
      const defaultPath = '/outreach/contacts/all';
      state.previousRoutePath = $router?.options?.history?.state?.back || defaultPath;
    };

    onMounted(() => {
      onComponentMounted();
    });

    // Hook to prevent route change if unsaved changes exist
    onBeforeRouteLeave((to, from, next) => {
      if (state.formChanged) {
        state.leaveRoutePath = to.fullPath;
        state.showDiscardConfirmationModal = true;
      } else {
        // No changes, allow route change
        next();
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,

      // methods
      setStep,
      onExitPage,
      onClosePage,
      onCompleteUploadFileStep,
      onCompleteMapFieldsStep,

      // constants
      CONTACTS_IMPORT_STEPS,
    };
  },
});
</script>

<style lang="scss" scoped>
.import-contacts {
  width: 100%;
  display: flex;
  flex-direction: column;

  .import-contacts-header, .import-contacts-footer {
    width: 100%;
    position: sticky;
    z-index: 1;
    background: $white;
  }

  .import-contacts-header {
    top: 0px;
    padding: 16px 20px;
    border-bottom: 1px solid $grey-50;

    display: flex;
    align-items: center;

    .import-header-text {
      color: $black;
      font-size: 18px;
      font-weight: 600;
    }

    .import-stepper {
      display: flex;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        display: none;
      }
    }

    .mobile-import-stepper {
      display: none;
      margin-top: 10px;
    }

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      flex-direction: column;
      align-items: unset;

      height: fit-content;
      padding: 16px 12px;

      .mobile-import-stepper {
        display: flex;
      }

      .import-stepper {
        display: none;
      }
    }
  }

  .import-contacts-footer {
    bottom: 0px;
    padding: 16px 20px;
    border-top: 1px solid $grey-50;

    display: flex;
    align-items: center;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }

    .import-footer-back-btn {
      margin-right: 12px;
    }
  }

  .import-contacts-content {
    flex: 1;
    overflow-y: auto;

    // include custom scrollbar
    @include custom-scrollbar;
  }
}
</style>
