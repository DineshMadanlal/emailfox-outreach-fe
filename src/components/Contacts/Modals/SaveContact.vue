<template>
  <q-card flat class="app-modal-card save-contact-card">
    <!-- Create Field Dialog -->
    <q-dialog
      v-model="modals.showCreateFieldModal"
      class="app-modal-dialog"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <CreateField
        @onFieldCreated="onFieldCreated"
      />
    </q-dialog>

    <!-- Paste Contact JSON Dialog -->
    <q-dialog
      v-model="modals.showPasteJsonModal"
      class="app-modal-dialog"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <PasteContactJson
        @onApplyJson="onApplyJson"
      />
    </q-dialog>

    <q-form
      class="full-width save-contact-form custom-scrollbar"
      ref="addContactFormRef"
      @submit.prevent.stop="onSaveContact"
    >
      <!-- Header -->
      <div class="app-modal-header">
        <h4 class="modal-header-text">
          {{ isEditMode ? 'Edit Contact' : 'Add Contact' }}
        </h4>

        <q-space />

        <!-- Close button -->
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
        <!-- AI / JSON Banner Card -->
        <div
          v-if="toggles.showAiJsonBanner && !isEditMode"
          class="full-width json-autofill-banner"
        >
          <!--  -->
          <div class="banner-text-content">
            <h6 class="banner-title">
              Have AI-generated contact details or raw JSON?
            </h6>
            <p class="banner-subtitle">
              Automatically populate all fields instantly by parsing clipboard data.
            </p>
          </div>

          <!-- Actions -->
          <div class="banner-actions">
            <q-btn
              outline
              no-caps
              dense
              color="primary"
              class="autofill-btn"
              label="Autofill via JSON"
              @click="modals.showPasteJsonModal = true"
            />

            <q-btn
              flat
              round
              dense
              size="sm"

              color="negative"
              class="app-negative-button"

              @click="toggles.showAiJsonBanner = false"
            >
              <LocalSvgIcon
                image="circle-close"
                classes="app-negative-icon"
              />
            </q-btn>
          </div>
        </div>
        <!-- First Name -->
        <div class="full-width">
          <InputLabel
            isImportant
            label="First Name"
          />

          <q-input
            dense
            outlined
            autofocus
            hide-bottom-space

            v-model="form.first_name"

            class="input-width-maxed"
            placeholder="James"
            lazy-rules="ondemand"
            :rules="[val => !!val && val.trim().length > 0 || 'First name is required']"

            @update:model-value="onInputChange"
          />
        </div>

        <!-- Last Name -->
        <div class="full-width">
          <InputLabel
            label="Last Name"
          />

          <q-input
            dense
            outlined
            hide-bottom-space

            v-model="form.last_name"

            placeholder="Bond"
            class="input-width-maxed"
          />
        </div>

        <!-- Email Address -->
        <div class="full-width">
          <InputLabel
            isImportant
            label="Email Address"
          />

          <q-input
            dense
            outlined
            hide-bottom-space

            v-model="form.email"

            class="input-width-maxed"
            placeholder="eg. email@domain.com"
            lazy-rules="ondemand"
            :disable="form.isRandomEmail"
            :rules="emailRules"

            @update:model-value="onInputChange"
          />

          <!-- Checkbox: Fill a random email address -->
          <div
            v-if="!isEditMode"
            class="q-mt-sm flex items-center"
          >
            <q-checkbox
              dense
              color="primary"
              class="app-checkbox"
              v-model="form.isRandomEmail"
              label="Fill a random email address to this contact."
              @update:model-value="onToggleRandomEmail"
            />
          </div>
        </div>

        <!-- Associate List -->
        <div
          v-if="!isEditMode"
          class="full-width"
        >
          <InputLabel
            :isImportant="isListRequired"
            label="Associate List"
          />

          <SelectList
            :canCreateList="true"
            v-model="form.selectedList"
            placeholderText="Select List"
            class="input-width-maxed"
            lazy-rules="ondemand"
            :rules="listRules"

            @update:model-value="onInputChange"
          />
        </div>

        <!-- Conflict Action / Merge Strategy -->
        <div
          v-if="!isEditMode"
          class="full-width"
        >
          <InputLabel label="Merge Strategy" />

          <SelectContactConflictAction
            v-model="form.merge_strategy"
            placeholderText="Select Conflict Action"
            class="input-width-maxed"
          />
        </div>

        <div class="vertical-spacer" />

        <!-- Accordion 1: Additional Details -->
        <div class="accordion-section">
          <div
            class="accordion-header flex items-center justify-between cursor-pointer"
            @click="toggles.isAdditionalDetailsOpen = !toggles.isAdditionalDetailsOpen"
          >
            <span class="accordion-title">Additional Details</span>

            <LocalSvgIcon
              image="plain-down-arrow"
              :classes="`accordion-chevron ${toggles.isAdditionalDetailsOpen ? 'open' : ''}`"
            />
          </div>

          <!-- Slide Transition -->
          <q-slide-transition>
            <div
              v-show="toggles.isAdditionalDetailsOpen"
              class="accordion-content"
            >
              <!-- Dynamic Additional Text Fields -->
              <div
                v-for="field in additionalFields"
                :key="`additional-field-${field.key}`"
                class="full-width"
              >
                <InputLabel :label="field.label" />

                <q-input
                  dense
                  outlined
                  hide-bottom-space
                  v-model="form[field.key]"
                  class="input-width-maxed"
                  :placeholder="field.placeholder"
                  @update:model-value="onInputChange"
                />
              </div>

              <!-- Timezone -->
              <div class="full-width">
                <InputLabel label="Timezone" />

                <SelectTimezone
                  v-model="form.timezone"
                  placeholderText="Select Timezone"
                  class="input-width-maxed"
                />
              </div>
            </div>
          </q-slide-transition>
        </div>

        <div class="vertical-spacer" />

        <!-- Accordion 2: Custom Fields -->
        <div class="accordion-section">
          <div
            class="accordion-header flex items-center justify-between cursor-pointer"
            @click="toggles.isCustomFieldsOpen = !toggles.isCustomFieldsOpen"
          >
            <span class="accordion-title">Custom Fields</span>

            <LocalSvgIcon
              image="plain-down-arrow"
              :classes="`accordion-chevron ${toggles.isCustomFieldsOpen ? 'open' : ''}`"
            />
          </div>

          <q-slide-transition>
            <div
              v-show="toggles.isCustomFieldsOpen"
              class="accordion-content"
            >
              <!-- Active Custom Field Inputs -->
              <div
                v-for="field in activeCustomFields"
                :key="`custom-field-${field.value}`"
                class="full-width"
              >
                <div class="flex items-center justify-between">
                  <InputLabel :label="field.label" />

                  <q-btn
                    flat
                    round
                    dense

                    size="xs"
                    color="negative"
                    class="app-negative-button"

                    @click="removeCustomField(field.value)"
                  >
                    <LocalSvgIcon image="close" classes="app-negative-icon" />
                  </q-btn>
                </div>

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  type="textarea"
                  input-class="form-textarea"

                  v-model="form.custom_fields[field.value]"

                  class="input-width-maxed"
                  :placeholder="`Enter ${field.label}`"
                />
              </div>

              <!-- Add Custom Fields Trigger -->
              <div class="q-mt-sm">
                <q-btn
                  flat
                  no-caps
                  dense

                  color="primary"
                  class="save-custom-fields-btn text-weight-medium"
                >
                  <span class="flex items-center gap-xs">
                    + Add Custom Fields
                  </span>

                  <q-menu
                    v-model="modals.showCustomFieldsMenu"
                    transition-show="jump-down"
                    transition-hide="jump-up"
                  >
                    <CustomFieldsMenu
                      :activeCustomFields="activeCustomFields"

                      @addCustomField="addCustomField"
                      @onCreateNewField="onCreateNewField"
                    />
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </q-slide-transition>
        </div>
      </div>

      <!-- Footer -->
      <div class="app-modal-footer">
        <q-btn
          no-caps
          unelevated

          type="submit"
          :label="isEditMode ? 'Update' : 'Save'"
          color="primary"
          class="save-next-btn"

          :loading="isApiProcessing"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// lodash
