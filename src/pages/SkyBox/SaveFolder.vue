<template>
  <q-form
    ref="folderFormRef"
    class="preferences-new-folder"
    @submit.prevent.stop="onSubmitForm"
  >
    <ApiLoader :show="isFolderByIdApiLoading" />

    <!-- Header -->
    <div class="preferences-new-folder-header">
      <h3 class="folder-header-text">
        {{ folderId ? 'Edit' : 'New' }} Folder
      </h3>
    </div>

    <!-- Content -->
    <div class="preferences-new-folder-content">
      <!-- Folder Name -->
      <div class="folder-name-wrapper">
        <InputLabel
          isImportant
          label="Folder Name"
        />

        <q-input
          dense
          outlined
          hide-bottom-space

          :autofocus="!folderId"
          v-model="folderName"

          ref="folderNameRef"
          lazy-rules="ondemand"
          class="app-input-field-height"

          :rules="folderNameRules"

          @update:model-value="onInputChange"
        />
      </div>

      <!-- Rules -->
      <div class="full-width">
        <p class="rules-header-text">
          Rules
        </p>

        <!-- grid -->
        <div class="folder-rules-grid">
          <div
            v-for="(rule, index) of rules"
            :key="`folder-rule-${index}`"
            class="each-rule-wrapper"
          >
            <!-- rule type -->
            <q-select
              dense
              outlined
              emit-value
              map-options
              options-dense
              hide-bottom-space

              option-label="label"
              option-value="value"
              dropdown-icon="keyboard_arrow_down"

              v-model="rule.rule_type"
              :options="FOLDER_RULE_TYPES"
              class="rule-input dd-input-rule-type"
            />

            <!-- pattern -->
            <q-select
              dense
              outlined
              emit-value
              map-options
              options-dense
              hide-bottom-space

              option-label="label"
              option-value="value"
              dropdown-icon="keyboard_arrow_down"

              v-model="rule.pattern_type"
              :options="FOLDER_PATTERN_TYPES"
              class="rule-input dd-input-rule-type"
            />

            <!-- Value -->
            <q-input
              dense
              outlined
              hide-bottom-space
              v-model="rule.pattern"

              lazy-rules="ondemand"
              ref="patternTypeRefs"
              placeholder="Enter value"
              class="rule-input value-input-rule-type"

              :rules="[
                (v) => !!v || 'Pattern value is required',
                (v) => v.length <= 100 || 'Value must be under 100 characters',
              ]"

              @update:model-value="resetRuleFieldValidation(index, 'patternTypeRefs')"
            />

            <!-- add button -->
            <q-btn
              flat
              no-caps
              unelevated

              color="primary"
              @click="addEmptyRule"

              class="folder-action-btn app-primary-button"

              v-if="index === rules.length - 1"
            >
              <LocalSvgIcon
                image="circle-plus"
                classes="folder-action-icon app-primary-button"
              />
            </q-btn>

            <!-- OR Text and delete option -->
            <div
              v-else
              class="folder-rule-actions"
            >
              <p
                class="or-text"
              >
                OR
              </p>

              <q-btn
                flat
                no-caps
                unelevated

                color="negative"
                @click="removeRule(index)"

                class="folder-action-btn app-negative-button"
              >
                <LocalSvgIcon
                  image="delete"
                  classes="folder-action-icon app-negative-icon"
                />
              </q-btn>

            </div>
          </div>
        </div>
      </div>

      <p class="folder-rules-info-text">
        All the emails which matches the rules will be grouped in this folder in SkyBox.
      </p>

      <q-checkbox
        v-model="applyRuleOnExistingEmails"
        class="app-checkbox"

        :disable="folderByIdResponse?.status === FOLDER_STATUS.INACTIVE"
      >
        <p>
          Run existing emails through this filter.
        </p>

        <AppTooltip
          v-if="folderByIdResponse?.status === FOLDER_STATUS.INACTIVE"
          content="This folder is inactive. You cannot apply rules on existing emails."
        />
      </q-checkbox>
    </div>

    <!-- Footer -->
    <div class="preferences-new-folder-footer">
      <!-- Save Button -->
      <q-btn
        no-caps
        unelevated

        label="Save"
        type="submit"
        color="primary"

        :loading="isSaveApiLoading"
      />
    </div>
  </q-form>
