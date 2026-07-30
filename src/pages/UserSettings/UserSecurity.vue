<template>
  <div class="user-security-page">
    <!-- Header -->
    <div class="settings-section-header">
      <!-- header text -->
      <p class="settings-header-text">
        Security
      </p>

      <!-- label text -->
      <p class="settings-label-text">
        Periodically update your app password to keep your account secure.
      </p>
    </div>

    <!-- Content -->
    <q-form
      ref="formRef"
      class="settings-section-content"
      @submit.prevent.stop="onSubmitForm"
    >
      <!-- Old Password -->
      <div class="full-width">
        <InputLabel label="Old Password"/>

        <q-input
          dense
          outlined
          autofocus
          hide-bottom-space

          v-model="oldPassword"

          lazy-rules="ondemand"
          class="security-input-field"

          :rules="passwordRulesArray"
          :type="isOldPasswordInput ? 'password' : 'text'"

          @update:model-value="onPasswordInputChange"
        >
          <template v-slot:append>
            <PasswordIconToggle
              :isPasswordInput="isOldPasswordInput"
              @click="isOldPasswordInput = !isOldPasswordInput"
            />
          </template>
      </q-input>
      </div>

      <p class="update-pw-text">
        Update Your Password
      </p>

      <!-- New Password -->
      <div class="full-width">
        <InputLabel label="New Password"/>

        <q-input
          dense
          outlined
          hide-bottom-space

          v-model="newPassword"

          name="password"
          lazy-rules="ondemand"
          class="security-input-field"

          :rules="passwordRulesArray"
          :type="isNewPasswordInput ? 'password' : 'text'"

          @update:model-value="onPasswordInputChange"
        >
          <template v-slot:append>
            <PasswordIconToggle
              :isPasswordInput="isNewPasswordInput"
              @click="isNewPasswordInput = !isNewPasswordInput"
            />
          </template>
        </q-input>

        <!-- Password rules -->
        <PasswordCriteria :password="newPassword" />
      </div>

      <!-- Confirm new password -->
      <div class="full-width confirm-pw-block">
        <InputLabel label="Confirm New Password"/>

        <q-input
          dense
          outlined
          hide-bottom-space

          v-model="confirmNewPassword"

          type="password"
          name="confirmPassword"
          lazy-rules="ondemand"
          class="app-input-field-height"

          :rules="confirmPasswordRulesArray"

          @update:model-value="onPasswordInputChange"
        />
      </div>

      <!-- Reset Pw Button -->
      <q-btn
        no-caps
        unelevated

        type="submit"
        color="primary"

        label="Update Password"
        class="full-width security-submit-btn"

        :loading="isApiProcessing"
      />

    </q-form>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, getCurrentInstance,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import InputLabel from 'components/Form/InputLabel.vue';
import PasswordCriteria from 'components/Password/PasswordCriteria.vue';
import PasswordIconToggle from 'components/Password/PasswordIconToggle.vue';

// Utils
import { postApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'UserSecurity',

  components: {
    InputLabel,
    PasswordCriteria,
    PasswordIconToggle,
  },

  setup() {
    // composition API
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Security'));

    // Inject the triggerToast method
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      oldPassword: '',
      isOldPasswordInput: true,

      newPassword: '',
      isNewPasswordInput: true,

      confirmNewPassword: '',

      formRef: null,

      isApiProcessing: false,
    });

    const passwordRulesArray = [
      // atleast 8 characters
      (val) => val.length >= 8 || '',
      // atleast one lower case
      (val) => /[a-z]/.test(val) || '',
      // atleast one upper case
      (val) => /[A-Z]/.test(val) || '',
    ];

    const confirmPasswordRulesArray = computed(() => [
      (val) => val === state.newPassword || 'Passwords do not match',
    ]);

    const onPasswordInputChange = () => {
      state.formRef.resetValidation();
    };

    const onSubmitForm = async () => {
      try {
        state.isApiProcessing = true;

        await postApiCall({
          endpoint: '/auth/update-password',
          payload: {
            password: state.oldPassword,
            newPassword: state.newPassword,
          },
        });

        // show toast
        appContext.config.globalProperties.$toast({
          message: 'Password Updated Successfully',
        });
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiProcessing = false;
      }
    };

    return {
      passwordRulesArray,

      // state
      ...toRefs(state),

      // computed
      confirmPasswordRulesArray,

      // methods
      onSubmitForm,
      onPasswordInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.user-security-page {
  width: 100%;

  .settings-section-content {
    width: 100%;
    max-width: 440px;

    .update-pw-text {
      color: $black;
      font-size: 16px;
      font-style: normal;
      font-weight: 500;

      margin-top: 40px;
      margin-bottom: 20px;
    }

    .confirm-pw-block {
      margin-top: 24px;
      margin-bottom: 40px;
    }

    .security-submit-btn {
      height: 36px;
      max-width: 150px;
    }
  }
}
</style>