import startCase from 'lodash/startCase';
import kebabCase from 'lodash/kebabCase';
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, reactive, toRefs, computed, onMounted, getCurrentInstance, watch,
} from 'vue';

// components
import InputLabel from 'components/Form/InputLabel.vue';
import SelectTimezone from 'components/Dropdown/SelectTimezone.vue';
import SelectList from 'components/Dropdown/SelectList.vue';
import SelectContactConflictAction from 'components/Dropdown/SelectContactConflictAction.vue';
import CustomFieldsMenu from 'components/Menu/CustomFieldsMenu.vue';
import CreateField from 'src/components/Contacts/Modals/CreateField.vue';
import PasteContactJson from 'src/components/Contacts/Modals/PasteContactJson.vue';

// stores
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';
import { useWorkspace } from 'src/composables/useWorkspace';

// utils
import { postApiCall, putApiCall } from 'src/utils/apiRequests';

// constants
import { EMAIL_REGEX } from 'src/boot/constants';
import {
  CONTACTS_IMPORT_SOURCE_TYPE,
  CONTACT_IMPORT_CONFLICT_ACTION,
} from 'boot/campaign-constants';

const ADDITIONAL_FIELDS = [
  { key: 'phone', label: 'Phone', placeholder: 'e.g., +1 234 567 8900' },
  { key: 'job_title', label: 'Job Title', placeholder: 'e.g., Senior Developer' },
  { key: 'company_name', label: 'Company Name', placeholder: 'e.g., Acme Corp' },
  { key: 'linkedin_url', label: 'LinkedIn Profile URL', placeholder: 'e.g., https://linkedin.com/in/username' },
  { key: 'city', label: 'City', placeholder: 'e.g., San Francisco' },
  { key: 'state', label: 'State / Province', placeholder: 'e.g., California' },
  { key: 'country', label: 'Country', placeholder: 'e.g., United States' },
];

