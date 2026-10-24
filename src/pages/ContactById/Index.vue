<template>
  <div class="contact-by-id-page">
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
        :contactId="contactId"

        :contactName="contactDisplayName"
        @onSuccessfulDelete="onContactDeleted"
      />
    </q-dialog>

    <!-- Header -->
    <ContactByIdHeader
      v-if="hasContactData"

      :contactJson="contactOverviewData"
      @editContact="onEditContact"
      @deleteContact="modals.showDeleteContact = true"
    />

    <!-- Child Views (Overview, Inbox, Campaigns) -->
    <router-view
      v-if="hasContactData"
      :contactJson="contactOverviewData"
      :contactOverviewData="contactOverviewData"
    />
  </div>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, reactive, toRefs, computed, onMounted, getCurrentInstance, provide,
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
  },

  setup() {
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

      modals: {
        showEditContact: false,
        showDeleteContact: false,
      },
    });

    // computed
    const contactId = computed(() => route.params.contactId);

    const hasContactData = computed(() => !isEmpty(state.contactOverviewData?.contact));

    const contactDisplayName = computed(() => {
      const c = state.contactOverviewData?.contact;
      return `${c?.first_name || ''} ${c?.last_name || ''}`.trim() || c?.email || '';
    });

    // methods
    const redirectToNotFound = (message = 'Contact not found') => {
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
      if (!contactId.value) {
        redirectToNotFound();
        return;
      }

      try {
        state.isApiLoading = true;

        const response = await getApiCall({
          endpoint: `/contacts/${contactId.value}/overview`,
          includeWorkspace: true,
        });

        if (isEmpty(response) || isEmpty(response?.contact)) {
          redirectToNotFound();
          return;
        }

        state.contactOverviewData = response;

        const contactName = `${response.contact.first_name || ''} ${response.contact.last_name || ''}`.trim()
          || response.contact.email
          || 'Contact Details';

        useMeta(generateMetadata(`Contact: ${contactName}`));
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
    };

    const onContactDeleted = () => {
      state.modals.showDeleteContact = false;

      // navigate back to all contacts page
      router.push('/outreach/contacts/all');
    };

    // Provide contact overview data to child views
    provide('contactOverviewData', computed(() => state.contactOverviewData));
    provide('fetchContactOverview', fetchContactOverview);

    onMounted(() => {
      fetchContactOverview();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      contactId,
      hasContactData,
      isMobileDevice,
      contactDisplayName,

      // methods
      onEditContact,
      onContactUpdated,
      onContactDeleted,
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
}
</style>
