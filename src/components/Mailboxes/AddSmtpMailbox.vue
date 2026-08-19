<template>
  <div class="add-smtp-mailbox-card">
    <q-form
      ref="addSmtpFormRef"
      class="full-width add-mailbox-form"
      @submit.prevent.stop="onSubmit"
    >
      <div class="form-body">
        <!-- Full Name -->
        <div class="form-row full-name-row">
          <InputLabel
            label="Full Name"
            isImportant
          />

          <q-input
            dense
            outlined
            hide-bottom-space
            v-model="formData.name"
            placeholder="John"
            lazy-rules="ondemand"
            :rules="[
              (val) => (val && val.trim().length > 0) || 'Full Name is required',
            ]"
            @update:modelValue="onInputChange"
          />
        </div>

        <!-- User Name & Password -->
        <div class="two-input-grid">
          <!-- User Name (Email) -->
          <div>
            <InputLabel
              label="User Name"
              isImportant
            />

            <q-input
              dense
              outlined
              hide-bottom-space
              v-model="formData.email"
              placeholder="john.doe@domain.com"
              lazy-rules="ondemand"
              :rules="emailRules"
              @update:modelValue="onInputChange"
            />
          </div>

          <!-- Password -->
          <div>
            <InputLabel
              label="Password"
              isImportant
            />

            <q-input
              dense
              outlined
              hide-bottom-space
              v-model="formData.password"
              placeholder="john.doe@domain.com"
              :type="isPasswordVisible ? 'text' : 'password'"
              lazy-rules="ondemand"
              :rules="[
                (val) => !!val || 'Password is required',
              ]"
              @update:modelValue="onInputChange"
            >
              <template v-slot:append>
                <PasswordIconToggle
                  :isPasswordInput="!isPasswordVisible"
                  @click="isPasswordVisible = !isPasswordVisible"
                />
              </template>
            </q-input>
          </div>
        </div>

        <!-- SMTP (Outgoing Mail) Section -->
        <div class="server-config-section">
          <h5 class="section-title">
            SMTP (Outgoing Mail)
          </h5>

          <div class="two-input-grid">
            <!-- Host -->
            <div>
              <InputLabel
                label="Host"
                isImportant
              />

              <q-input
                dense
                outlined
                hide-bottom-space
                v-model="formData.smtpHost"
                placeholder="smtp.domain.com"
                lazy-rules="ondemand"
                :rules="[
                  (val) => (val && val.trim().length > 0) || 'Host is required',
                ]"
                @update:modelValue="onInputChange"
              />
            </div>

            <!-- SMTP Port -->
            <div>
              <InputLabel
                label="SMTP Port"
                isImportant
              />

              <q-input
                dense
                outlined
                hide-bottom-space
                type="number"
                v-model.number="formData.smtpPort"
                placeholder="587"
                lazy-rules="ondemand"
                :rules="[
                  (val) => !!val || 'SMTP Port is required',
                ]"
                @update:modelValue="onInputChange"
              />
            </div>
          </div>

          <!-- Use SSL/TLS -->
          <div class="secure-checkbox-block">
            <q-checkbox
              dense
              class="app-checkbox"
              v-model="formData.smtpSecure"
              label="Use SSL/TLS"
            />
          </div>
        </div>

        <!-- IMAP (Incoming Mail) Section -->
        <div class="server-config-section">
          <h5 class="section-title">
            IMAP (Incoming Mail)
          </h5>

          <div class="two-input-grid">
            <!-- Host -->
            <div>
              <InputLabel
                label="Host"
                isImportant
              />

              <q-input
                dense
                outlined
                hide-bottom-space
                v-model="formData.imapHost"
                placeholder="imap.domain.com"
                lazy-rules="ondemand"
                :rules="[
                  (val) => (val && val.trim().length > 0) || 'Host is required',
                ]"
                @update:modelValue="onInputChange"
              />
            </div>

            <!-- IMAP Port -->
            <div>
              <InputLabel
                label="IMAP Port"
                isImportant
              />

              <q-input
                dense
                outlined
                hide-bottom-space
                type="number"
                v-model.number="formData.imapPort"
                placeholder="587"
                lazy-rules="ondemand"
                :rules="[
                  (val) => !!val || 'IMAP Port is required',
                ]"
                @update:modelValue="onInputChange"
              />
            </div>
          </div>

          <!-- Use SSL/TLS -->
          <div class="secure-checkbox-block">
            <q-checkbox
              dense
              class="app-checkbox"
              v-model="formData.imapSecure"
              label="Use SSL/TLS"
            />
          </div>
        </div>

        <!-- Reply-to Section -->
        <div class="reply-to-section">
          <!-- Toggle -->
          <q-checkbox
            dense
            class="app-checkbox"
            v-model="formData.differentReplyTo"
            label="Use a different reply-to address"
          />

          <!-- Reply-to Email Input -->
          <div
            v-if="formData.differentReplyTo"
            class="reply-to-input-block"
          >
            <InputLabel
              label="Reply-to Email"
              isImportant
            />

            <q-input
              dense
              outlined
              hide-bottom-space
              v-model="formData.replyToEmail"
              placeholder="replies@domain.com"
              lazy-rules="ondemand"
              :rules="replyToEmailRules"
              @update:modelValue="onInputChange"
            />
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="footer-actions">
        <!-- Back button -->
        <q-btn
          flat
          no-caps
          unelevated
          label="Back"
          color="primary"
          class="light-primary-btn"
          @click="$emit('goBack')"
        />

        <!-- Save & Complete Button -->
        <q-btn
          no-caps
          unelevated
          type="submit"
          color="primary"
          label="Save & Complete"
          :loading="isApiLoading"
        />
      </div>
    </q-form>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance,
} from 'vue';

