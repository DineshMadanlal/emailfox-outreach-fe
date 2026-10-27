<template>
  <q-card flat class="app-modal-card assign-tags-card">
    <!-- header -->
    <div class="app-modal-header">
      <h4 class="modal-header-text">
        Assign Tags
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
    <div class="app-modal-content custom-scrollbar">

      <!-- Mode Switcher (Segmented Control) -->
      <div class="mode-segmented-control">
        <!-- Replace Button -->
        <button
          type="button"
          class="segmented-btn"
          :class="{ active: mode === ASSIGN_TAG_MODES.REPLACE }"
          @click="mode = ASSIGN_TAG_MODES.REPLACE"
        >
          Replace all tags
        </button>

        <!-- Add Button -->
        <button
          type="button"
          class="segmented-btn"
          :class="{ active: mode === ASSIGN_TAG_MODES.ADD }"
          @click="mode = ASSIGN_TAG_MODES.ADD"
        >
          Add to existing tags
        </button>
      </div>

      <!-- Search / Quick Create Input -->
      <div class="search-input-container">
        <AppSearchInput
          v-model="searchText"
          placeholder="Search or create tag..."
          class="search-input"
          @keyup.enter="handleEnterKey"
        />
      </div>

      <!-- Inline Tag Creation Option -->
      <div
        v-if="showQuickCreateOption"
        class="quick-create-tag-btn"

        @click="onCreateNewTag"
      >
        <div class="quick-create-text">
          <q-spinner
            v-if="loaders.isCreatingTag"

            size="14px"
            color="primary"
            class="q-mr-xs"
          />

          <span v-else class="q-mr-xs text-weight-bold">+</span>
          Create tag "<strong>{{ searchText.trim() }}</strong>"
        </div>
        <div class="enter-shortcut-pill">
          Press Enter ↵
        </div>
      </div>

      <!-- Available Tags List -->
      <div class="tags-list-wrapper">
        <!-- Api Loading -->
        <div
          v-if="getIsApiLoading"
          class="flex flex-center q-py-md"
        >
          <q-spinner size="24px" color="primary" />
        </div>

        <!--  -->
        <template
          v-else-if="filteredTags.length > 0"
        >
          <!--  -->
          <div
            v-for="tag in filteredTags"
            :key="`assign-tags-${tag.id}`"
            class="tag-item-row"

            @click="toggleTagSelection(tag.id)"
          >
            <!--  -->
            <q-checkbox
              dense
              :model-value="selectedTagIds.includes(tag.id)"
              class="app-checkbox pointer-events-none"
            />

            <PreviewTag
              :name="tag.name"
              :color="tag.color"
            />
          </div>
        </template>

        <!--  -->
        <template
          v-else
        >
          <div class="no-tags-found-text">
            No tags available
          </div>
        </template>
      </div>
    </div>

    <!-- footer -->
    <div class="app-modal-footer">
      <q-space />

      <!-- cancel -->
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        label="Cancel"
        color="primary"
        class="light-primary-btn q-mr-md"
      />

      <!-- apply tags -->
      <q-btn
        no-caps
        unelevated

        label="Apply Tags"
        color="primary"

        :loading="loaders.isSubmitting"

        @click="onApplyTags"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  onMounted,
  getCurrentInstance,
} from 'vue';

// Components
import PreviewTag from 'components/Tags/PreviewTag.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';

// Utils
import { postApiCall } from 'src/utils/apiRequests';
import { bulkUpdateMailboxes, getBulkMailboxesPayload } from 'src/utils/domainMailboxesApi';

// Pinia store
import { useTagsStore } from 'src/stores/tags';

