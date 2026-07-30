<template>
  <q-card flat class="app-modal-card action-config-card">
    <q-form
      class="full-width"
      ref="actionConfigFormRef"

      @submit.prevent.stop="onSubmitForm"
    >
      <!-- header -->
      <div class="app-modal-header">
        <!--  -->
        <h4 class="modal-header-text">
          {{ config.title({
            count: totalCount,
            word: $pluralize('Mailbox', totalCount),
          }) }}
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
        <!-- Delete -->
        <div
          class="modal-content-container no-max-width"
          v-if="actionType === MAILBOX_ACTIONS.DELETE"
        >
          <p class="delete-warning-text">
            Deleting the {{ $pluralize('Mailbox', totalCount) }} will
            <span class="permanent-delete-text">
              permanently delete
            </span>
            all associated data linked to the email addresses.
            <br />
            <br />
            This action cannot be undone. Are you sure you want to continue?
          </p>

          <q-field
            borderless
            hide-bottom-space
            :model-value="agreeToDeleteMailboxes"
            :rules="[
              (val) => val === true || 'You must confirm to delete',
            ]"
            lazy-rules="ondemand"
          >
            <template v-slot:control>
              <q-checkbox
                class="app-checkbox"
                v-model="agreeToDeleteMailboxes"

                @update:modelValue="onInputChange"

                label="I understand the consequences of deleting the mailbox"
              />
            </template>
          </q-field>
        </div>

        <!-- Disable Warmup -->
        <div
          class="modal-content-container no-max-width"
          v-else-if="actionType === MAILBOX_ACTIONS.DISABLE_WARMUP"
        >
          <q-field
            borderless
            hide-bottom-space
            :model-value="agreeToDisableWarmup"
            :rules="[
              (val) => val === true || 'You must confirm to disable warmup',
            ]"
            lazy-rules="ondemand"
          >
            <template v-slot:control>
              <q-checkbox
                class="app-checkbox"
                v-model="agreeToDisableWarmup"

                @update:modelValue="onInputChange"

                label="Are you sure you want to disable warmup for the selected mailboxes?"
              />
            </template>
          </q-field>
        </div>

        <!-- Set Signature -->
        <div
          class="modal-content-container no-max-width"
          v-else-if="actionType === MAILBOX_ACTIONS.SET_SIGNATURE"
        >
          <SignatureEditor
            showSignatureText
            autofocusEditor
            v-model="signatureHtml"
          />

          <!-- Signature Preview -->
          <SignaturePreview
            :signatureHtml="signatureHtml"
          />
        </div>

        <!-- Remove Signature -->
        <div
          class="modal-content-container no-max-width"
          v-else-if="actionType === MAILBOX_ACTIONS.CLEAR_SIGNATURE"
        >
          <q-field
            borderless
            hide-bottom-space
            :model-value="agreeToRemoveSignature"
            :rules="[
              (val) => val === true || 'You must confirm to clear signature',
            ]"
            lazy-rules="ondemand"
          >
            <template v-slot:control>
              <q-checkbox
                class="app-checkbox"
                v-model="agreeToRemoveSignature"

                @update:modelValue="onInputChange"

                label="Are you sure you want to clear signature for the selected mailboxes?"
              />
            </template>
          </q-field>
        </div>

        <div
          v-else
          class="modal-content-container"
        >
          <!-- Set Daily Send Count -->
          <div
            class="full-width"
            v-if="actionType === MAILBOX_ACTIONS.SET_DAILY_SEND_COUNT"
          >
            <InputLabel
              label="Daily Send Count"
            />

            <!-- Input -->
            <q-input
              dense
              outlined
              autofocus
              hide-bottom-space

              v-model="dailyLimit"

              :min="1"
              :max="50"
              :rules="dailyLimitRules"

              type="number"
              placeholder=""
              lazy-rules="ondemand"

              @update:modelValue="onInputChange"
            />
          </div>

          <!-- Enable Warmup -->
          <div
            class="full-width"
            v-else-if="actionType === MAILBOX_ACTIONS.ENABLE_WARMUP"
          >
            <!--  -->
            <q-dialog
              v-model="showWarmupProfilesModal"
              :class="isMobileDevice
                ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

              :position="isMobileDevice ? 'standard' : 'right'"
              :transition-show="isMobileDevice ? 'slide-up' : ''"
              :transition-hide="isMobileDevice ? 'slide-down' : ''"
            >
              <WarmupProfiles
                @useWarmupProfile="onUpdateMailboxWarmupProfile"
                @newProfileCreated="onNewWarmupProfileCreated"
              />
            </q-dialog>

            <!--  -->
            <q-dialog
              v-model="showSaveWarmupProfileModal"
              :class="isMobileDevice
                ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

              :position="isMobileDevice ? 'standard' : 'right'"
              :transition-show="isMobileDevice ? 'slide-up' : ''"
              :transition-hide="isMobileDevice ? 'slide-down' : ''"
            >
              <SaveWarmupProfile
                readOnly
                :warmupProfileId="warmupProfileId"
                :warmupProfileDetails="selectedWarmupProfileDetails"
              />
            </q-dialog>

            <div class="flex no-wrap items-center q-mb-sm">
              <InputLabel
                noMarginBottom
                label="Warmup Profiles"
              />

              <!-- Manage Profiles -->
              <q-btn
                flat
                dense
                no-caps
                unelevated
                color="primary"
                label="(Manage Profiles)"
                class="manage-profile-btn"

                @click="showWarmupProfilesModal = true"
              />
            </div>

            <div class="flex no-wrap items-center">
              <SelectWarmupProfile
                class="warmup-profiles-dd"
                ref="selectWarmupProfileRef"
                placeholderText="Select warmup profile"

                lazy-rules="ondemand"
                :rules="[ (val) => !!val || 'Warmup profile is required' ]"

                v-model="warmupProfileId"

                v-if="showSelectWarmupProfileDropdown"
              />

              <!-- View Profile -->
              <q-btn
                flat
                dense
                no-caps
                unelevated
                color="primary"
                class="q-ml-sm"

                v-if="warmupProfileId"

                @click="showSaveWarmupProfileModal = true"
              >
                <p class="text-weight-medium">
                  View Details
                </p>
              </q-btn>
            </div>

            <!-- Preview Text -->
            <p
              v-if="selectedWarmupProfilePreviewText"
              class="small-preview-text"
            >
              {{ selectedWarmupProfilePreviewText }}
            </p>
          </div>
        </div>

        <InfoAlertBox
          :alert="config.description"

          v-if="config.description"
        />
      </div>

      <!-- footer -->
      <div class="app-modal-footer">
        <!--  -->
        <q-btn
          no-caps
          unelevated

          :color="config.color"
          :label="config.submitLabel"

          :loading="isApiLoading"

          type="submit"
        />

        <!-- Cancel -->
        <q-btn
          flat
          no-caps
          unelevated
          v-close-popup

          label="Cancel"
          class="q-ml-md"

          :color="config.color"
          :loading="isApiLoading"
          :class="`light-${config.color}-btn`"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, onMounted, defineAsyncComponent, getCurrentInstance,
} from 'vue';

