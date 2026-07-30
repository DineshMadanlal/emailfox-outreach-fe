<template>
  <q-card flat class="app-modal-card change-ctd-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        {{ !!customTrackingDomain ? 'Change' : 'Add' }} Custom Tracking Domain
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

    <!-- Content -->
    <div class="app-modal-content">
      <InputLabel
        label="Custom Tracking Domain"
      />

      <q-input
        dense
        outlined
        autofocus
        hide-bottom-space

        type="text"
        name="newCustomTrackingDomain"
        class="app-input-field-height"

        v-model="newCustomTrackingDomain"

        @keyup.enter="updateCustomTrackingDomain"
      />
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Update -->
      <q-btn
        no-caps
        unelevated

        :loading="isApiLoading"

        color="primary"
        label="Update"
        class="q-mr-md"

        @click="updateCustomTrackingDomain"
      />

      <!-- Cancel -->
      <q-btn
        flat
        no-caps
        unelevated
        v-close-popup

        :loading="isApiLoading"

        label="Cancel"
        color="primary"

        class="light-primary-btn"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance,
} from 'vue';

// Component
import InputLabel from 'components/Form/InputLabel.vue';

// utils
import { postApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'ChangeCustomTrackingDomain',

  emits: ['updateCustomTrackingDomain'],

  components: {
    InputLabel,
  },

  props: {
    customTrackingDomain: {
      type: String,
      default: '',
    },
    domainId: {
      type: Number,
      required: true,
    },
  },

  setup(props, { emit }) {
    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      newCustomTrackingDomain: props.customTrackingDomain,

      isApiLoading: false,
    });

    // methods
    const updateCustomTrackingDomain = async () => {
      try {
        state.isApiLoading = true;

        // api call
        await postApiCall({
          endpoint: `domains/${props.domainId}`,
          payload: {
            custom_tracking_url: state.newCustomTrackingDomain,
          },
        });

        //

        // show toast
        appContext.config.globalProperties.$toast({
          message: 'Custom Tracking Domain updated successfully',
        });

        // emit event
        emit('updateCustomTrackingDomain', state.newCustomTrackingDomain);
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // methods
      updateCustomTrackingDomain,
    };
  },
});
</script>

<style lang="scss" scoped>
.change-ctd-card {
  max-width: 600px;
}
</style>