// Constants
import { TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';
import { TAGS_PRESET_COLORS, BULK_ASSIGN_TAG_FEATURE } from 'src/boot/workspace-constants';

// Mode constants
export const ASSIGN_TAG_MODES = {
  REPLACE: 'REPLACE',
  ADD: 'ADD',
};

export default defineComponent({
  name: 'AssignTags',

  emits: ['onSuccessfulUpdate'],

  components: {
    AppSearchInput,
    PreviewTag,
  },

  props: {
    filters: {
      type: Object,
      default: () => ({}),
    },
    selectedRows: {
      type: Array,
      default: () => [],
    },
    multiSelectOptionJson: {
      type: Object,
      default: () => ({}),
    },
    feature: {
      type: String,
      default: '',
    },
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // store
    const tagsStorePinia = useTagsStore();

    // state
    const state = reactive({
      mode: ASSIGN_TAG_MODES.REPLACE,
      searchText: '',
      selectedTagIds: [],

      loaders: {
        isCreatingTag: false,
        isSubmitting: false,
      },
    });

    // computed
    const getIsApiLoading = computed(() => tagsStorePinia.getIsApiLoading);

    const isAllSelected = computed(() => props.multiSelectOptionJson?.selectedOption
      === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL);

    const totalCount = computed(() => {
      if (isAllSelected.value) {
        return props.multiSelectOptionJson?.limit || 0;
      }
      return props.selectedRows?.length || 0;
    });

    // Filtered tags based on search text
    const filteredTags = computed(() => {
      const query = state.searchText.trim().toLowerCase();
      const list = tagsStorePinia.getTagsList || [];
      if (!query) return list;
      return list.filter((tag) => tag.name?.toLowerCase().includes(query));
    });

    const showQuickCreateOption = computed(() => {
      const query = state.searchText.trim();
      if (!query) return false;
      return filteredTags.value.length === 0;
    });

    // Selection toggle
    const toggleTagSelection = (tagId) => {
      const index = state.selectedTagIds.indexOf(tagId);
      if (index > -1) {
        state.selectedTagIds.splice(index, 1);
      } else {
        state.selectedTagIds.push(tagId);
      }
    };

    // Quick create tag
    const onCreateNewTag = async () => {
      const tagName = state.searchText.trim();
      if (!tagName || state.loaders.isCreatingTag) return;

      try {
        state.loaders.isCreatingTag = true;

        // random color
        const randomColor = TAGS_PRESET_COLORS[Math.floor(
          Math.random() * TAGS_PRESET_COLORS.length,
        )];

        // api call
        const response = await postApiCall({
          endpoint: '/tags',
          payload: {
            name: tagName,
            color: randomColor,
          },
          includeWorkspace: true,
        });

        // new tag response
        const newTag = response?.data || response;

        tagsStorePinia.addTagToList(newTag);

        if (newTag?.id && !state.selectedTagIds.includes(newTag.id)) {
          state.selectedTagIds.push(newTag.id);
        }

        state.searchText = '';

        appContext.config.globalProperties.$toast({
          message: `Tag "${tagName}" created`,
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to create tag',
        });
      } finally {
        state.loaders.isCreatingTag = false;
      }
    };

    const handleEnterKey = () => {
      if (showQuickCreateOption.value && !state.loaders.isCreatingTag) {
        onCreateNewTag();
      }
    };

    const onBulkUpdateMailboxes = async () => {
      try {
        state.loaders.isSubmitting = true;

        const updateFields = {};

        if (state.mode === ASSIGN_TAG_MODES.REPLACE) {
          updateFields.replace_assign_tags_with = state.selectedTagIds;
        } else {
          updateFields.add_new_tags = state.selectedTagIds;
        }

        const payload = {
          filter: getBulkMailboxesPayload({
            filters: props.filters,
            isAllSelected: isAllSelected.value,
            selectedRows: props.selectedRows,
          }),
          update_fields: updateFields,
        };

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
        state.loaders.isSubmitting = false;
      }
    };

    // Submit handler
    const onApplyTags = () => {
      if (props.feature === BULK_ASSIGN_TAG_FEATURE.MAILBOXES) {
        onBulkUpdateMailboxes();
      }
    };

    // Lifecycle
    onMounted(() => {
      tagsStorePinia.fetchTags();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      getIsApiLoading,
      totalCount,
      filteredTags,
      showQuickCreateOption,

      // methods
      onApplyTags,
      handleEnterKey,
      onCreateNewTag,
      toggleTagSelection,

      // constants
      ASSIGN_TAG_MODES,
    };
  },
});
</script>

<style lang="scss" scoped>
.assign-tags-card {
  max-width: 520px;
  width: 100%;

  .app-modal-content {
    display: flex;
    flex-direction: column;

    gap: 16px;

    // Mode Segmented Control Styles
    .mode-segmented-control {
      display: flex;
      background-color: rgba($color: var(--grey-rgb), $alpha: 0.08);
      border-radius: 8px;
      padding: 4px;
      gap: 4px;

      .segmented-btn {
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        background: transparent;
        font-size: 14px;
        font-weight: 500;
        color: $grey;
        cursor: pointer;
        transition: all 0.2s ease;

        &.active {
          background: $white;
          color: $primary;
          box-shadow: 0px 1px 3px rgba(var(--black-rgb), 0.01);
          font-weight: 600;
        }
      }
    }

    // create tag
    .quick-create-tag-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 14px;
      border: 1px dashed $primary;
      border-radius: 8px;
      background-color: rgba(var(--primary-rgb), 0.04);
      color: $primary;
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(var(--primary-rgb), 0.08);
      }

      .quick-create-text {
        font-size: 14px;
        display: flex;
        align-items: center;
      }

      .enter-shortcut-pill {
        font-size: 11px;
        font-weight: 500;
        padding: 2px 6px;
        border-radius: 4px;
        background: rgba(var(--primary-rgb), 0.12);
        color: $primary;
      }
    }

    // tags list
    .tags-list-wrapper {
      max-height: 340px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      padding-right: 4px;
      border: 1px solid $grey-50;
      border-radius: 8px;

      .no-tags-found-text {
        color: rgba($color: var(--black-50-rgb), $alpha: 0.8);
        padding: 24px 16px;
      }

      .tag-item-row {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        cursor: pointer;
        transition: background-color 0.15s ease;

        border-bottom: 1px solid rgba($color: var(--grey-50-rgb), $alpha: 0.5);

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background-color: rgba($color: var(--grey-rgb), $alpha: 0.05);
        }

        .pointer-events-none {
          pointer-events: none;
        }
      }
    }

    .warning-alert-banner {
      display: flex;
      align-items: flex-start;
      padding: 12px 14px;
      background-color: #FFFBEB;
      border: 1px solid #FCD34D;
      border-radius: 8px;

      .warning-icon {
        flex-shrink: 0;
        margin-top: 1px;
      }

      .warning-text {
        font-size: 13px;
        line-height: 18px;
        color: #92400E;
      }
    }
  }
}
</style>
