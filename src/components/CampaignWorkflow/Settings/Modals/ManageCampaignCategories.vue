<template>
  <q-card flat class="app-modal-card manage-categories-card">
    <q-form
      class="full-width"
      @submit.prevent.stop="onSubmit"
    >
      <!-- Modal Header -->
      <div class="app-modal-header">
        <!--  -->
        <div>
          <!-- Header title -->
          <h4 class="modal-header-text">
            Manage Reply Categories
          </h4>
        </div>

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

      <!-- Modal Content -->
      <div class="app-modal-content custom-scrollbar">
        <!-- Subtitle description -->
        <p class="reply-subtitle-text">
          Choose the reply categories that AI should automatically apply to incoming replies.
        </p>

        <!-- Search filter input -->
        <AppSearchInput
          v-model="searchText"
          class="search-filter-input"
          placeholder="Search list"
        />

        <!-- Categories Table Header -->
        <div class="categories-list-header">
          <span class="header-col-title">Reply Categories</span>
          <span class="header-col-title">Sentiments</span>
        </div>

        <!-- Loader while categories are fetching -->
        <div
          v-if="isLoading"
          class="loader-container"
        >
          <ApiLoader :show="true" />
        </div>

        <!-- Empty state if no categories found -->
        <div
          v-else-if="filteredCategories.length === 0"
          class="empty-state-text"
        >
          No reply categories found
        </div>

        <!-- Categories List -->
        <div
          v-else
          class="categories-list-body"
        >
          <div
            v-for="category in filteredCategories"
            :key="`reply-category-${category.id}`"

            class="category-row-item"
            @click="toggleCategory(category.id)"
          >
            <!-- Left: Checkbox + Category Name -->
            <div class="category-info-wrap">
              <q-checkbox
                dense
                class="app-checkbox"

                :model-value="isCategorySelected(category.id)"
                @update:model-value="() => toggleCategory(category.id)"
              />
              <span class="category-name-text">
                {{ category.name }}
              </span>
            </div>

            <!-- Right: Sentiment Indicator Badge -->
            <div class="sentiment-badge-wrap">
              <div
                class="sentiment-dot"
                :style="{
                  backgroundColor:
                      `var(--${REPLY_SENTIMENT[category.sentiment]?.color || 'positive'}-color)`,
                }"
              />

              <span class="sentiment-label-text">
                {{ category.sentiment }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="app-modal-footer">
        <q-btn
          no-caps
          unelevated

          label="Update"
          type="submit"
          color="primary"

          :loading="isSaving"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, onMounted, getCurrentInstance,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import AppSearchInput from 'components/Input/AppSearchInput.vue';

// Utils & API
import { getApiCall } from 'src/utils/apiRequests.js';
import { saveCampaignSettingsById } from 'src/utils/campaignApi';

// Constants
import { REPLY_SENTIMENT, MAX_AI_CATEGORIES_ALLOWED } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'ManageCampaignCategories',

  // Emits event to update campaign settings in parent workflow component
  emits: ['updateSettingsJson'],

  components: {
    ApiLoader,
    AppSearchInput,
  },

  props: {
    // Campaign ID for API updates
    campaignId: {
      type: [String, Number],
      required: true,
    },
    // Existing campaign settings passed down from parent
    campaignSettings: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // Vue app instance context for accessing global properties (e.g. $toast)
    const { appContext } = getCurrentInstance();

    // Reactive state
    const state = reactive({
      // List of fetched reply categories from backend
      categories: [],

      // Tracked selected category IDs (Array of IDs, e.g. [1, 2, 3])
      selectedCategoryIds: [],

      // Search text for filtering categories list
      searchText: '',

      // API request loaders
      isLoading: false,
      isSaving: false,
    });

    // Filter categories based on search input
    const filteredCategories = computed(() => {
      if (!state.searchText) {
        return state.categories;
      }
      const query = state.searchText.toLowerCase().trim();
      return state.categories.filter((cat) => cat.name?.toLowerCase().includes(query));
    });

    // Check whether a category ID is currently selected
    const isCategorySelected = (catId) => state.selectedCategoryIds.includes(catId);

    // Toggle selection status for a category ID in selectedCategoryIds array
    const toggleCategory = (catId) => {
      const index = state.selectedCategoryIds.indexOf(catId);
      if (index > -1) {
        state.selectedCategoryIds.splice(index, 1);
      } else if (state.selectedCategoryIds.length < MAX_AI_CATEGORIES_ALLOWED) {
        state.selectedCategoryIds.push(catId);
      } else {
        // show warning
        appContext.config.globalProperties.$toast?.({
          warning: true,
          message: `You can select a maximum of ${MAX_AI_CATEGORIES_ALLOWED} categories`,
        });
      }
    };

    // Helper to safely parse props.campaignSettings.categories into an array of IDs
    const initSelectedCategoryIds = () => {
      const existing = props.campaignSettings?.categories;

      if (Array.isArray(existing)) {
        state.selectedCategoryIds = existing.map((item) => (typeof item === 'object' ? item.id : item));
      } else if (existing && typeof existing === 'object') {
        state.selectedCategoryIds = Object.keys(existing)
          .filter((key) => !!existing[key])
          .map((key) => (Number.isNaN(Number(key)) ? key : Number(key)));
      } else {
        state.selectedCategoryIds = [];
      }
    };

    // Fetch reply categories from backend API
    const fetchReplyCategories = async () => {
      try {
        state.isLoading = true;

        const response = await getApiCall({
          params: { limit: 40 },
          includeWorkspace: true,
          endpoint: '/reply-categories',
        });

        if (response && response.data) {
          state.categories = response.data;
        }
      } catch (error) {
        appContext.config.globalProperties.$toast?.({
          warning: true,
          message: error.message || 'Failed to fetch reply categories',
        });
      } finally {
        state.isLoading = false;
      }
    };

    // Form submit handler: persists updated selected category IDs (array) to campaign settings API
    const onSubmit = async () => {
      state.isSaving = true;

      const categories = {};
      state.selectedCategoryIds.forEach((catId) => {
        categories[catId] = true;
      });

      const payload = {
        ...props.campaignSettings,
        categories,
      };

      const response = await saveCampaignSettingsById({
        payload,
        campaignId: props.campaignId,
        $toast: appContext.config.globalProperties.$toast,
      });

      if (response) {
        emit('updateSettingsJson', {
          inputJson: payload,
          callUpdateApi: false,
        });
      }

      state.isSaving = false;
    };

    // Lifecycle hook: initialize selected state and fetch available categories
    onMounted(() => {
      initSelectedCategoryIds();
      fetchReplyCategories();
    });

    return {
      // Export state & computed
      ...toRefs(state),
      filteredCategories,

      // Methods
      isCategorySelected,
      toggleCategory,
      onSubmit,

      // Constants
      REPLY_SENTIMENT,
    };
  },
});
</script>

