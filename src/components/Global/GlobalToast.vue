<template>
  <q-dialog
    seamless
    v-model="showToast"

    position="top"
    class="app-toaster-dialog"
  >
    <AppToaster
      :message="toastMessage"
      :warning="warningToast"
      :maxWidth="maxWidth"
    />
  </q-dialog>
</template>

<script>
// vue
import { defineComponent, toRefs } from 'vue';

// Components
import AppToaster from 'src/components/General/AppToaster.vue';

// composables
import { useToast } from 'src/composables/toast';

export default defineComponent({
  name: 'GlobalToast',

  components: {
    AppToaster,
  },

  setup() {
    const { toastState } = useToast();

    return {
      ...toRefs(toastState),
    };
  },
});
</script>