const CONTACT_FIELD_KEYS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'job_title',
  'company_name',
  'linkedin_url',
  'city',
  'state',
  'country',
  'timezone',
];

const JSON_FIELD_MAP = {
  first_name: ['first_name', 'firstName', 'name'],
  last_name: ['last_name', 'lastName'],
  email: ['email'],
  phone: ['phone', 'phoneNumber', 'phone_number'],
  job_title: ['job_title', 'jobTitle', 'title'],
  company_name: ['company_name', 'companyName', 'company'],
  linkedin_url: ['linkedin_url', 'linkedinUrl', 'linkedin'],
  city: ['city'],
  state: ['state'],
  country: ['country'],
};

const getDefaultForm = (listId = null) => ({
  first_name: '',
  last_name: '',
  email: '',
  isRandomEmail: false,
  phone: '',
  job_title: '',
  company_name: '',
  linkedin_url: '',
  city: '',
  state: '',
  country: '',
  timezone: '',
  selectedList: listId ? { id: listId } : null,
  merge_strategy: CONTACT_IMPORT_CONFLICT_ACTION.SKIP.value,
  custom_fields: {},
});

export default defineComponent({
  name: 'SaveContactModal',

  emits: ['onSuccessfulAddContact', 'onSuccessfulUpdateContact'],

  components: {
    InputLabel,
    SelectTimezone,
    SelectList,
    SelectContactConflictAction,
    CustomFieldsMenu,
    CreateField,
    PasteContactJson,
  },

  props: {
    listId: {
      type: [String, Number],
      default: null,
    },
    contactJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // stores
    const userStore = useUserPreferencesStore();

    // composables
    const { isMobileDevice } = useAppHelpersApi();
    const { getWorkspaceCustomFields } = useWorkspace();

    // state
    const state = reactive({
      form: getDefaultForm(props.listId),

      toggles: {
        showAiJsonBanner: true,
        isCustomFieldsOpen: false,
        isAdditionalDetailsOpen: false,
      },

      modals: {
        showCustomFieldsMenu: false,
        showCreateFieldModal: false,
        showPasteJsonModal: false,
      },

      // Custom fields selection UI
      activeCustomFields: [],

      isApiProcessing: false,
      addContactFormRef: null,
    });

    // computed
    const contactData = computed(() => props.contactJson);

    const isEditMode = computed(() => !isEmpty(contactData.value) && !!contactData.value.id);

    const emailRules = computed(() => {
      if (state.form.isRandomEmail) return [];
      return [
        (val) => !!val || 'Email is required',
        (val) => EMAIL_REGEX.test(val) || 'Please enter a valid email address',
      ];
    });

    const isListRequired = computed(() => !props.listId && !isEditMode.value);

    const listRules = computed(() => {
      if (props.listId || isEditMode.value) return [];
      return [
        (val) => !!val?.id || 'Associate list is required',
      ];
    });

    // methods
    const onInputChange = () => {
      if (state.addContactFormRef) {
        state.addContactFormRef.resetValidation();
      }
    };

    const generateRandomEmail = () => {
      const listId = props.listId || state.form.selectedList?.id || 'manual';
      const timestamp = Date.now().toString(36);
      const randomStr = Math.random().toString(36).substring(2, 8);
      return `missing_${listId}_${timestamp}_${randomStr}@example.com`;
    };

    const onToggleRandomEmail = (val) => {
      if (val) {
        state.form.email = generateRandomEmail();
      } else {
        state.form.email = '';
      }
      onInputChange();
    };

    const addCustomField = (field) => {
      state.modals.showCustomFieldsMenu = false;

      if (!state.activeCustomFields.some((f) => f.value === field.value)) {
        state.activeCustomFields.push(field);
        state.form.custom_fields[field.value] = '';
      }
    };

    const removeCustomField = (fieldValue) => {
      state.activeCustomFields = state.activeCustomFields.filter((f) => f.value !== fieldValue);
      delete state.form.custom_fields[fieldValue];
    };

    const onFieldCreated = (newField) => {
      state.modals.showCreateFieldModal = false;
      addCustomField(newField);
    };

    const onCreateNewField = (searchTerm = '') => {
      state.modals.showCustomFieldsMenu = false;

      if (searchTerm) {
        onFieldCreated({
          label: startCase(searchTerm),
          value: kebabCase(searchTerm).replace(/-/g, '_'),
        });
      } else {
        state.modals.showCreateFieldModal = true;
      }
    };

    const onApplyJson = (jsonObj = {}) => {
      Object.keys(JSON_FIELD_MAP).forEach((targetKey) => {
        const keys = JSON_FIELD_MAP[targetKey];
        const matchedKey = keys.find((k) => jsonObj[k] !== undefined && jsonObj[k] !== null);
        if (matchedKey) {
          state.form[targetKey] = String(jsonObj[matchedKey]);
        }
      });

      const customObj = jsonObj.custom_fields || {};
      Object.keys(customObj).forEach((key) => {
        const value = customObj[key];
        const formattedKey = kebabCase(key).replace(/-/g, '_');
        const label = startCase(key);

        addCustomField({
          label,
          value: formattedKey,
        });
        state.form.custom_fields[formattedKey] = String(value);
      });

      state.toggles.isAdditionalDetailsOpen = true;
      if (Object.keys(customObj).length > 0) {
        state.toggles.isCustomFieldsOpen = true;
      }

      state.modals.showPasteJsonModal = false;

      appContext.config.globalProperties.$toast({
        message: 'Contact fields populated from JSON',
      });
    };

    const resetForm = () => {
      Object.assign(state.form, getDefaultForm(props.listId));
      state.activeCustomFields = [];
      onInputChange();
    };

    const populateFormFromContact = () => {
      const c = contactData.value;
      if (!c || !c.id) return;

      CONTACT_FIELD_KEYS.forEach((key) => {
        state.form[key] = c[key] || '';
      });

      const custom = {};
      Object.keys(c.custom_fields || {}).forEach((key) => {
        custom[key] = c.custom_fields[key] !== null && c.custom_fields[key] !== undefined
          ? String(c.custom_fields[key])
          : '';
      });
      state.form.custom_fields = custom;

      const customKeys = Object.keys(custom);
      if (customKeys.length > 0) {
        state.toggles.isCustomFieldsOpen = true;

        const customFieldsList = userStore.workspaceCustomFields || [];
        state.activeCustomFields = customKeys.map((key) => {
          const matched = customFieldsList.find((f) => f.value === key);
          return {
            value: key,
            label: matched?.label || startCase(key),
          };
        });
      }

      if (ADDITIONAL_FIELDS.some((field) => Boolean(c[field.key])) || Boolean(c.timezone)) {
        state.toggles.isAdditionalDetailsOpen = true;
      }
    };

    watch(
      () => props.contactJson,
      () => {
        if (isEditMode.value) {
          populateFormFromContact();
        }
      },
      { immediate: true, deep: true },
    );

    const getContactPayload = () => {
      const contactPayload = {
        custom_fields: { ...state.form.custom_fields },
      };

      CONTACT_FIELD_KEYS.forEach((key) => {
        if (key !== 'timezone') {
          contactPayload[key] = state.form[key]?.trim?.() || state.form[key] || '';
        }
      });

      return contactPayload;
    };

    const onSaveContact = async () => {
      try {
        const isValid = await state.addContactFormRef.validate();
        if (!isValid) return;

        state.isApiProcessing = true;
        const contactPayload = getContactPayload();

        if (isEditMode.value) {
          const payload = { ...contactPayload };

          const response = await putApiCall({
            endpoint: `/contacts/${contactData.value.id}`,
            includeWorkspace: true,
            payload,
          });

          //
          appContext.config.globalProperties.$toast({
            message: response?.message || 'Contact updated successfully',
          });

          emit('onSuccessfulUpdateContact', {
            ...contactData.value,
            ...payload,
            id: contactData.value.id,
          });
        } else {
          const targetListId = props.listId || state.form.selectedList?.id;

          const payload = {
            source: CONTACTS_IMPORT_SOURCE_TYPE.MANUAL,
            source_file_name: 'Manual Entry',
            merge_strategy: state.form.merge_strategy || CONTACT_IMPORT_CONFLICT_ACTION.SKIP.value,
            allow_missing_emails: true,
            contacts: [contactPayload],
          };

          await postApiCall({
            payload,
            includeWorkspace: true,
            endpoint: `/lists/${targetListId}/import`,
          });

          appContext.config.globalProperties.$toast({
            message: 'Contact added successfully',
          });

          emit('onSuccessfulAddContact');
          resetForm();
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || `Failed to ${isEditMode.value ? 'update' : 'add'} contact. Please try again.`,
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    onMounted(async () => {
      // get custom fields for the workspace
      await getWorkspaceCustomFields();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isEditMode,
      emailRules,
      listRules,
      isListRequired,
      isMobileDevice,

      // constants / fields
      additionalFields: ADDITIONAL_FIELDS,

      // methods
      onInputChange,
      onFieldCreated,
      onCreateNewField,
      onApplyJson,
      onSaveContact,
      addCustomField,
      removeCustomField,
      onToggleRandomEmail,
    };
  },
});
</script>

<style lang="scss" scoped>
.save-contact-card {
  max-width: 600px;
  position: relative;

  // sm min
  @media (min-width: $breakpoint-sm-min) {
    width: 600px;
    min-height: 100%;

    display: flex;
    flex-direction: column;
  }

  @media (min-width: 601px) {
    border-radius: 8px 0px 0px 8px !important;
  }

  @media (min-width: 601px) and (max-width: 640px) {
    // For medium screens, we can set a specific width or use a percentage
    width: calc(100vw - 32px);
  }

  .save-contact-form {
    flex: 1;
    width: 100%;
    display: flex;
    flex-direction: column;

    min-height: 100%;
  }

  .app-modal-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px 24px;
    overflow-y: auto;

    .json-autofill-banner {
      background: rgb(var(--primary-rgb), 0.05);
      border: 1px solid $grey-50;
      border-radius: 12px;
      padding: 14px 16px;
      display: flex;
      justify-content: space-between;
      flex-wrap: nowrap;
      gap: 16px;

      // text content
      .banner-text-content {
        flex: 1;
        min-width: 0;

        .banner-title {
          font-size: 13px;
          color: $black;
          font-weight: 500;
        }

        .banner-subtitle {
          font-size: 12px;
          color: rgba(var(--black-rgb), 0.7);

          margin-top: 2px;
        }
      }

      .banner-actions {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 8px;

        .autofill-btn {
          border-radius: 8px;
          padding: 4px 12px;
          border-color: $primary;
          color: $primary;
          font-size: 13px;
          white-space: nowrap;
        }
      }
    }

    .input-width-maxed {
      width: 100%;

      :deep(.form-textarea) {
        resize: none;
        min-height: 40px;
        max-height: 100px;
      }
    }

    .vertical-spacer {
      border-top: 1px solid $grey-50;
      height: 1px;
      margin: 8px 0px;
    }

    .accordion-section {
      width: 100%;

      .accordion-header {
        padding: 4px 0;
        user-select: none;

        .accordion-title {
          font-size: 16px;
          font-weight: 600;
          color: $black;
        }

        :deep(.accordion-chevron) {
          transition: transform 0.2s ease;
          width: 14px;
          height: 14px;

          &.open {
            transform: rotate(180deg);
          }
        }
      }

      .accordion-content {
        display: grid;
        grid-row-gap: 16px;
        padding-top: 16px;
      }
    }

    .save-custom-fields-btn {
      padding: 0;
      font-size: 14px;
    }
  }

  .app-modal-footer {
    display: flex;
    justify-content: flex-start;
    padding: 16px 24px 20px 24px;
    border-top: 1px solid $grey-50;

    .save-next-btn {
      min-width: 110px;
    }
  }
}
</style>