<style lang="scss" scoped>
.manage-categories-card {
  max-width: 640px;
  width: 100%;

  .app-modal-content {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .reply-subtitle-text {
      color: $black;
      font-size: 14px;
      line-height: 16px;
    }

    .search-filter-input {
      width: 100%;
    }

    .categories-list-header {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 8px 12px;
      border-radius: 4px;
      background-color: rgba(var(--grey-50-rgb), 0.5);

      .header-col-title {
        font-weight: 500;
        font-size: 13px;
        color: $grey;
        width: 40%;

        &:first-child {
          width: 60%;
        }
      }
    }

    .loader-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 150px;
      position: relative;
    }

    .empty-state-text {
      text-align: center;
      padding: 24px;
      color: $grey-6;
      font-size: 14px;
    }

    .categories-list-body {
      display: flex;
      flex-direction: column;
      max-height: 400px;
      overflow-y: auto;

      .category-row-item {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        border-bottom: 1px solid $grey-3;
        cursor: pointer;

        gap: 16px;

        &:hover {
          background-color: $grey-1;
        }

        &:last-child {
          border-bottom: none;
        }

        .category-info-wrap {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 60%;

          .category-name-text {
            font-size: 14px;
            color: $black;
          }
        }

        .sentiment-badge-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 40%;

          .sentiment-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
          }

          .sentiment-label-text {
            font-size: 14px;
            color: $black;
          }
        }
      }
    }
  }
}
</style>