</template>

<script>
// lodash
import size from 'lodash/size';
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, toRefs, reactive,
  computed, onMounted, getCurrentInstance,
} from 'vue';

// components
import AppTooltip from 'components/General/AppTooltip.vue';
import InputLabel from 'components/Form/InputLabel.vue';
import ApiLoader from 'components/General/ApiLoader.vue';

// utils
import { getApiCall, postApiCall } from 'src/utils/apiRequests';

// route
import { useRoute, useRouter } from 'vue-router';

// store pinia
import { useSkyboxStore } from 'src/stores/skybox.js';

// utils
import { convertStringToNumber } from 'src/utils/numbers';

// constants
import {
  FOLDER_RULE_TYPES, FOLDER_PATTERN_TYPES,
  DEFAULT_FOLDER_RULE_TYPE, DEFAULT_FOLDER_PATTERN_TYPE,
  FOLDER_STATUS,
} from 'boot/constants';

export default defineComponent({
  name: 'NewFolder',

  components: {
    InputLabel,
    ApiLoader,
    AppTooltip,
  },

  setup() {
    // router
    const $route = useRoute();
    const $router = useRouter();

    const { appContext } = getCurrentInstance();

    // store
    const skyboxPinia = useSkyboxStore();

    // state
    const state = reactive({
      folderName: '',
      rules: [],

      folderFormRef: null,
      patternTypeRefs: [],
      folderByIdResponse: {},

      isSaveApiLoading: false,
      isFolderByIdApiLoading: false,

      applyRuleOnExistingEmails: false,
    });

    // computed
    const allFoldersFromStore = computed(() => skyboxPinia.getAllFolders);

    const folderId = computed(() => convertStringToNumber($route.params.id));

    const disableSaveBtn = computed(() => {
      if (state.folderName && size(state.rules)) {
        return false;
      }

      return true;
    });

    // methods
    const onInputChange = () => {
      state.folderFormRef.resetValidation();
    };

    const resetRuleFieldValidation = (index, fieldType) => {
      const fieldRef = state[fieldType][index];

      if (fieldRef && typeof fieldRef.resetValidation === 'function') {
        fieldRef.resetValidation();
      }
    };

    const removeRule = (index) => {
      state.rules.splice(index, 1);
    };

    const onSubmitForm = async () => {
      try {
        state.isSaveApiLoading = true;

        const payload = {
          rules: state.rules,
          name: state.folderName,
          apply_rules: state.applyRuleOnExistingEmails,
        };

        //
        if (folderId.value) {
          payload.id = folderId.value;
          payload.status = state.folderByIdResponse?.status;
        }

        // API call to save folder
        await postApiCall({
          endpoint: '/master-inbox/mail-folders',
          payload,
        });

        $router.push('/unibox/preferences/folders');

        appContext.config.globalProperties.$toast({
          message: 'Folder saved successfully',
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error,
        });
      } finally {
        state.isSaveApiLoading = false;
      }
    };

    const addEmptyRule = () => {
      state.rules.push({
        rule_type: DEFAULT_FOLDER_RULE_TYPE,
        pattern_type: DEFAULT_FOLDER_PATTERN_TYPE,
        pattern: '',
      });
    };

    const setFolderStateFromResponse = (response) => {
      state.folderName = response?.name;
      state.rules = response?.rules || [];

      // add empty rule if no rules exist
      if (isEmpty(state.rules)) {
        addEmptyRule();
      }
    };

    const fetchFolderById = async (showLoader) => {
      try {
        if (showLoader) {
          state.isFolderByIdApiLoading = true;
        }

        const response = await getApiCall({
          endpoint: `skybox/mail-folders/${folderId.value}`,
        });

        setFolderStateFromResponse(response);
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error,
        });
      } finally {
        state.isFolderByIdApiLoading = false;
      }
    };

    onMounted(() => {
      if (folderId.value) {
        state.folderByIdResponse = allFoldersFromStore.value.find(
          (folder) => folder.id === folderId.value,
        );

        if (state.folderByIdResponse) {
          setFolderStateFromResponse(state.folderByIdResponse);
        }
        // fetch folder by ID
        fetchFolderById(isEmpty(state.folderByIdResponse));
      } else {
        // add an empty rule for users to add
        addEmptyRule();
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      folderId,
      disableSaveBtn,
      folderNameRules: [
        (v) => (v && v.length > 0) || 'Folder name is required',
        (v) => v.length < 50 || 'Folder name must be less than 50 characters',
      ],

      // methods
      removeRule,
      onSubmitForm,
      onInputChange,
      addEmptyRule,
      resetRuleFieldValidation,

      // constants
      FOLDER_STATUS,
      FOLDER_RULE_TYPES,
      FOLDER_PATTERN_TYPES,
    };
  },
});
</script>

