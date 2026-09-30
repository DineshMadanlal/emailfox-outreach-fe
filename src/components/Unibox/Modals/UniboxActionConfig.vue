<template>
  <q-card flat class="app-modal-card unibox-action-config-card">
    <q-form
      class="full-width"
      ref="uniboxActionConfigFormRef"
      @submit.prevent.stop="onSubmitForm"
    >
      <!-- Header -->
      <div class="app-modal-header">
        <h4 class="modal-header-text">
          {{ modalTitle }}
        </h4>

        <q-space />

        <!-- Close Button -->
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
        <!-- Unibox Untracked: Delete -->
        <div
          class="modal-content-container no-max-width"
          v-if="actionType === UNIBOX_UNTRACKED_ACTIONS.DELETE"
        >
          <q-field
            borderless
            hide-bottom-space
            :model-value="agreeToArchive"
            :rules="[
              (val) => val === true || 'You must confirm to delete',
            ]"
            lazy-rules="ondemand"
          >
            <template v-slot:control>
              <q-checkbox
                v-model="agreeToArchive"
                @update:modelValue="onInputChange"

                :color="actionConfigJson.color"

                class="app-checkbox"
                label="Are you sure you want to delete the selected inbox thread(s)?"
              />
            </template>
          </q-field>
        </div>
        <!-- Archive Inbox Threads -->
        <div
          class="modal-content-container no-max-width"
          v-else-if="actionType === UNIBOX_INBOX_ACTIONS.ARCHIVE"
        >
          <q-field
            borderless
            hide-bottom-space
            :model-value="agreeToArchive"
            :rules="[
              (val) => val === true || 'You must confirm to archive',
            ]"
            lazy-rules="ondemand"
          >
            <template v-slot:control>
              <q-checkbox
                v-model="agreeToArchive"
                @update:modelValue="onInputChange"

                :color="actionConfigJson.color"

                class="app-checkbox"
                label="Are you sure you want to archive the selected inbox thread(s)?"
              />
            </template>
          </q-field>
        </div>

        <!-- Clear Reply Category -->
        <div
          class="modal-content-container no-max-width"
          v-else-if="actionType === UNIBOX_INBOX_ACTIONS.CLEAR_CATEGORY"
        >
          <q-field
            borderless
            hide-bottom-space

            :model-value="agreeToClearCategory"
            :rules="[
              (val) => val === true || 'You must confirm to clear reply category',
            ]"

            color="negative"
            lazy-rules="ondemand"
          >
            <template v-slot:control>
              <q-checkbox
                v-model="agreeToClearCategory"
                @update:modelValue="onInputChange"

                :color="actionConfigJson.color"

                class="app-checkbox"
                label="Are you sure you want to clear the reply category for selected thread(s)?"
              />
            </template>
          </q-field>
        </div>

        <!-- Update Reply Category -->
        <div
          class="modal-content-container"
          v-else-if="actionType === UNIBOX_INBOX_ACTIONS.UPDATE_CATEGORY"
        >
          <div class="full-width">
            <InputLabel
              label="Select Reply Category"
            />

            <SelectReplyCategory
              class="full-width category-select-dd"
              placeholderText="Select reply category"
              :options="replyCategories"
              v-model="selectedCategoryId"
            />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="app-modal-footer">
        <q-btn
          no-caps
          unelevated

          :loading="isApiLoading"
          :color="actionConfigJson.color"
          :label="actionConfigJson.label"

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
          :color="actionConfigJson.color"
          :loading="isApiLoading"
          :class="`light-${actionConfigJson.color}-btn`"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, getCurrentInstance,
} from 'vue';

// components
import InputLabel from 'components/Form/InputLabel.vue';
import SelectReplyCategory from 'components/Dropdown/Unibox/SelectReplyCategory.vue';

// utils
import {
  sanitizeUniboxQueryParams,
  bulkDeleteUniboxUntrackedReplies,
  bulkArchiveUniboxInboxThreads,
  bulkUpdateUniboxInboxCategory,
} from 'src/utils/unibox';

