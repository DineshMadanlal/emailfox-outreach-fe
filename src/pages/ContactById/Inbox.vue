<template>
  <div
    class="contact-inbox-page"
    :class="{ 'is-mobile': isMobileDevice }"
  >
    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="contact-inbox-loading flex flex-center full-width full-height q-pa-xl"
    >
      <ApiLoader show />
    </div>

    <!-- Empty State: No Campaigns -->
    <div
      v-else-if="campaigns.length === 0"
      class="contact-inbox-empty flex flex-center column full-width full-height q-pa-xl text-center"
    >
      <LocalSvgIcon
        image="master-inbox"
        :isIconFolder="false"
        :isIllustrationFolder="true"
        class="empty-state-illustration q-mb-md"
      />
      <h6 class="text-weight-medium text-grey-8 q-my-none">
        No Inbox Campaigns Found
      </h6>
      <p class="text-grey-6 text-body2 q-mt-xs">
        This contact does not have any campaigns with inbox activity yet.
      </p>
    </div>

    <!-- Active Dual-Pane View -->
    <div
      v-else
      class="contact-inbox-content-wrapper full-width full-height flex no-wrap"
    >
      <!-- Left: Campaigns Sidebar -->
      <div
        v-show="!isMobileDevice || !showMobileConversation"
        class="contact-inbox-campaigns-sidebar hide-scrollbar"
      >
        <div class="campaigns-list-wrapper">
          <div
            v-for="campaign in campaigns"
            :key="`contact-inbox-campaign-${campaign.seq_id || campaign.contact_mapping_id}`"
            class="campaign-list-item flex items-center no-wrap"
            :class="{
              'is-active': isCampaignActive(campaign),
            }"
            @click="selectCampaign(campaign)"
          >
            <!-- Active Indicator Bar -->
            <div class="active-indicator" />

            <!-- Campaign Megaphone Icon -->
            <LocalSvgIcon
              image="sequence"
              class="campaign-item-icon q-mr-sm"
            />

            <!-- Campaign Name -->
            <span
              class="campaign-item-name ellipsis"
              :title="campaign.seq_name"
            >
              {{ campaign.seq_name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Right: Conversation Preview Pane -->
      <div
        v-show="!isMobileDevice || showMobileConversation"
        class="contact-inbox-conversation-pane"
      >
        <!-- Mobile Back Header -->
        <div
          v-if="isMobileDevice && showMobileConversation"
          class="mobile-back-header flex items-center q-px-md q-py-sm"
        >
          <q-btn
            flat
            dense
            no-caps
            icon="arrow_back"
            color="primary"
            label="Back to Campaigns"
            class="q-mr-sm"
            @click="showMobileConversation = false"
          />
          <span class="text-weight-medium text-body2 ellipsis">
            {{ selectedCampaign?.seq_name }}
          </span>
        </div>

        <!-- Conversation Messages Component -->
        <UniboxConversationPreview
          v-if="selectedCampaign"

          :hideToolbarForContactView="true"
          :threadJson="selectedCampaign"

          @update:reply-category="handleReplyCategoryUpdate"
        />

        <div
          v-else
          class="no-selection-placeholder flex flex-center column full-height q-pa-xl text-center"
        >
          <p class="text-grey-6 text-body1 q-my-none">
            Select a campaign to view messages
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, watch, onMounted, getCurrentInstance,
} from 'vue';

// router
import { useRoute } from 'vue-router';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import UniboxConversationPreview from 'components/Unibox/Conversation/ConversationPreview.vue';

// store pinia
import { useUniboxStore } from 'src/stores/unibox.js';

// utils
import { fetchContactInboxCampaigns, updateUniboxThreadReplyCategory } from 'src/utils/unibox';

export default defineComponent({
  name: 'ContactInbox',

  components: {
    ApiLoader,
    UniboxConversationPreview,
  },

  props: {
    contactJson: {
      type: Object,
      default: () => ({}),
    },
    contactOverviewData: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    // store
    const uniboxPinia = useUniboxStore();

    // app context and route
    const { appContext } = getCurrentInstance();
    const route = useRoute();

    // app helpers composable
    const { isMobileDevice } = useAppHelpersApi();

    // Contact ID extracted from prop or route
    const contactId = computed(() => (
      props.contactJson?.id
      || props.contactOverviewData?.contact?.id
      || route.params.contactId
    ));

    const state = reactive({
      campaigns: [],
      selectedCampaign: null,
      isLoading: false,
      showMobileConversation: false,
    });

    // Determine if given campaign matches currently selected item
    const isCampaignActive = (campaign) => {
      if (!state.selectedCampaign || !campaign) return false;

      if (campaign.contact_mapping_id && state.selectedCampaign.contact_mapping_id) {
        return campaign.contact_mapping_id === state.selectedCampaign.contact_mapping_id;
      }

      return String(campaign.seq_id) === String(state.selectedCampaign.seq_id);
    };

    // User click handler on campaign item
    const selectCampaign = (campaign) => {
      state.selectedCampaign = campaign;
      if (isMobileDevice.value) {
        state.showMobileConversation = true;
      }
    };

    // Fetch inbox campaigns for contact
    const fetchCampaigns = async () => {
      if (!contactId.value) return;

      try {
        state.isLoading = true;

        const response = await fetchContactInboxCampaigns({
          contactId: contactId.value,
        });

        const list = Array.isArray(response) ? response : (response?.data || []);
        state.campaigns = list;

        // Auto-select first campaign or maintain previous match
        if (list.length > 0) {
          const matchedItem = list.find((c) => (
            (c.contact_mapping_id
              && c.contact_mapping_id === state.selectedCampaign?.contact_mapping_id)
            || (c.seq_id && String(c.seq_id) === String(state.selectedCampaign?.seq_id))
          ));

          state.selectedCampaign = matchedItem || list[0];
        } else {
          state.selectedCampaign = null;
        }
      } catch (error) {
        appContext.config.globalProperties.$toast?.({
          warning: true,
          message: error.message || 'Failed to fetch inbox campaigns for contact',
        });
        state.campaigns = [];
        state.selectedCampaign = null;
      } finally {
        state.isLoading = false;
      }
    };

    // Handle manual reply category updates from conversation toolbar
    const handleReplyCategoryUpdate = async (newValue) => {
      if (!state.selectedCampaign) return;

      const targetId = state.selectedCampaign.contact_mapping_id;
      const previousCategoryId = state.selectedCampaign.reply_category_id;
      const previousAiCategorised = state.selectedCampaign.is_ai_auto_categorised;
      const previousAiResult = state.selectedCampaign.ai_auto_categorised_result;
      const clearCategory = !newValue;

      // Optimistic update of selectedCampaign
      state.selectedCampaign = {
        ...state.selectedCampaign,
        reply_category_id: newValue || null,
        is_ai_auto_categorised: false,
        ai_auto_categorised_result: null,
      };

      // Also update matching campaign in list
      const idx = state.campaigns.findIndex((c) => (
        (c.contact_mapping_id && c.contact_mapping_id === targetId)
        || (c.seq_id && String(c.seq_id) === String(state.selectedCampaign?.seq_id))
      ));
      if (idx !== -1) {
        state.campaigns[idx] = {
          ...state.campaigns[idx],
          reply_category_id: newValue || null,
          is_ai_auto_categorised: false,
          ai_auto_categorised_result: null,
        };
      }

      if (targetId) {
        try {
          await updateUniboxThreadReplyCategory({
            contactMappingId: targetId,
            replyCategoryId: newValue || null,
            clearReplyCategory: clearCategory,
          });
        } catch (error) {
          // Revert optimistic update on failure
          if (state.selectedCampaign) {
            state.selectedCampaign = {
              ...state.selectedCampaign,
              reply_category_id: previousCategoryId,
              is_ai_auto_categorised: previousAiCategorised,
              ai_auto_categorised_result: previousAiResult,
            };
          }
          if (idx !== -1) {
            state.campaigns[idx] = {
              ...state.campaigns[idx],
              reply_category_id: previousCategoryId,
              is_ai_auto_categorised: previousAiCategorised,
              ai_auto_categorised_result: previousAiResult,
            };
          }
          appContext.config.globalProperties.$toast?.({
            warning: true,
            message: error.message || 'Failed to update reply category',
          });
        }
      }
    };

    // Reload when contact ID changes
    watch(contactId, (newId, oldId) => {
      if (newId && newId !== oldId) {
        fetchCampaigns();
      }
    });

    onMounted(() => {
      fetchCampaigns();

      uniboxPinia.fetchReplyCategories({ force: true });
    });

    return {
      // state
      ...toRefs(state),

      // computed
      contactId,
      isMobileDevice,

      // methods
      isCampaignActive,
      selectCampaign,
      fetchCampaigns,
      handleReplyCategoryUpdate,
    };
  },
});
</script>

<style lang="scss" scoped>
.contact-inbox-page {
  width: 100%;
  flex: 1;
  display: flex;
  min-height: 0;
  position: relative;
  background-color: $white;

  .contact-inbox-loading,
  .contact-inbox-empty {
    width: 100%;
    min-height: 350px;

    .empty-state-illustration {
      width: 180px;
      height: 180px;
    }
  }

  .contact-inbox-content-wrapper {
    height: 100%;
    min-height: 0;
  }

  // Left Section
  .contact-inbox-campaigns-sidebar {
    height: 100%;
    width: 280px;
    min-width: 240px;
    max-width: 320px;
    flex-shrink: 0;
    overflow-y: auto;
    background-color: $white;
    border-right: 1px solid $grey-50;

    .campaigns-list-wrapper {
      display: flex;
      flex-direction: column;
      padding: 8px 0;
    }

    .campaign-list-item {
      position: relative;
      cursor: pointer;
      height: 56px;
      padding: 0 16px 0 12px;
      transition: background-color 0.15s ease, color 0.15s ease;
      color: $grey-800;

      .active-indicator {
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background-color: transparent;
        transition: background-color 0.15s ease;
      }

      :deep(.campaign-item-icon) {
        width: 18px;
        height: 18px;
        flex-shrink: 0;

        @include svg-icon-stroke('path, circle, rect', $grey);
      }

      .campaign-item-name {
        font-size: 14px;
        line-height: 20px;
        font-weight: 400;

        color: $black;
        flex: 1;
      }

      &:hover {
        background-color: $grey-50;
      }

      &.is-active {
        background-color: #EFF6FF;

        .active-indicator {
          background-color: $primary;
        }

        :deep(.campaign-item-icon) {
          @include svg-icon-stroke('path, circle, rect', $primary);
        }

        .campaign-item-name {
          color: $primary;
          font-weight: 500;
        }
      }
    }
  }

  // Right Section
  .contact-inbox-conversation-pane {
    flex: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: #F8FAFC;

    .mobile-back-header {
      background-color: $white;
      border-bottom: 1px solid $grey-50;
      flex-shrink: 0;
    }

    :deep(.unibox-conversation-preview) {
      height: 100%;
      min-height: 0;
      flex: 1;
    }
  }

  &.is-mobile {
    height: auto;

    .contact-inbox-campaigns-sidebar {
      width: 100%;
      max-width: 100%;
      border-right: none;
    }
  }
}
</style>