// Components
import InputLabel from 'components/Form/InputLabel.vue';
import InfoAlertBox from 'components/Alerts/InfoAlertBox.vue';

// warmup profile components
import WarmupProfiles from 'components/Warmup/Modals/WarmupProfiles.vue';
import SaveWarmupProfile from 'components/Warmup/Modals/SaveWarmupProfile.vue';
import SelectWarmupProfile from 'components/Dropdown/SelectWarmupProfile.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { convertStringToNumber } from 'src/utils/numbers';
import { bulkUpdateMailboxes, bulkDeleteMailboxes } from 'src/utils/domainMailboxesApi';

// constants
import { WARMUP_STATUS } from 'src/boot/warmup-constants';
import { TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';
import { ACTION_CONFIG, MAILBOX_ACTIONS } from 'src/boot/mailbox-constants';

export default defineComponent({
  name: 'ActionConfig',

  emits: ['onSuccessfulUpdate'],

  components: {
    InputLabel,
    InfoAlertBox,
    WarmupProfiles,
    SaveWarmupProfile,
    SelectWarmupProfile,

    SignatureEditor: defineAsyncComponent(() => import('components/Editor/SignatureEditor.vue')),
    SignaturePreview: defineAsyncComponent(() => import('components/Mailboxes/SignaturePreview.vue')),
  },

  props: {
    filters: {
      type: Object,
      default: () => ({}),
    },
    actionType: {
      type: String,
      default: '',
    },
    selectedMailboxes: {
      type: Array,
      default: () => [],
    },
    multiSelectOptionJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      isApiLoading: false,
      showSelectWarmupProfileDropdown: false,

      //
      dailyLimit: null,

      signatureHtml: '',
      agreeToRemoveSignature: false,

      warmupProfileId: null,
      agreeToDisableWarmup: false,

      agreeToDeleteMailboxes: false,

      // ref
      actionConfigFormRef: null,
      selectWarmupProfileRef: null,

      // modals
      showSaveWarmupProfileModal: false,
      showWarmupProfilesModal: false,
    });

    // computed
    const config = computed(() => ACTION_CONFIG[props.actionType] || {});

    // is all selected
    const isAllSelected = computed(() => props.multiSelectOptionJson?.selectedOption
      === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL);

    // total selected count
    const totalCount = computed(() => {
      const { multiSelectOptionJson, selectedMailboxes } = props;

      if (isAllSelected.value) {
        // return the limit
        return multiSelectOptionJson.limit || 0;
      }

      return selectedMailboxes?.length;
    });

    const selectedWarmupProfileDetails = computed(() => {
      if (state.warmupProfileId) {
        return state.selectWarmupProfileRef?.dropdownOptions.find(
          (profile) => profile.id === state.warmupProfileId,
        );
      }

      return null;
    });

    const selectedWarmupProfilePreviewText = computed(() => {
      if (selectedWarmupProfileDetails.value) {
        const { start_value, max_warmup_value, reply_rate } = selectedWarmupProfileDetails.value;

        return `Starts: ${start_value}/day • Max: ${max_warmup_value}/day • Reply Rate: ${reply_rate}%`;
      }

      return '';
    });

    // methods
    const onInputChange = () => {
      state.actionConfigFormRef?.resetValidation();
    };

    // warmup profile methods
    const updateSelectedWarmupProfileId = (warmupProfileId) => {
      setTimeout(() => {
        state.warmupProfileId = warmupProfileId;

        state.showSelectWarmupProfileDropdown = true;
      }, 200);
    };

    const onUpdateMailboxWarmupProfile = async (warmupProfile) => {
      updateSelectedWarmupProfileId(warmupProfile.id);

      // close modal
      state.showWarmupProfilesModal = false;
    };

    const onNewWarmupProfileCreated = (newWarmupProfile) => {
      state.showSelectWarmupProfileDropdown = false;

      updateSelectedWarmupProfileId(newWarmupProfile.id);
    };

    const getFilterJson = () => {
      const filterJson = {};

      const {
        searchText, provider, warmupStatus, status,
      } = props.filters;

      // search text
      if (searchText) {
        filterJson.search_text = props.filters.searchText;
      }

      // provider
      if (provider) {
        filterJson.provider = provider;
      }

      // warmup status
      if (warmupStatus) {
        filterJson.warmup_enabled = warmupStatus === WARMUP_STATUS.ACTIVE;
      }

      // status
      if (status) {
        filterJson.status = status;
      }

      if (isAllSelected.value) {
        filterJson.select_all = true;
      } else {
        filterJson.mailbox_ids = props.selectedMailboxes.map((mailbox) => mailbox.id);
      }

      return filterJson;
    };

    const getPayloadForBulkUpdate = () => {
      const updateFields = {};

      // daily send limit
      if (props.actionType === MAILBOX_ACTIONS.SET_DAILY_SEND_COUNT) {
        updateFields.sending_limit_per_day = convertStringToNumber(state.dailyLimit);
      }

      // enable warmup
      if (props.actionType === MAILBOX_ACTIONS.ENABLE_WARMUP) {
        updateFields.warmup_profile_id = state.warmupProfileId;
        updateFields.warmup_enabled = true;
      }

      // disable warmup
      if (props.actionType === MAILBOX_ACTIONS.DISABLE_WARMUP) {
        updateFields.warmup_enabled = false;
      }

      // set signature
      if (props.actionType === MAILBOX_ACTIONS.SET_SIGNATURE) {
        updateFields.signature = state.signatureHtml;
      }

      // clear signature
      if (props.actionType === MAILBOX_ACTIONS.CLEAR_SIGNATURE) {
        updateFields.clear_signature = true;
      }

      return {
        filter: getFilterJson(),
        update_fields: updateFields,
      };
    };

    const onBulkUpdate = async () => {
      try {
        state.isApiLoading = true;

        const payload = getPayloadForBulkUpdate();

        await bulkUpdateMailboxes(payload);

        // Show a success toaster
        appContext.config.globalProperties.$toast({
          message: 'Mailboxes updated successfully',
        });

        emit('onSuccessfulUpdate');
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    const onBulkDelete = async () => {
      try {
        state.isApiLoading = true;

        const payload = getFilterJson();

        await bulkDeleteMailboxes(payload);

        // Show a success toaster
        appContext.config.globalProperties.$toast({
          message: 'Mailboxes deleted successfully',
        });

        emit('onSuccessfulUpdate');
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    // api call
    const onSubmitForm = async () => {
      try {
        const isValidated = await state.actionConfigFormRef?.validate();

        if (isValidated) {
          if (props.actionType === MAILBOX_ACTIONS.DELETE) {
            onBulkDelete();
          } else {
            onBulkUpdate();
          }
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      }
    };

    // life cycle hook
    onMounted(() => {
      if (props.actionType === MAILBOX_ACTIONS.ENABLE_WARMUP) {
        state.showSelectWarmupProfileDropdown = true;
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      config,
      totalCount,
      isMobileDevice,
      selectedWarmupProfileDetails,
      selectedWarmupProfilePreviewText,

      // methods
      onSubmitForm,
      onInputChange,
      onUpdateMailboxWarmupProfile,
      onNewWarmupProfileCreated,

      // hardcoded
      MAILBOX_ACTIONS,

      // rules
      dailyLimitRules: [
        (val) => val >= 1 || 'Daily send count must be at least 1',
        (val) => val <= 50 || 'Daily send count cannot exceed 50',
      ],
    };
  },
});
</script>

<style lang="scss" scoped>
.action-config-card {
  max-width: 640px;

  .app-modal-content {
    .modal-content-container {
      max-width: 400px;
      margin-bottom: 24px;

      &.no-max-width {
        max-width: none;
      }

      .delete-warning-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;
        line-height: 22px;

        margin-bottom: 20px;

        .permanent-delete-text {
          color: $negative;
        }
      }

      .manage-profile-btn {
        font-size: 13px;
        margin-left: 4px;

        text-decoration: underline;
      }

      .warmup-profiles-dd {
        max-width: 300px;
      }

      .small-preview-text {
        margin-top: 12px;
        font-size: 12px;
        color: rgba($color: var(--black-rgb), $alpha: 0.8);
        margin-top: 6px;
        margin-left: 8px;
      }
    }
  }
}
</style>
