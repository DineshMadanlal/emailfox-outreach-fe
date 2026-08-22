<template>
  <div class="domain-settings-container">
    <!-- Modal: Edit Custom Tracking Domain -->
    <q-dialog
      v-model="modals.showEditCustomTrackingDomainModal"
      class="app-modal-dialog"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <EditCustomTrackingDomain
        :domainByJson="domainByJson"
        @onSuccessfulUpdate="onSuccessfulUpdateCustomTrackingDomain"
      />
    </q-dialog>

    <!-- Modal: Edit DKIM Selector -->
    <q-dialog
      v-model="modals.showEditDkimSelectorModal"
      class="app-modal-dialog"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <EditDkimSelector
        :domainByJson="domainByJson"
        @onSuccessfulUpdate="onSuccessfulUpdateDkimSelector"
      />
    </q-dialog>

    <!-- DKIM Selector Section with Authentication Reports -->
    <DkimSelector
      :domainByJson="domainByJson"

      @updateDomainByIdJson="onUpdateDomainByIdJson"
      @editDkimSelector="modals.showEditDkimSelectorModal = true"
    />

    <div class="section-divider" />

    <!-- Custom Tracking Domain Section -->
    <CustomTrackingDomain
      :domainByJson="domainByJson"
      @editCustomTrackingDomain="modals.showEditCustomTrackingDomainModal = true"
    />
  </div>
</template>

<script>
// vue
import { defineComponent, reactive, toRefs } from 'vue';

// components
import DkimSelector from 'components/DomainById/Settings/DkimSelector.vue';
import CustomTrackingDomain from 'components/DomainById/Settings/CustomTrackingDomain.vue';
import EditDkimSelector from 'components/DomainById/Settings/Modals/EditDkimSelector.vue';
import EditCustomTrackingDomain from 'components/DomainById/Settings/Modals/EditCustomTrackingDomain.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

export default defineComponent({
  name: 'DomainSettings',

  emits: ['updateDomainByIdJson'],

  components: {
    DkimSelector,
    CustomTrackingDomain,
    EditDkimSelector,
    EditCustomTrackingDomain,
  },

  props: {
    domainByJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // composition API
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      modals: {
        showEditCustomTrackingDomainModal: false,
        showEditDkimSelectorModal: false,
      },
    });

    // methods
    const onSuccessfulUpdateCustomTrackingDomain = (updatedDomainJson) => {
      state.modals.showEditCustomTrackingDomainModal = false;
      emit('updateDomainByIdJson', updatedDomainJson);
    };

    const onSuccessfulUpdateDkimSelector = (updatedDomainJson) => {
      // state.modals.showEditDkimSelectorModal = false;
      emit('updateDomainByIdJson', updatedDomainJson);
    };

    const onUpdateDomainByIdJson = (updatedDomainJson) => {
      emit('updateDomainByIdJson', updatedDomainJson);
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,

      // methods
      onSuccessfulUpdateCustomTrackingDomain,
      onSuccessfulUpdateDkimSelector,
      onUpdateDomainByIdJson,
    };
  },
});
</script>

<style lang="scss" scoped>
.domain-settings-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 740px;
  padding: 32px 20px;

  .section-divider {
    height: 1px;
    width: 100%;
    border-top: 1px solid $grey-50;
  }
}
</style>
