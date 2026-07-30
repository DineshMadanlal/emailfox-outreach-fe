<template>
  <q-card flat class="app-modal-card change-fd-card">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        {{ !!forwardingDomain ? 'Change' : 'Add' }} Forwarding Domain
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
        label="Forwarding Domain"
      />

      <q-input
        dense
        outlined
        autofocus
        hide-bottom-space

        type="text"
        name="newForwardingDomain"
        class="app-input-field-height"

        v-model="newForwardingDomain"

        @keyup.enter="updateForwardingDomain"
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

        @click="updateForwardingDomain"
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
  name: 'ChangeForwardingDomain',

  emits: ['updateForwardingDomain'],

  components: {
    InputLabel,
  },

  props: {
    forwardingDomain: {
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
      newForwardingDomain: props.forwardingDomain,

      isApiLoading: false,
    });

    // methods
    const updateForwardingDomain = async () => {
      try {
        state.isApiLoading = true;

        // api call
        await postApiCall({
          endpoint: `domains/${props.domainId}`,
          payload: {
            forwarding_domain: state.newForwardingDomain,
          },
        });

        //

        // show toast
        appContext.config.globalProperties.$toast({
          message: 'Forwarding domain updated successfully',
        });

        // emit event
        emit('updateForwardingDomain', state.newForwardingDomain);
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
      ...toRefs(state),
      updateForwardingDomain,
    };
  },
});
</script>

<style lang="scss" scoped>
.change-fd-card {
  max-width: 600px;
}
</style>
