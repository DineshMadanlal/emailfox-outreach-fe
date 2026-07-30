<template>
  <div class="user-profile-page">
    <!-- Header -->
    <div class="settings-section-header">
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          Profile
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          Manage your profile configurations
        </p>
      </div>
    </div>

    <!--  -->
    <div class="settings-section-content">
      <p class="profile-header-text">
        Basic Profile
      </p>

      <!-- form -->
      <q-form
        ref="userProfileFormRef"
        class="profile-form-grid"

        @submit.prevent.stop="onSubmitForm"
      >
        <!-- Full Name -->
        <div class="full-width">
          <InputLabel
            label="Full Name"
          />

          <q-input
            dense
            outlined
            hide-bottom-space
            :rules="nameRules"

            name="name"
            type="text"
            lazy-rules="ondemand"
            class="app-input-field-height"

            v-model="fullName"

            @update:model-value="onInputChange"
          />
        </div>

        <!-- Full Name -->
        <div class="full-width">
          <InputLabel
            label="Email Address"
          />

          <q-input
            dense
            outlined
            readonly
            hide-bottom-space

            v-model="emailAddress"

            class="app-input-field-height"
          >
            <!-- append -->
            <template v-slot:append>
              <VerifiedBadge />
            </template>
          </q-input>
        </div>

        <!-- Save Button -->
        <q-btn
          no-caps
          unelevated

          label="Save"
          type="submit"
          color="primary"
          class="save-button"

          :loading="isApiProcessing"
        />
      </q-form>

    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, onMounted, reactive, toRefs, getCurrentInstance,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import InputLabel from 'components/Form/InputLabel.vue';
import VerifiedBadge from 'components/Badge/VerifiedBadge.vue';

// Pinia
import { useAuthStore } from 'src/stores/auth';

// Utils
import { postApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'UserProfile',

  components: {
    InputLabel,
    VerifiedBadge,
  },

  setup() {
    // composition API
    const { generateMetadata } = useAppHelpersApi();

    // Inject the triggerToast method
    const { appContext } = getCurrentInstance();

    // store
    const authStorePinia = useAuthStore();

    // state
    const state = reactive({
      fullName: '',
      emailAddress: '',

      userProfileFormRef: null,

      isApiProcessing: false,
    });

    // metadata
    useMeta(generateMetadata('Profile'));

    // methods
    const onSubmitForm = async () => {
      try {
        // hide toast
        appContext.config.globalProperties.$hideToast();

        state.isApiProcessing = true;

        const payload = {
          name: state.fullName,
        };

        await postApiCall({
          endpoint: '/users/update-user-details',
          payload,
        });

        authStorePinia.setField({
          field: 'user',
          value: {
            ...authStorePinia.user,
            ...payload,
          },
        });

        // show success toast
        appContext.config.globalProperties.$toast({
          message: 'Profile updated successfully',
        });
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    const onInputChange = () => {
      state.userProfileFormRef.resetValidation();
    };

    onMounted(() => {
      state.fullName = authStorePinia.user?.name;
      state.emailAddress = authStorePinia.user?.email;
    });

    return {
      nameRules: [
        (val) => val.length > 3 || 'Minimum of 4 characters required',
      ],

      // state
      ...toRefs(state),

      // methods
      onSubmitForm,
      onInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.user-profile-page {
  width: 100%;

  .settings-section-content {
    width: 100%;
    max-width: 420px;

    .profile-header-text {
      color: $black;
      font-size: 16px;
      font-style: normal;
      font-weight: 600;

      margin-bottom: 20px;
    }

    .profile-form-grid {
      width: 100%;
      display: grid;
      grid-row-gap: 24px;
    }

    .save-button {
      width: fit-content;
      margin-top: 16px;
    }
  }
}
</style>
