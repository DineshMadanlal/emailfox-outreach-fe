<template>
  <div class="domain-by-id-page">
    <!-- Required to check if the page is scrolled. We use the boolean as a condition
    to show border if required -->
    <q-intersection
      @visibility="onVisibilityChange"
    >
    </q-intersection>

    <!-- Dialog -->
    <q-dialog
      v-model="showDeleteDomainModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteDomains
        :selectedDomains="[{ id: domainByJson.id }]"
        @onSuccessfulDeleteDomains="onSuccessfulDeleteDomains"
      />
    </q-dialog>

    <!-- Api loader -->
    <ApiLoader :show="fetchApiLoading" />

    <!-- Header -->
    <DomainByIdHeader
      v-if="domainByJson.id"
      :domainByJson="domainByJson"
      :isPageScrolled="isPageScrolled"

      @deleteDomain="onDeleteDomain"
    />

    <!-- Domain by ID -->
    <router-view
      v-if="domainByJson.id"

      :domainByJson="domainByJson"

      @updateAuthReports="onUpdateAuthReports"
    />
  </div>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  defineComponent, onMounted, reactive, toRefs, computed, getCurrentInstance,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// router
import { useRoute, useRouter } from 'vue-router';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { convertStringToNumber } from 'src/utils/numbers';
import { getDomainById } from 'src/utils/domainMailboxesApi';

// Components
import ApiLoader from 'src/components/General/ApiLoader.vue';
import DomainByIdHeader from 'components/DomainById/Header.vue';
import DeleteDomains from 'components/Domains/Modals/DeleteDomains.vue';

export default defineComponent({
  name: 'DomainById',

  components: {
    ApiLoader,
    DomainByIdHeader,
    DeleteDomains,
  },

  setup() {
    // current instance
    const { appContext } = getCurrentInstance();

    // composition API
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // router
    const $route = useRoute();
    const $router = useRouter();

    // state
    const state = reactive({
      isPageScrolled: false,

      domainByJson: {},
      fetchApiLoading: false,

      // modals
      showDeleteDomainModal: false,
    });

    // computed
    const domainId = computed(() => convertStringToNumber($route.params.domainId));

    // methods
    const onVisibilityChange = (isVisible) => {
      state.isPageScrolled = !isVisible;
    };

    const onUpdateAuthReports = (responseJson) => {
      const {
        dns_errors,
        spf_pass,
        dkim_pass,
        dmarc_pass,
      } = responseJson.domain;

      state.domainByJson = {
        ...state.domainByJson,
        dns_errors,
        spf_pass,
        dkim_pass,
        dmarc_pass,
      };

      appContext.config.globalProperties.$toast({
        message: 'Authentication reports updated',
      });
    };

    const makeApiCallOnMounted = async () => {
      try {
        state.fetchApiLoading = true;

        // make api call
        const response = await getDomainById(domainId.value);

        if (isEmpty(response)) {
          // show error warning
          appContext.config.globalProperties.$toast({
            warning: true,
            message: 'Domain Not Found',
          });

          // Push to error page
          $router.push('/outreach/domain-not-found');
        } else {
          state.domainByJson = response;

          // metadata
          useMeta(generateMetadata(state.domainByJson.domain_name));
        }
      } catch (error) {
        // show error warning
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });

        // Push to error page
        $router.push('/outreach/domain-not-found');
      } finally {
        state.fetchApiLoading = false;
      }
    };

    const onDeleteDomain = () => {
      state.showDeleteDomainModal = true;
    };

    const onSuccessfulDeleteDomains = () => {
      state.showDeleteDomainModal = false;

      // Push to the previous page
      $router.go(-1);
    };

    // lifecycle hooks
    onMounted(() => {
      makeApiCallOnMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,

      // methods
      onDeleteDomain,
      onVisibilityChange,
      onUpdateAuthReports,
      onSuccessfulDeleteDomains,
    };
  },
});
</script>

<style lang="scss" scoped>
.domain-by-id-page {
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
}
</style>
