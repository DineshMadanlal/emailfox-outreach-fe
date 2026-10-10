<template>
  <div class="tags-settings">
    <!-- Header -->
    <div class="settings-section-header">
      <!-- Left Side -->
      <div class="settings-header-left-side">
        <!-- Header Text & Count Badge -->
        <div class="flex items-center gap-sm">
          <p class="settings-header-text">
            Tags
          </p>
        </div>

        <!-- Label Text -->
        <p class="settings-label-text">
          Organize your mailboxes, campaigns and contact lists using tags.
          Create and manage tags to easily filter, segment and track your outreach.
        </p>
      </div>

      <!-- Right Side -->
      <div
        v-if="tagsList.length > 0 || searchText"
        class="settings-header-right-side"
      >
        <!-- Create New Tag Button -->
        <q-btn
          no-caps
          unelevated
          color="primary"
          :disable="isReadOnly"
          @click="onAddNewTag"
        >
          <AppTooltip
            v-if="isReadOnly"
            anchor="top middle"
            self="bottom middle"
            content="You have read-only access in this workspace"
          />

          <div class="text-no-wrap flex items-center gap-xs">
            <q-icon name="add" size="18px" />
            <span>Create Tag</span>
          </div>
        </q-btn>
      </div>
    </div>

    <!-- Content -->
    <div class="settings-section-content q-mt-md">
      <!-- Search Filter Bar -->
      <div
        v-if="tagsList.length > 0 || searchText || flags.isInitialLoading"
        class="tags-search-bar-wrapper q-mb-md"
      >
        <AppSearchInput
          v-model="searchText"

          clearable
          placeholder="Search tags by name..."
          @update:model-value="onSearchInput"
        />
      </div>

      <!-- Initial Skeleton Loader -->
      <div
        v-if="flags.isInitialLoading"
        class="tags-list-card skeleton-card"
      >
        <q-spinner-dots size="32px" color="primary" />
      </div>

      <!-- Global Empty State Illustration -->
      <AllTagsIllustration
        v-else-if="tagsList.length === 0 && !searchText"
        @onCreateTag="onAddNewTag"
      />

      <!-- Search No Results State -->
      <div
        v-else-if="tagsList.length === 0 && searchText"
        class="tags-no-results-card"
      >
        <h6 class="tags-no-result-header-text">
          No tags found
        </h6>
        <p class="tags-no-result-sub-text">
          No tags match "<strong>{{ searchText }}</strong>". Try searching for another keyword.
        </p>

        <q-btn
          flat
          no-caps

          color="primary"
          label="Clear search"
          class="light-primary-btn"
          @click="onClearSearch"
        />
      </div>

      <!-- Tags List with Infinite Scroll -->
      <div
        v-else
        class="tags-list-wrapper hide-scrollbar"
      >
        <div class="tags-list-card">
          <div
            v-for="tag in tagsList"
            :key="tag.id"
            class="tag-item-row"
          >
            <!-- Left: Tag Chip -->
            <div class="tag-chip-wrapper">
              <div
                class="tag-chip"
                :style="{
                  backgroundColor: getTagRgbaColor(tag.color, 0.12),
                  color: tag.color || '#2563EB',
                  borderColor: getTagRgbaColor(tag.color, 0.25),
                }"
              >
                {{ tag.name }}
              </div>
            </div>

            <!-- Right: Action Buttons (Edit & Delete) -->
            <div class="tag-actions-wrapper">
              <!-- Edit -->
              <q-btn
                flat
                round
                dense

                class="tag-action-btn"
                :disable="isReadOnly"
                @click="onEditTag(tag)"
              >
                <LocalSvgIcon
                  image="edit"
                  classes="tag-icon"
                />
              </q-btn>

              <!-- Delete -->
              <q-btn
                flat
                round
                dense
                class="tag-action-btn text-negative"
                :disable="isReadOnly"
                @click="onDeleteTag(tag)"
              >
                <LocalSvgIcon
                  image="delete"
                  classes="tag-icon"
                />
              </q-btn>
            </div>
          </div>
        </div>

        <!-- Infinite Scroll Loading Indicator -->
        <div
          v-if="flags.isLoadingMore"
          class="flex flex-center q-py-md full-width"
        >
          <q-spinner-dots color="primary" size="28px" />
        </div>

        <!-- Intersection Observer Target for Infinite Scroll -->
        <q-intersection
          v-if="pagination.hasMore && !flags.isInitialLoading && !flags.isLoadingMore"
          @visibility="loadMoreOptions"
        />

        <!-- End of List Notice -->
        <div
          v-if="!pagination.hasMore && tagsList.length > 0
            && !flags.isInitialLoading && !flags.isLoadingMore"
          class="tags-end-of-results q-py-sm text-center"
        >
          All tags loaded ({{ pagination.count }})
        </div>
      </div>
    </div>

    <!-- Modals -->
    <!-- Save Tag Modal (Create or Update) -->
    <q-dialog
      v-model="modals.showSaveTag"
      class="app-modal-dialog"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveTagModal
        :tagJson="selectedTag"
        @onSuccessSaveTag="onSuccessSaveTag"
      />
    </q-dialog>

    <!-- Delete Tag Confirmation Modal -->
    <q-dialog
      v-model="modals.showDeleteTag"
      class="app-modal-dialog"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteTagModal
        :tagJson="selectedTag"
        @onSuccessfulDelete="onSuccessDeleteTag"
      />
    </q-dialog>
  </div>