<style lang="scss" scoped>
.preferences-new-folder {
  width: 100%;
  height: inherit;
  min-height: inherit;

  display: flex;
  flex-direction: column;
  overflow-y: auto; // allow whole container to scroll

  position: relative;

  .preferences-new-folder-header,
  .preferences-new-folder-content,
  .preferences-new-folder-footer {
    padding: 20px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }
  }

  // header
  .preferences-new-folder-header {
    width: 100%;
    background-color: $white;
    border-bottom: 1px solid $grey-50;

    position: sticky;
    top: 0;
    z-index: 2;

    .folder-header-text {
      color: $black;
      font-size: 18px;
      font-weight: 600;
    }
  }

  // footer
  .preferences-new-folder-footer {
    width: 100%;
    background-color: $white;
    border-top: 1px solid $grey-50;

    position: sticky;
    bottom: 0;
    z-index: 2;
  }

  // content
  .preferences-new-folder-content {
    width: 100%;
    flex: 1;

    .folder-name-wrapper {
      width: 100%;
      max-width: 353px;

      margin-bottom: 40px;
    }

    .rules-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;

      margin-bottom: 16px;
    }

    .folder-rules-grid {
      width: 100%;
      max-width: 760px;

      display: grid;
      grid-row-gap: 16px;

      .each-rule-wrapper {
        display: flex;
        align-items: center;
        gap: 16px;

        flex-wrap: wrap;

        .dd-input-rule-type {
          width: 100%;
          max-width: 155px;
        }

        .value-input-rule-type {
          width: 100%;
          max-width: 300px;
        }

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          .dd-input-rule-type {
            width: 100%;
            max-width: 100%;
          }
          .value-input-rule-type {
            max-width: 100%;
          }
        }

        .folder-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 6px;

          .folder-action-icon {
            min-width: 16px;
            height: 16px;
          }
        }

        .folder-rule-actions {
          display: flex;
          align-items: center;

          gap: 8px;

          .or-text {
            padding: 10px 12px;

            color: $black;
            font-size: 14px;
            font-weight: 400;
            line-height: 16px; /* 114.286% */

            text-transform: uppercase;

            border-radius: 6px;
            border: 1px solid $grey-100;
            background: rgba($color: var(--grey-50-rgb), $alpha: 0.6);
          }
        }

        .rule-input {
          border-radius: 6px;

          :deep(.q-field__inner) {
            .q-field__control,
            .q-field__marginal {
              height: 36px;
              min-height: 36px;
            }

            .q-field__outlined {
              .q-field__control {
                &::before {
                  border: 1px solid $blue-grey;
                }
              }
            }
          }
        }
      }
    }

    .folder-rules-info-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      padding: 12px;

      width: 100%;
      max-width: 600px;

      margin: 40px 0px;

      border-radius: 8px;
      background: rgba($color: var(--primary-rgb), $alpha: 0.1);
    }
  }
}
</style>
