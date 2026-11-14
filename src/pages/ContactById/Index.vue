<template>
  <q-card
    flat
    :class="[
      'contact-by-id-page',
      { 'contact-by-id-drawer-mode app-modal-card custom-scrollbar': isModal },
    ]"
  >
    <!-- API Loader -->
    <ApiLoader
      :show="isApiLoading && !hasContactData"
    />

    <!-- Edit Contact Modal -->
    <q-dialog
      v-model="modals.showEditContact"
      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"
      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveContact
        :contactJson="contactOverviewData?.contact"
        @onSuccessfulUpdateContact="onContactUpdated"
      />
    </q-dialog>

    <!-- Delete Contact Modal -->
    <q-dialog
      v-model="modals.showDeleteContact"
      class="app-modal-dialog"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteContactById
        :contactId="effectiveContactId"
        :contactName="contactDisplayName"
        @onSuccessfulDelete="onContactDeleted"
      />
    </q-dialog>

    <!-- Header -->
    <ContactByIdHeader
      v-if="hasContactData || isModal"

      :isModal="isModal"
      v-model:activeTab="activeTab"
      :contactJson="headerContactJson"
      :contactId="effectiveContactId"
      :hideCampaignsTab="hideCampaignsTab"

      @editContact="onEditContact"
      @deleteContact="modals.showDeleteContact = true"

      @closeModal="$emit('closeModal')"
    />

    <!-- Modal View: In-Memory Tab Panels -->
    <div
      v-if="isModal"
      class="app-modal-content drawer-body-container custom-scrollbar"
    >
      <!-- Loading indicator while loading in drawer without cached row -->
      <div
        v-if="isApiLoading && !contactOverviewData"
        class="drawer-loading-box flex flex-center full-height full-width q-pa-xl"
      >
        <ApiLoader show />
      </div>

      <q-tab-panels
        v-else
        v-model="activeTab"
        animated
        keep-alive
        class="drawer-tab-panels"
      >
        <!-- Overview Tab -->
        <q-tab-panel
          name="overview"
          class="q-pa-none drawer-tab-panel"
        >
          <ContactOverview
            :contactId="effectiveContactId"
            :contactOverviewData="contactOverviewData"
          />
        </q-tab-panel>

        <!-- Inbox Tab -->
        <q-tab-panel
          name="inbox"
          class="q-pa-none drawer-tab-panel"
        >
          <ContactInbox
            :contactId="effectiveContactId"
            :campaignId="effectiveCampaignId"
            :contactJson="contactOverviewData"
            :initialCampaignId="effectiveCampaignId"
            :contactOverviewData="contactOverviewData"

            @update:replyCategory="handleReplyCategoryUpdate"
          />
        </q-tab-panel>

        <!-- Campaigns Tab -->
        <q-tab-panel
          v-if="!hideCampaignsTab"
          name="campaigns"
          class="q-pa-none drawer-tab-panel"
        >
          <ContactCampaigns
            :contactId="effectiveContactId"
            :contactJson="contactOverviewData"
            :contactOverviewData="contactOverviewData"
          />
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- Full-Page View: Child Views (Overview, Inbox, Campaigns) -->
    <router-view
      v-else-if="hasContactData"

      :contactId="effectiveContactId"
      :contactJson="contactOverviewData"
      :contactOverviewData="contactOverviewData"
    />
  </q-card>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, reactive, toRefs, computed, onMounted,
  getCurrentInstance, provide, watch,
} from 'vue';

// router
import { useRoute, useRouter } from 'vue-router';

// quasar
import { useMeta } from 'quasar';