</template>

<script>
// lodash
import debounce from 'lodash/debounce';

// vue
import {
  defineComponent,
  reactive,
  toRefs,
  onMounted,
  getCurrentInstance,
} from 'vue';

// quasar
import { useMeta, colors } from 'quasar';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';
import { usePermissions } from 'src/composables/usePermissions';

// utils
import { getApiCall } from 'src/utils/apiRequests';

// components
import AppTooltip from 'components/General/AppTooltip.vue';
import AllTagsIllustration from 'components/Illustrations/AllTags.vue';
import SaveTagModal from 'components/Tags/Modals/SaveTag.vue';
import DeleteTagModal from 'components/Tags/Modals/DeleteTag.vue';
import AppSearchInput from 'src/components/Input/AppSearchInput.vue';

export default defineComponent({
  name: 'TagsManager',

  components: {
    AppTooltip,
    AllTagsIllustration,
    SaveTagModal,
    DeleteTagModal,
    AppSearchInput,
  },

  setup() {
    const { appContext } = getCurrentInstance();
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();
    const { isReadOnly } = usePermissions();

    useMeta(generateMetadata('Tags'));

    const state = reactive({
      tagsList: [],
      selectedTag: null,
      searchText: '',

      pagination: {
        page: 1,
        limit: 50,
        offset: 0,
        count: 0,
        hasMore: true,
      },

      flags: {
        isInitialLoading: true,
        isLoadingMore: false,
      },

      modals: {
        showSaveTag: false,
        showDeleteTag: false,
      },
    });

    const getTagRgbaColor = (hexColor, alpha = 0.12) => {
      if (!hexColor) return `rgba(37, 99, 235, ${alpha})`;
      const rgb = colors.hexToRgb(hexColor);
      if (!rgb) return `rgba(37, 99, 235, ${alpha})`;
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    };

    const fetchTags = async (isInitial = true) => {
      try {
        if (isInitial) {
          state.flags.isInitialLoading = true;
          state.pagination.page = 1;
          state.pagination.offset = 0;
        }

        const params = {
          offset: 0,
          limit: state.pagination.limit,
        };

        if (state.searchText?.trim()) {
          params.search_text = state.searchText.trim();
        }

        const response = await getApiCall({
          endpoint: '/tags',
          params,
          includeWorkspace: true,
        });

        state.tagsList = response?.data || [];
        state.pagination.count = response?.count || state.tagsList.length;
        state.pagination.offset = response?.offset || 0;
        state.pagination.hasMore = !!response?.has_next
          && state.tagsList.length < (response?.count || Infinity);
      } catch (error) {
        appContext.config.globalProperties.$toast?.({
          warning: true,
          message: error.message || 'Failed to fetch tags',
        });
      } finally {
        state.flags.isInitialLoading = false;
      }
    };

    const debouncedFetchTags = debounce(() => {
      fetchTags(true);
    }, 350);

    const onSearchInput = () => {
      debouncedFetchTags();
    };

    const onClearSearch = () => {
      state.searchText = '';
      fetchTags(true);
    };

    const loadMoreTags = async () => {
      if (
        state.flags.isLoadingMore
        || state.flags.isInitialLoading
        || !state.pagination.hasMore
      ) {
        return;
      }

      try {
        state.flags.isLoadingMore = true;
        const nextOffset = state.tagsList.length;

        const params = {
          offset: nextOffset,
          limit: state.pagination.limit,
        };

        if (state.searchText?.trim()) {
          params.search_text = state.searchText.trim();
        }

        const response = await getApiCall({
          endpoint: '/tags',
          params,
          includeWorkspace: true,
        });

        const newItems = response?.data || [];
        if (newItems.length > 0) {
          state.tagsList = [...state.tagsList, ...newItems];
          state.pagination.offset = nextOffset;
          state.pagination.page += 1;
          state.pagination.count = response?.count || state.pagination.count;
          state.pagination.hasMore = !!response?.has_next
            && state.tagsList.length < (response?.count || Infinity);
        } else {
          state.pagination.hasMore = false;
        }
      } catch (error) {
        appContext.config.globalProperties.$toast?.({
          warning: true,
          message: error.message || 'Failed to load more tags',
        });
      } finally {
        state.flags.isLoadingMore = false;
      }
    };

    const loadMoreOptions = async (isVisible) => {
      if (
        isVisible
        && state.pagination.hasMore
        && !state.flags.isLoadingMore
        && !state.flags.isInitialLoading
      ) {
        await loadMoreTags();
      }
    };

    const onAddNewTag = () => {
      state.selectedTag = {};
      state.modals.showSaveTag = true;
    };

    const onEditTag = (tag) => {
      state.selectedTag = { ...tag };
      state.modals.showSaveTag = true;
    };

    const onDeleteTag = (tag) => {
      state.selectedTag = { ...tag };
      state.modals.showDeleteTag = true;
    };

    const onSuccessSaveTag = (savedTag) => {
      state.modals.showSaveTag = false;
      if (!savedTag) return;

      const existingIndex = state.tagsList.findIndex((t) => t.id === savedTag.id);
      if (existingIndex !== -1) {
        state.tagsList[existingIndex] = { ...savedTag };
      } else {
        state.tagsList.unshift(savedTag);
        state.pagination.count += 1;
      }
    };

    const onSuccessDeleteTag = (deletedTagId) => {
      state.modals.showDeleteTag = false;
      if (!deletedTagId) return;

      state.tagsList = state.tagsList.filter((t) => t.id !== deletedTagId);
      state.pagination.count = Math.max(0, state.pagination.count - 1);
    };

    onMounted(() => {
      fetchTags(true);
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isReadOnly,
      isMobileDevice,

      // methods
      loadMoreOptions,
      onSearchInput,
      onClearSearch,
      onEditTag,
      onAddNewTag,
      onDeleteTag,
      getTagRgbaColor,
      onSuccessSaveTag,
      onSuccessDeleteTag,
    };
  },
});
</script>

<style lang="scss" scoped>
.tags-settings {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;

  .tags-count-badge {
    font-size: 12px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 12px;
  }

  .settings-section-content {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;

    .tags-search-bar-wrapper {
      max-width: 720px;
      width: 100%;

      .tags-search-input {
        :deep(.q-field__control) {
          border-radius: 8px;
        }
      }
    }

    .tags-no-results-card {
      max-width: 720px;
      width: 100%;
      border-radius: 12px;
      border: 1px solid $blue-grey;
      background: $white;

      padding: 20px;

      .tags-no-result-header-text {
        color: $black;
        font-weight: 500;
        font-size: 16px;

        margin-bottom: 8px;
      }

      .tags-no-result-sub-text {
        color: rgba(var(--black-rgb), 0.8);
        margin-bottom: 12px;
      }
    }

    .tags-list-wrapper {
      overflow-y: auto;
      padding-bottom: 20px;
      flex: 1;
      display: flex;
      flex-direction: column;

      .tags-list-card {
        max-width: 720px;
        width: 100%;
        border-radius: 12px;
        border: 1px solid $blue-grey;
        background: $white;
        overflow: hidden;

        &.skeleton-card {
          padding: 4px 0;
        }

        .tag-item-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          border-bottom: 1px solid $grey-50;
          transition: background-color 0.15s ease;

          &:hover {
            background-color: rgba(var(--primary-rgb), 0.05);
          }

          &:last-child {
            border-bottom: none;
          }

          .tag-chip-wrapper {
            display: flex;
            align-items: center;

            .tag-chip {
              display: inline-flex;
              align-items: center;
              padding: 3px 8px;
              border-radius: 50px;
              font-size: 14px;
              font-weight: 500;
              line-height: 20px;
              border: 1px solid transparent;
              transition: transform 0.15s ease;

              &:hover {
                transform: translateY(-1px);
              }
            }
          }

          .tag-actions-wrapper {
            display: flex;
            align-items: center;
            gap: 8px;

            .tag-action-btn {
              color: $grey;
              border: 1px solid $blue-grey;
              border-radius: 8px;
              width: 32px;
              height: 32px;
              min-height: 32px;
              padding: 0;
              transition: all 0.15s ease;

              :deep(.tag-icon) {
                @include svg-icon-stroke('path', $grey);
              }

              &:hover {
                background: $grey-50;
                color: $black;
                border-color: rgba(var(--grey-100-rgb), 0.8);

                :deep(.tag-icon) {
                  @include svg-icon-stroke('path', $black);
                }
              }

              &.text-negative:hover {
                color: $negative;
                background: rgba(var(--negative-rgb), 0.08);
                border-color: rgba(var(--negative-rgb), 0.3);

                :deep(.tag-icon) {
                  @include svg-icon-stroke('path', rgba(var(--negative-rgb), 0.8));
                }
              }
            }
          }
        }
      }

      .tags-end-of-results {
        color: $grey;
        font-size: 13px;
        max-width: 720px;
      }
    }
  }
}
</style>
