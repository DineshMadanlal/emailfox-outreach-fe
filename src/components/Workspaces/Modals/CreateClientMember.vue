<template>
  <q-card flat class="app-modal-card invite-client-member-card">
    <q-form
      class="full-width"
      ref="createClientMembersFormRef"

      @submit.prevent.stop="onFormSubmit"
    >
      <!-- header -->
      <div class="app-modal-header">
        <!--  -->
        <h4 class="modal-header-text">
          Create Client Member
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

      <!-- content -->
      <div class="app-modal-content">
        <div class="modal-conter-container">
          <!-- Name -->
          <div class="full-width">
            <InputLabel
              isImportant
              label="Name"
            />

            <q-input
              dense
              outlined
              autofocus
              hide-bottom-space

              v-model="name"

              class="input-width-maxed"
              lazy-rules="ondemand"
              placeholder="e.g. John Doe"
              :rules="[val => !!val || 'Name is required']"

              @update:model-value="onInputChange"
            />
          </div>

          <!-- Email -->
          <div class="full-width">
            <InputLabel
              isImportant
              label="Email"
            />

            <q-input
              dense
              outlined
              hide-bottom-space

              v-model="email"

              lazy-rules="ondemand"
              placeholder="e.g. john.doe@example.com"
              :rules="emailRules"

              @update:model-value="onInputChange"
            />
          </div>

          <!-- Password -->
          <div class="full-width">
            <div class="flex no-wrap items-center q-mb-sm">
              <InputLabel
                isImportant
                noMarginBottom
                label="Password"
              />

              <q-space />

              <p
                class="generate-password-text"
                @click="generatePassword"
              >
                Generate Password
              </p>
            </div>

            <q-input
              dense
              outlined
              readonly
              hide-bottom-space

              v-model="password"

              name="password"
              lazy-rules="ondemand"
              class="app-input-field-height"

              :type="isPasswordInput ? 'password' : 'text'"
              :rules="passwordRulesArray"

              @update:model-value="onInputChange"
            >
              <template v-slot:append>
                <PasswordIconToggle
                  :isPasswordInput="isPasswordInput"
                  @click="isPasswordInput = !isPasswordInput"
                />
              </template>
            </q-input>

            <!-- Password rules -->
            <PasswordCriteria :password="password" />

          </div>

          <!-- Assign Role -->
          <div class="full-width">
            <InputLabel
              isImportant
              label="Role"
            />

            <ClientRoles
              v-model="role"
              outlined
            />
          </div>

        </div>
      </div>

      <!-- footer -->
      <div class="app-modal-footer">
        <!-- Send Invites -->
        <q-btn
          no-caps
          unelevated

          type="submit"
          color="primary"
          label="Create Client"

          :loading="isApiLoading"
        />

        <!-- Cancel button -->
        <q-btn
          flat
          no-caps
          unelevated
          v-close-popup

          label="Cancel"
          color="primary"
          class="light-primary-btn q-ml-md"

          :loading="isApiLoading"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance, onMounted,
} from 'vue';

// utils
import { postApiCall } from 'src/utils/apiRequests';
import { generateRandomPassword } from 'src/utils/helperFunctions';

// Components
import InputLabel from 'components/Form/InputLabel.vue';
import ClientRoles from 'components/Dropdown/ClientRoles.vue';
import PasswordCriteria from 'components/Password/PasswordCriteria.vue';
import PasswordIconToggle from 'components/Password/PasswordIconToggle.vue';

// constants
import { EMAIL_REGEX } from 'boot/constants';
import { CLIENT_MEMBER_ROLES } from 'boot/workspace-constants';

export default defineComponent({
  name: 'InviteClientMember',

  emits: ['onCreateClient'],

  components: {
    InputLabel,
    ClientRoles,
    PasswordCriteria,
    PasswordIconToggle,
  },

  setup(props, { emit }) {
    // current instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      createClientMembersFormRef: null,

      name: '',
      email: '',
      password: '',
      isPasswordInput: true,
      role: CLIENT_MEMBER_ROLES.ACCOUNT_MANAGER.value,

      isApiLoading: false,
    });

    // methods
    const onInputChange = () => {
      if (state.createClientMembersFormRef) {
        state.createClientMembersFormRef.resetValidation();
      }
    };

    const onFormSubmit = async () => {
      try {
        state.isApiLoading = true;

        const clientJson = {
          name: state.name,
          email: state.email,
          password: state.password,
          role: state.role,
          // permission: CLIENT_MEMBER_ROLES[state.role].permission,
        };

        await postApiCall({
          includeWorkspace: true,
          endpoint: '/invite-clients',
          payload: {
            clients: [
              clientJson,
            ],
          },
        });

        appContext.config.globalProperties.$toast({
          message: 'Client member created successfully',
          color: 'positive',
        });

        emit('onCreateClient', clientJson);
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    const passwordRulesArray = [
      // atleast 8 characters
      (val) => val.length >= 8 || '',
      // atleast one lower case
      (val) => /[a-z]/.test(val) || '',
      // atleast one upper case
      (val) => /[A-Z]/.test(val) || '',
    ];

    const generatePassword = () => {
      state.password = generateRandomPassword();
    };

    onMounted(() => {
      generatePassword();
    });

    return {
      emailRules: [
        (val) => EMAIL_REGEX.test(val) || 'Invalid email',
      ],
      passwordRulesArray,

      // state
      ...toRefs(state),

      // methods
      onFormSubmit,
      onInputChange,
      generatePassword,
    };
  },
});
</script>

<style lang="scss" scoped>
.invite-client-member-card {
  max-width: 600px;

  .app-modal-content {
    .modal-conter-container {
      display: flex;
      gap: 24px;
      flex-direction: column;

      max-width: 420px;

      .generate-password-text {
        color: $grey;
        font-size: 14px;
        font-weight: 400;

        white-space: nowrap;

        &:hover {
          text-decoration: underline;
          cursor: pointer;
        }
      }
    }
  }
}
</style>