// components
import ApiLoader from 'components/General/ApiLoader.vue';
import ContactByIdHeader from 'components/ContactById/Header.vue';
import SaveContact from 'components/Contacts/Modals/SaveContact.vue';
import DeleteContactById from 'components/Contacts/Modals/DeleteContactById.vue';
import ContactOverview from 'src/pages/ContactById/Overview.vue';
import ContactInbox from 'src/pages/ContactById/Inbox.vue';
import ContactCampaigns from 'src/pages/ContactById/Campaigns.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { getApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'ContactById',

  components: {
    ApiLoader,
    SaveContact,
    ContactByIdHeader,
    DeleteContactById,
    ContactOverview,
    ContactInbox,
    ContactCampaigns,
  },

  props: {
    contactId: {
      type: [String, Number],
      default: null,
    },
    campaignId: {
      type: [String, Number],
      default: null,
    },
    isModal: {
      type: Boolean,
      default: false,
    },
    hideCampaignsTab: {
      type: Boolean,
      default: false,
    },
    defaultTab: {
      type: String,
      default: 'overview',
    },
    contactRow: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: [
    'closeModal',
    'update:replyCategory',
    'contactDeleted',
    'contactUpdated',
  ],

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // composables
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // router
    const route = useRoute();
    const router = useRouter();

    // state
    const state = reactive({
      contactOverviewData: null,
      isApiLoading: false,
      activeTab: props.defaultTab || 'overview',

      modals: {
        showEditContact: false,
        showDeleteContact: false,
      },
    });

    // computed
    const effectiveContactId = computed(() => (
      props.contactId
      || props.contactRow?.contact_id
      || props.contactRow?.id
      || route.params.contactId
      || null
    ));

    const effectiveCampaignId = computed(() => (
      props.campaignId
      || route.params.campaignId
      || null
    ));

    const rawContact = computed(() => (
      state.contactOverviewData?.contact || props.contactRow || {}
    ));

    const hasContactData = computed(() => (
      !isEmpty(state.contactOverviewData?.contact) || !isEmpty(props.contactRow)
    ));

    const contactDisplayName = computed(() => {
      const c = rawContact.value;
      const firstName = (c.first_name || '').trim();
      const lastName = (c.last_name || '').trim();
      const fullName = `${firstName} ${lastName}`.trim();

      return fullName || c.contact_email || c.email || '';
    });

    const headerContactJson = computed(() => {
      if (state.contactOverviewData) {
        return {
          ...state.contactOverviewData,
          status: props.contactRow?.status || state.contactOverviewData?.status,
        };
      }
      if (!isEmpty(props.contactRow)) {
        return {
          contact: props.contactRow,
          status: props.contactRow?.status,
        };
      }
      return null;
    });

    // methods
    const redirectToNotFound = (message = 'Contact not found') => {
      if (props.isModal) {
        appContext.config.globalProperties.$toast?.({
          warning: true,
          message,
        });

        emit('closeModal');
        return;
      }

      appContext.config.globalProperties.$toast({
        warning: true,
        message,
      });

      router.push({
        path: '/404',
        query: {
          message,
          redirect: '/outreach/contacts/all',
        },
      });
    };

    const fetchContactOverview = async () => {
      if (!effectiveContactId.value) {
        if (!props.isModal) {
          redirectToNotFound();
        }

        return;
      }

      try {
        state.isApiLoading = true;

        const response = await getApiCall({
          endpoint: `/contacts/${effectiveContactId.value}/overview`,
          includeWorkspace: true,
        });

        if (isEmpty(response) || isEmpty(response?.contact)) {
          redirectToNotFound();
          return;
        }

        state.contactOverviewData = response;

        if (!props.isModal) {
          const first = response.contact.first_name || '';
          const last = response.contact.last_name || '';

          const contactName = `${first} ${last}`.trim()
            || response.contact.email
            || 'Contact Details';

          useMeta(generateMetadata(`Contact: ${contactName}`));
        }
      } catch (error) {
        //
        redirectToNotFound(error.message || 'Contact not found');
      } finally {
        state.isApiLoading = false;
      }
    };

    const onEditContact = async () => {
      state.modals.showEditContact = true;
    };

    const onContactUpdated = () => {
      state.modals.showEditContact = false;

      fetchContactOverview();

      if (props.isModal) {
        emit('contactUpdated');
      }
    };

    const onContactDeleted = () => {
      state.modals.showDeleteContact = false;

      if (props.isModal) {
        emit('closeModal');
        emit('contactDeleted', effectiveContactId.value);
      } else {
        router.push('/outreach/contacts/all');
      }
    };

    const handleReplyCategoryUpdate = (newCategoryId) => {
      emit('update:replyCategory', newCategoryId);
    };

    // Provide contact overview data and contact ID to child views
    provide('contactId', effectiveContactId);
    provide('campaignId', effectiveCampaignId);
    provide('fetchContactOverview', fetchContactOverview);
    provide('contactOverviewData', computed(() => state.contactOverviewData));

    onMounted(() => {
      fetchContactOverview();
    });

    // Watchers
    watch(
      () => props.defaultTab,
      (newTab) => {
        if (newTab) {
          state.activeTab = newTab;
        }
      },
    );

    watch(
      effectiveContactId,
      (newId, oldId) => {
        if (newId && newId !== oldId) {
          fetchContactOverview();
        }
      },
    );

    watch(
      () => props.contactRow,
      (newRow) => {
        if (newRow && (newRow.id || newRow.contact_id)) {
          fetchContactOverview();
        }
      },
      { deep: true },
    );

    return {
      // state
      ...toRefs(state),

      // computed
      effectiveContactId,
      effectiveCampaignId,
      hasContactData,
      isMobileDevice,
      contactDisplayName,
      headerContactJson,

      // methods
      onEditContact,
      onContactUpdated,
      onContactDeleted,
      handleReplyCategoryUpdate,
    };
  },
});
</script>

<style lang="scss" scoped>
.contact-by-id-page {
  width: 100%;
  flex: 1;
  display: flex;
  min-height: 0;
  flex-direction: column;
  position: relative;
  overflow-y: scroll;

  &.contact-by-id-drawer-mode {
    max-width: 1080px;
    height: 100%;
    max-height: 100vh;
    overflow: hidden;
    background-color: $white;

    @media (min-width: $breakpoint-sm-min) {
      width: 1080px;
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }

    @media (min-width: 601px) {
      border-radius: 8px 0px 0px 8px !important;
    }

    @media (min-width: 601px) and (max-width: 1100px) {
      width: calc(100vw - 32px);
    }

    .drawer-body-container {
      padding: 0px;
      flex: 1;
      min-height: 0;
      overflow-y: auto;
    }

    .drawer-tab-panels {
      background: transparent;
      height: 100%;

      .drawer-tab-panel {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
    }
  }
}
</style>
