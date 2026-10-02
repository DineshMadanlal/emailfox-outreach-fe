<template>
  <q-card flat class="app-modal-card add-contact-card">
    <q-form
      class="full-width add-contact-form custom-scrollbar"
      ref="addContactFormRef"
      @submit.prevent.stop="onSaveContact"
    >
      <!-- Header -->
      <div class="app-modal-header">
        <h4 class="modal-header-text">
          Add Contact
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
          <div class="q-mt-sm flex items-center">
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
        <div class="full-width">
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
        <div class="full-width">
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
            <div v-show="toggles.isAdditionalDetailsOpen"
            class="accordion-content"
          >
              <!-- LinkedIn URL -->
              <div class="full-width">
                <InputLabel label="LinkedIn URL" />

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  v-model="form.linkedin_url"

                  class="input-width-maxed"
                  placeholder="www.linkedin.com/username"
                />
              </div>

              <!-- Job Title -->
              <div class="full-width">
                <InputLabel label="Job Title" />

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  v-model="form.job_title"

                  class="input-width-maxed"
                  placeholder="Software Engineer"
                />
              </div>

              <!-- Company Name -->
              <div class="full-width">
                <InputLabel label="Company Name" />

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  v-model="form.company_name"

                  class="input-width-maxed"
                  placeholder="Acme Corp"
                />
              </div>

              <!-- Phone Number -->
              <div class="full-width">
                <InputLabel label="Phone Number" />

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  v-model="form.phone"

                  class="input-width-maxed"
                  placeholder="+1 202 555 xxxx"
                />
              </div>

              <!-- City -->
              <div class="full-width">
                <InputLabel label="City" />

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  v-model="form.city"

                  class="input-width-maxed"
                  placeholder="New York"
                />
              </div>

              <!-- State -->
              <div class="full-width">
                <InputLabel label="State" />

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  v-model="form.state"

                  class="input-width-maxed"
                  placeholder="NY"
                />
              </div>

              <!-- Country -->
              <div class="full-width">
                <InputLabel label="Country" />

                <q-input
                  dense
                  outlined
                  hide-bottom-space

                  v-model="form.country"

                  class="input-width-maxed"
                  placeholder="United States"
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
                  class="add-custom-fields-btn text-weight-medium"
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
          label="Save"
          color="primary"
          class="save-next-btn"

          :loading="isApiProcessing"
        />
      </div>
    </q-form>

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
  </q-card>
</template>

<script>
import {
  defineComponent, reactive, toRefs, computed, onMounted, getCurrentInstance,
} from 'vue';

// components
import InputLabel from 'components/Form/InputLabel.vue';
import SelectTimezone from 'components/Dropdown/SelectTimezone.vue';
import SelectList from 'components/Dropdown/SelectList.vue';
import SelectContactConflictAction from 'components/Dropdown/SelectContactConflictAction.vue';
import CustomFieldsMenu from 'components/Menu/CustomFieldsMenu.vue';
import CreateField from 'src/components/Contacts/Modals/CreateField.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';
import { useWorkspace } from 'src/composables/useWorkspace';

// utils
import { postApiCall } from 'src/utils/apiRequests';

// constants
import { EMAIL_REGEX } from 'src/boot/constants';
import { CONTACTS_IMPORT_SOURCE_TYPE, CONTACT_IMPORT_CONFLICT_ACTION } from 'boot/campaign-constants';

export default defineComponent({
  name: 'AddContactModal',

  emits: ['onSuccessfulAddContact'],

  components: {
    InputLabel,
    SelectTimezone,
    SelectList,
    SelectContactConflictAction,
    CustomFieldsMenu,
    CreateField,
  },

  props: {
    listId: {
      type: [String, Number],
      default: null,
    },
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // composables
    const { isMobileDevice } = useAppHelpersApi();
    const { getWorkspaceCustomFields } = useWorkspace();

    // state
    const state = reactive({
      form: {
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
        selectedList: null,
        merge_strategy: CONTACT_IMPORT_CONFLICT_ACTION.SKIP.value,
        custom_fields: {},
      },

      toggles: {
        isCustomFieldsOpen: false,
        isAdditionalDetailsOpen: false,
      },

      modals: {
        showCustomFieldsMenu: false,
        showCreateFieldModal: false,
      },

      // Custom fields selection UI
      activeCustomFields: [],

      isApiProcessing: false,
      addContactFormRef: null,
    });

    // computed
    const emailRules = computed(() => {
      if (state.form.isRandomEmail) return [];
      return [
        (val) => !!val || 'Email is required',
        (val) => EMAIL_REGEX.test(val) || 'Please enter a valid email address',
      ];
    });

    const isListRequired = computed(() => !props.listId);

    const listRules = computed(() => {
      if (props.listId) return [];
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
      return `missing_${listId}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}@example.com`;
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
        onFieldCreated();
      } else {
        state.modals.showCreateFieldModal = true;
      }
    };

    const resetForm = () => {
      state.form.first_name = '';
      state.form.last_name = '';
      state.form.email = '';
      state.form.isRandomEmail = false;
      state.form.phone = '';
      state.form.job_title = '';
      state.form.company_name = '';
      state.form.linkedin_url = '';
      state.form.city = '';
      state.form.state = '';
      state.form.country = '';
      state.form.timezone = '';
      state.form.custom_fields = {};
      state.activeCustomFields = [];

      if (state.addContactFormRef) {
        state.addContactFormRef.resetValidation();
      }
    };

    const onSaveContact = async () => {
      try {
        const isValid = await state.addContactFormRef.validate();
        if (!isValid) return;

        state.isApiProcessing = true;

        const targetListId = props.listId || state.form.selectedList?.id;

        const payload = {
          source: CONTACTS_IMPORT_SOURCE_TYPE.MANUAL,
          source_file_name: 'Manual Entry',
          merge_strategy: state.form.merge_strategy || CONTACT_IMPORT_CONFLICT_ACTION.SKIP.value,
          allow_missing_emails: true,
          contacts: [
            {
              email: state.form.email,
              first_name: state.form.first_name,
              last_name: state.form.last_name,
              phone: state.form.phone,
              job_title: state.form.job_title,
              company_name: state.form.company_name,
              linkedin_url: state.form.linkedin_url,
              city: state.form.city,
              state: state.form.state,
              country: state.form.country,
              custom_fields: state.form.custom_fields,
            },
          ],
        };

        const endpoint = targetListId
          ? `/lists/${targetListId}/import`
          : '/contacts/import';

        await postApiCall({
          endpoint,
          includeWorkspace: true,
          payload,
        });

        appContext.config.globalProperties.$toast({
          message: 'Contact added successfully',
        });

        emit('onSuccessfulAddContact');
        resetForm();
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to add contact. Please try again.',
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    onMounted(() => {
      // get custom fields for the workspace
      getWorkspaceCustomFields();

      if (props.listId) {
        state.form.selectedList = { id: props.listId };
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      emailRules,
      listRules,
      isListRequired,
      isMobileDevice,

      // methods
      onInputChange,
      onFieldCreated,
      onCreateNewField,
      onSaveContact,
      addCustomField,
      removeCustomField,
      onToggleRandomEmail,
    };
  },
});
</script>

<style lang="scss" scoped>
.add-contact-card {
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

  .add-contact-form {
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

    .add-custom-fields-btn {
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