// constants
import { TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';
import {
  UNIBOX_INBOX_ACTIONS,
  UNIBOX_UNTRACKED_ACTIONS,
} from 'boot/unibox-constants';

export default defineComponent({
  name: 'UniboxActionConfig',

  emits: ['onSuccessfulUpdate'],

  components: {
    InputLabel,
    SelectReplyCategory,
  },

  props: {
    actionType: {
      type: String,
      default: '',
    },
    filters: {
      type: Object,
      default: () => ({}),
    },
    selectedThreadIds: {
      type: Array,
      default: () => [],
    },
    multiSelectOptionJson: {
      type: Object,
      default: () => ({}),
    },
    replyCategories: {
      type: Array,
      default: () => [],
    },
  },

  setup(props, { emit }) {
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isApiLoading: false,
      agreeToDelete: false,
      agreeToArchive: false,
      agreeToClearCategory: false,
      selectedCategoryId: null,
      uniboxActionConfigFormRef: null,
    });

    // computed
    const isAllSelected = computed(() => (
      props.multiSelectOptionJson?.selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL
    ));

    const totalCount = computed(() => {
      if (isAllSelected.value) {
        return props.multiSelectOptionJson?.limit || props.selectedThreadIds?.length || 0;
      }
      return props.selectedThreadIds?.length || 0;
    });

    const modalTitle = computed(() => {
      const count = totalCount.value;
      switch (props.actionType) {
        case UNIBOX_UNTRACKED_ACTIONS.DELETE:
          return `Delete ${count} Untracked Email${count === 1 ? '' : 's'}`;
        case UNIBOX_INBOX_ACTIONS.ARCHIVE:
          return `Archive ${count} Thread${count === 1 ? '' : 's'}`;
        case UNIBOX_INBOX_ACTIONS.UPDATE_CATEGORY:
          return `Update Reply Category for ${count} Thread${count === 1 ? '' : 's'}`;
        case UNIBOX_INBOX_ACTIONS.CLEAR_CATEGORY:
          return `Clear Reply Category for ${count} Thread${count === 1 ? '' : 's'}`;
        default:
          return 'Confirm Action';
      }
    });

    const actionConfigJson = computed(() => {
      switch (props.actionType) {
        case UNIBOX_UNTRACKED_ACTIONS.DELETE:
          return {
            label: 'Delete',
            color: 'negative',
          };
        case UNIBOX_INBOX_ACTIONS.ARCHIVE:
          return {
            label: 'Archive',
            color: 'negative',
          };
        case UNIBOX_INBOX_ACTIONS.UPDATE_CATEGORY:
          return {
            label: 'Update Category',
            color: 'primary',
          };
        case UNIBOX_INBOX_ACTIONS.CLEAR_CATEGORY:
          return {
            label: 'Clear Category',
            color: 'negative',
          };
        default:
          return {
            label: 'Confirm',
            color: 'primary',
          };
      }
    });

    // methods
    const onInputChange = () => {
      state.uniboxActionConfigFormRef?.resetValidation();
    };

    const getPayload = () => {
      const sanitizedFilters = sanitizeUniboxQueryParams(props.filters);

      return {
        select_all: isAllSelected.value,
        ids: isAllSelected.value ? [] : props.selectedThreadIds,
        filters: sanitizedFilters,
      };
    };

    const onSubmitForm = async () => {
      try {
        const isValidated = await state.uniboxActionConfigFormRef?.validate();
        if (!isValidated) return;

        state.isApiLoading = true;
        const payload = getPayload();

        if (props.actionType === UNIBOX_UNTRACKED_ACTIONS.DELETE) {
          await bulkDeleteUniboxUntrackedReplies(payload);
          appContext.config.globalProperties.$toast?.({
            message: 'Untracked email(s) deleted successfully',
          });
        } else if (props.actionType === UNIBOX_INBOX_ACTIONS.ARCHIVE) {
          await bulkArchiveUniboxInboxThreads(payload);
          appContext.config.globalProperties.$toast?.({
            message: 'Inbox thread(s) archived successfully',
          });
        } else if (props.actionType === UNIBOX_INBOX_ACTIONS.UPDATE_CATEGORY) {
          if (!state.selectedCategoryId) {
            appContext.config.globalProperties.$toast?.({
              warning: true,
              message: 'Please select a reply category',
            });
            state.isApiLoading = false;
            return;
          }
          await bulkUpdateUniboxInboxCategory({
            ...payload,
            reply_category_id: state.selectedCategoryId,
          });
          appContext.config.globalProperties.$toast?.({
            message: 'Reply category updated successfully',
          });
        } else if (props.actionType === UNIBOX_INBOX_ACTIONS.CLEAR_CATEGORY) {
          await bulkUpdateUniboxInboxCategory({
            ...payload,
            clear_reply_category: true,
          });
          appContext.config.globalProperties.$toast?.({
            message: 'Reply category cleared successfully',
          });
        }

        emit('onSuccessfulUpdate');
      } catch (error) {
        appContext.config.globalProperties.$toast?.({
          warning: true,
          message: error.message || 'Failed to complete action',
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed
      modalTitle,
      totalCount,
      actionConfigJson,

      // methods
      onSubmitForm,
      onInputChange,

      // constants
      UNIBOX_INBOX_ACTIONS,
      UNIBOX_UNTRACKED_ACTIONS,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-action-config-card {
  max-width: 540px;

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

      .category-select-dd {
        max-width: 320px;
      }
    }
  }
}
</style>
