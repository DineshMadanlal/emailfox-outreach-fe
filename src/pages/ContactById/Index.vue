<template>
  <div class="contact-by-id-page">
    <!-- API Loader -->
    <ApiLoader
      :show="isApiLoading && !hasContactData"
    />

    <!-- Header -->
    <ContactByIdHeader
      v-if="hasContactData"

      :contactJson="contactOverviewData"
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

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { getApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'ContactById',

  components: {
    ApiLoader,
    ContactByIdHeader,
  },

  setup() {
    // app context
    const { appContext } = getCurrentInstance();

    // composables
    const { generateMetadata } = useAppHelpersApi();

    // router
    const route = useRoute();
    const router = useRouter();

    // state
    const state = reactive({
      contactOverviewData: null,
      isApiLoading: false,
    });

    // computed
    const contactId = computed(() => route.params.contactId);

    const hasContactData = computed(() => !isEmpty(state.contactOverviewData?.contact));

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
      hasContactData,
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