// vue router
import { useRouter } from 'vue-router';

// components
import InputLabel from 'components/Form/InputLabel.vue';
import PasswordIconToggle from 'components/Password/PasswordIconToggle.vue';

// utils
import { connectSmtpAccount } from 'src/utils/domainMailboxesApi.js';

// constants
import { EMAIL_REGEX } from 'boot/constants';

export default defineComponent({
  name: 'AddSmtpMailbox',

  components: {
    InputLabel,
    PasswordIconToggle,
  },

  emits: ['goBack'],

  setup() {
    // router
    const $router = useRouter();

    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isApiLoading: false,
      isPasswordVisible: false,
      addSmtpFormRef: null,

      formData: {
        name: '',
        email: '',
        password: '',

        // SMTP
        smtpHost: '',
        smtpPort: 465,
        smtpSecure: true,

        // IMAP
        imapHost: '',
        imapPort: 993,
        imapSecure: true,

        // Reply-to
        differentReplyTo: false,
        replyToEmail: '',
      },
    });

    const emailRules = [
      (val) => (val && val.trim().length > 0) || 'User Name is required',
      (val) => EMAIL_REGEX.test(val) || 'Invalid email address',
    ];

    const replyToEmailRules = [
      (val) => (val && val.trim().length > 0) || 'Reply-to email is required',
      (val) => EMAIL_REGEX.test(val) || 'Invalid email address',
    ];

    const onInputChange = () => {
      state.addSmtpFormRef?.resetValidation();
    };

    const getPayload = () => {
      const { formData } = state;

      return {
        name: formData.name.trim(),
        email: formData.email.trim(),

        // SMTP
        smtp_host: formData.smtpHost.trim(),
        smtp_port: Number(formData.smtpPort),
        smtp_secure: formData.smtpSecure,
        smtp_username: formData.email.trim(),
        smtp_password: formData.password,

        // IMAP
        imap_host: formData.imapHost.trim(),
        imap_port: Number(formData.imapPort),
        imap_secure: formData.imapSecure,
        imap_username: formData.email.trim(),
        imap_password: formData.password,

        //
        different_reply_to: formData.differentReplyTo
          ? formData.replyToEmail.trim()
          : '',

        bcc_to_crm: '',
        signature: '',
        sending_limit_per_day: 20,
        minimum_time_gap_mins: 5,
      };
    };

    const onSubmit = async () => {
      try {
        const isValidated = await state.addSmtpFormRef?.validate();

        if (!isValidated) {
          return;
        }

        state.isApiLoading = true;

        const payload = getPayload();
        const response = await connectSmtpAccount(payload);

        appContext.config.globalProperties.$toast({
          message: `${response?.email || payload.email} connected successfully`,
        });

        const mailboxId = response?.mailbox_id || response?.id;
        if (mailboxId) {
          $router.push(`/outreach/mailbox/${mailboxId}`);
        } else {
          $router.push('/outreach/mailboxes');
        }
      } catch (error) {
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

      // constants
      emailRules,
      replyToEmailRules,

      // methods
      onSubmit,
      onInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.add-smtp-mailbox-card {
  width: 100%;
  border-radius: 8px;
  background: $white;

  flex: 1;
  display: flex;
  flex-direction: column;

  .add-mailbox-form {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  // form body
  .form-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
    max-width: 650px;

    padding: 20px;

    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;
    }

    .full-name-row {
      max-width: 320px;

      @media (max-width: $breakpoint-xs-max) {
        max-width: 100%;
      }
    }

    .server-config-section {
      display: flex;
      flex-direction: column;
      gap: 16px;

      .section-title {
        color: $black;
        font-size: 15px;
        font-weight: 600;
        line-height: normal;
        margin: 0;
      }

      .secure-checkbox-block {
          margin-top: 4px;

          :deep(.q-checkbox__label) {
            color: $black;
            font-size: 14px;
            font-weight: 400;
          }
        }
    }

    .reply-to-section {
      display: flex;
      flex-direction: column;
      gap: 16px;

      :deep(.q-checkbox__label) {
        color: $black;
        font-size: 14px;
        font-weight: 400;
      }

      .reply-to-input-block {
        max-width: 320px;

        @media (max-width: $breakpoint-xs-max) {
          max-width: 100%;
        }
      }
    }
  }

  .footer-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid $grey-50;

    padding: 20px;

    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;
    }

    @media (max-width: $breakpoint-xs-max) {
      margin-top: 24px;
      padding-top: 16px;
    }
  }
}
</style>
