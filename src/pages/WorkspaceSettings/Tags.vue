<template>
  <div class="tags-settings">
    <!-- Header -->
    <div class="settings-section-header">
      <!-- Left Side -->
      <div class="settings-header-left-side">
        <!-- Header Text -->
        <div class="flex items-center gap-sm">
          <p class="settings-header-text">
            Tags
          </p>
        </div>

        <!-- Label Text -->
        <p class="settings-label-text">
          Organize your mailboxes, campaigns and contact lists using tags.
        </p>
      </div>

      <!-- Right Side -->
      <div
        v-if="allTagsCount > 0 || searchText"
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

          <div class="text-no-wrap flex items-center no-wrap gap-xs">
            <q-icon name="add" size="18px" />
            <div>Create Tag</div>
          </div>
        </q-btn>
      </div>
    </div>

    <!-- Content -->
    <div class="settings-section-content q-mt-md">
      <!-- Search Filter Bar -->
      <div
        v-if="allTagsCount > 0 || searchText || isInitialLoading"
        class="tags-search-bar-wrapper q-mb-md"
      >
        <AppSearchInput
          v-model="searchText"
          clearable
          placeholder="Search tags by name..."
        />
      </div>

      <!-- Initial Spinner Loader -->
      <div
        v-if="isInitialLoading"
        class="tags-list-card skeleton-card flex flex-center q-pa-lg"
      >
        <q-spinner-dots size="32px" color="primary" />
      </div>

      <!-- Global Empty State Illustration (No tags created yet) -->
      <AllTagsIllustration
        v-else-if="allTagsCount === 0 && !searchText"
        @onCreateTag="onAddNewTag"
      />

      <!-- Search No Results State -->
      <div
        v-else-if="filteredTagsList.length === 0 && searchText"
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

      <!-- Tags List -->
      <div
        v-else
        class="tags-list-wrapper hide-scrollbar"
      >
        <div class="tags-list-card">
          <div
            v-for="tag in filteredTagsList"
            :key="`tags-${tag.id}`"
            class="tag-item-row"
          >
            <!-- Left: Tag Chip -->
            <PreviewTag
              :name="tag.name"
              :color="tag.color"
            />

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
// vue
import {
  defineComponent,
  reactive,
  toRefs,
  computed,
  onMounted,
} from 'vue';

// quasar
import { useMeta, colors } from 'quasar';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';
import { usePermissions } from 'src/composables/usePermissions';

// pinia store
import { useTagsStore } from 'src/stores/tags';

// components
import AppTooltip from 'components/General/AppTooltip.vue';
import AllTagsIllustration from 'components/Illustrations/AllTags.vue';
import SaveTagModal from 'components/Tags/Modals/SaveTag.vue';
import DeleteTagModal from 'components/Tags/Modals/DeleteTag.vue';
import AppSearchInput from 'src/components/Input/AppSearchInput.vue';
import PreviewTag from 'components/Tags/PreviewTag.vue';

export default defineComponent({
  name: 'TagsManager',

  components: {
    AppTooltip,
    AllTagsIllustration,
    SaveTagModal,
    DeleteTagModal,
    AppSearchInput,
    PreviewTag,
  },

  setup() {
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();
    const { isReadOnly } = usePermissions();
    const tagsStorePinia = useTagsStore();

    useMeta(generateMetadata('Tags'));

    const state = reactive({
      selectedTag: null,
      searchText: '',

      modals: {
        showSaveTag: false,
        showDeleteTag: false,
      },
    });

    // computed from store
    const isInitialLoading = computed(
      () => tagsStorePinia.getIsApiLoading && !tagsStorePinia.hasFetchedOnce,
    );
    const storeTagsList = computed(() => tagsStorePinia.getTagsList || []);
    const allTagsCount = computed(() => storeTagsList.value.length);

    // Instant in-memory search across cached Pinia tags
    const filteredTagsList = computed(() => {
      if (!state.searchText?.trim()) {
        return storeTagsList.value;
      }
      const search = state.searchText.trim().toLowerCase();
      return storeTagsList.value.filter((t) => t.name?.toLowerCase().includes(search));
    });

    const getTagRgbaColor = (hexColor, alpha = 0.12) => {
      if (!hexColor) return `rgba(37, 99, 235, ${alpha})`;
      const rgb = colors.hexToRgb(hexColor);
      if (!rgb) return `rgba(37, 99, 235, ${alpha})`;
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    };

    const onClearSearch = () => {
      state.searchText = '';
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

    const onSuccessSaveTag = () => {
      state.modals.showSaveTag = false;
    };

    const onSuccessDeleteTag = () => {
      state.modals.showDeleteTag = false;
    };

    onMounted(() => {
      tagsStorePinia.fetchTags();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isReadOnly,
      isMobileDevice,
      isInitialLoading,
      allTagsCount,
      filteredTagsList,

      // methods
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

  .settings-header-left-side {
    margin-right: 12px;
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

          min-height: 62px;

          &:last-child {
            border-bottom: none;
          }

          .tag-actions-wrapper {
            display: none;
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
              background: $white;

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

          &:hover {
            background-color: rgba(var(--primary-rgb), 0.05);

            .tag-actions-wrapper {
              display: flex;
            }
          }
        }
      }
    }
  }
}
</style>
