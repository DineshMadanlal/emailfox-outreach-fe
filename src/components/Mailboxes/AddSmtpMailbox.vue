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

        <!-- Verification Result Box -->
        <div
          v-if="verificationResult"
          ref="verificationMsgRef"
          class="verification-result-box"
          :class="verificationResult.success ? 'is-success' : 'is-error'"
        >
          <div class="verification-header-row">
            <LocalSvgIcon
              :image="verificationResult.success ? 'basic-tick' : 'close'"
              classes="verification-icon"
            />
            <span class="verification-title">
              {{ verificationResult.message }}
            </span>
          </div>

          <!-- Detailed Breakdown for SMTP and IMAP -->
          <div
            v-if="verificationResult.logs &&
              (verificationResult.logs.smtp || verificationResult.logs.imap)"
            class="verification-breakdown-list"
          >
            <!-- SMTP row -->
            <div
              v-if="verificationResult.logs.smtp"
              class="breakdown-item"
              :class="verificationResult.logs.smtp.success ? 'item-pass' : 'item-fail'"
            >
              <div class="breakdown-protocol">
                <span class="protocol-badge">SMTP</span>
                <span class="protocol-status">
                  {{ verificationResult.logs.smtp.success ? 'Passed' : 'Failed' }}
                </span>
              </div>
              <p
                v-if="verificationResult.logs.smtp.message"
                class="breakdown-message"
              >
                {{ verificationResult.logs.smtp.message }}
              </p>
            </div>

            <!-- IMAP row -->
            <div
              v-if="verificationResult.logs.imap"
              class="breakdown-item"
              :class="verificationResult.logs.imap.success ? 'item-pass' : 'item-fail'"
            >
              <div class="breakdown-protocol">
                <span class="protocol-badge">IMAP</span>
                <span class="protocol-status">
                  {{ verificationResult.logs.imap.success ? 'Passed' : 'Failed' }}
                </span>
              </div>
              <p
                v-if="verificationResult.logs.imap.message"
                class="breakdown-message"
              >
                {{ verificationResult.logs.imap.message }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="smtp-footer-actions">
        <!-- Back button (only in add mode) -->
        <q-btn
          v-if="!isEditMode"
          flat
          no-caps
          unelevated
          label="Back"
          color="primary"
          class="light-primary-btn"
          @click="$emit('goBack')"
        />

        <q-space v-if="!isEditMode" />

        <div class="flex items-center gap-12">
          <!-- Verify SMTP Button -->
          <q-btn
            flat
            no-caps
            unelevated
            color="primary"
            label="Verify SMTP"
            class="light-primary-btn"
            :loading="isVerifying"
            :disable="isApiLoading"
            @click="onVerifySmtp"
          />

          <!-- Save CTA -->
          <q-btn
            no-caps
            unelevated
            type="submit"
            color="primary"
            :label="isEditMode ? 'Save Changes' : 'Save & Complete'"
            :loading="isApiLoading"
            :disable="isVerifying"
          />
        </div>
      </div>
    </q-form>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed,
  onMounted, watch, nextTick, getCurrentInstance,
} from 'vue';

// vue router
import { useRouter } from 'vue-router';

// components
import InputLabel from 'components/Form/InputLabel.vue';
import PasswordIconToggle from 'components/Password/PasswordIconToggle.vue';

// utils
import { connectSmtpAccount, verifySmtpAccount } from 'src/utils/domainMailboxesApi.js';

// constants
import { EMAIL_REGEX } from 'boot/constants';

export default defineComponent({
  name: 'AddSmtpMailbox',

  components: {
    InputLabel,
    PasswordIconToggle,
  },

  props: {
    mailboxByJson: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ['goBack', 'updateMailbox'],

  setup(props, { emit }) {
    // router
    const $router = useRouter();

    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      isApiLoading: false,
      isVerifying: false,
      isPasswordVisible: false,
      addSmtpFormRef: null,
      verificationMsgRef: null,
      verificationResult: null,

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

    const isEditMode = computed(() => !!props.mailboxByJson?.id);

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
      state.verificationResult = null;
    };

    const populateFromMailboxJson = () => {
      if (!props.mailboxByJson || !props.mailboxByJson.id) {
        return;
      }

      const mb = props.mailboxByJson;

      state.formData.name = mb.name || '';
      state.formData.email = mb.email || '';
      state.formData.password = mb.smtp_password || '';

      state.formData.smtpHost = mb.smtp_host || '';
      state.formData.smtpPort = mb.smtp_port || 465;
      state.formData.smtpSecure = mb.smtp_secure !== undefined ? mb.smtp_secure : true;

      state.formData.imapHost = mb.imap_host || '';
      state.formData.imapPort = mb.imap_port || 993;
      state.formData.imapSecure = mb.imap_secure !== undefined ? mb.imap_secure : true;

      state.formData.differentReplyTo = !!mb.different_reply_to;
      state.formData.replyToEmail = mb.different_reply_to || '';
    };

    const getPayload = () => {
      const { formData } = state;

      const payload = {
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

        different_reply_to: formData.differentReplyTo
          ? formData.replyToEmail.trim()
          : '',

        bcc_to_crm: props.mailboxByJson?.bcc_to_crm || '',
        signature: props.mailboxByJson?.signature || '',
        sending_limit_per_day: props.mailboxByJson?.sending_limit_per_day || 20,
        minimum_time_gap_mins: props.mailboxByJson?.minimum_time_gap_mins || 5,
      };

      if (isEditMode.value) {
        payload.id = props.mailboxByJson.id;
      }

      return payload;
    };

    const onVerifySmtp = async () => {
      try {
        const isValidated = await state.addSmtpFormRef?.validate();
        if (!isValidated) {
          return;
        }

        state.isVerifying = true;
        state.verificationResult = null;

        const payload = getPayload();
        const response = await verifySmtpAccount(payload);

        const logs = response?.verification_logs
          || response?.data?.verification_logs
          || null;

        const isOverallSuccess = logs ? logs.success !== false : true;

        state.verificationResult = {
          success: isOverallSuccess,
          message: response?.message || (isOverallSuccess ? 'Mailbox verified successfully' : 'Mailbox verification failed'),
          logs,
        };

        appContext.config.globalProperties.$toast({
          warning: !isOverallSuccess,
          message: state.verificationResult.message,
        });

        await nextTick();
        state.verificationMsgRef?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } catch (error) {
        const logs = error?.data?.verification_logs || null;

        const cleanMessage = (error?.message || 'Mailbox verification failed').replace(/^Error:\s*/i, '');

        state.verificationResult = {
          success: false,
          message: cleanMessage,
          logs,
        };

        appContext.config.globalProperties.$toast({
          warning: true,
          message: cleanMessage,
        });

        await nextTick();
        state.verificationMsgRef?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } finally {
        state.isVerifying = false;
      }
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

        if (isEditMode.value) {
          appContext.config.globalProperties.$toast({
            message: 'SMTP settings updated successfully',
          });

          const updatedMailbox = {
            ...props.mailboxByJson,
            ...payload,
            ...(response || {}),
          };

          emit('updateMailbox', updatedMailbox);
        } else {
          appContext.config.globalProperties.$toast({
            message: `${response?.email || payload.email} connected successfully`,
          });

          const mailboxId = response?.mailbox_id || response?.id;
          if (mailboxId) {
            $router.push(`/outreach/mailbox/${mailboxId}`);
          } else {
            $router.push('/outreach/mailboxes');
          }
        }
      } catch (error) {
        const logs = error?.data?.verification_logs || null;

        const cleanMessage = (error?.message || 'Mailbox verification failed').replace(/^Error:\s*/i, '');

        state.verificationResult = {
          success: false,
          message: cleanMessage,
          logs,
        };

        appContext.config.globalProperties.$toast({
          warning: true,
          message: cleanMessage,
        });

        await nextTick();
        state.verificationMsgRef?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } finally {
        state.isApiLoading = false;
      }
    };

    watch(
      () => props.mailboxByJson,
      () => {
        populateFromMailboxJson();
      },
      { deep: true },
    );

    onMounted(() => {
      populateFromMailboxJson();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isEditMode,

      // constants
      emailRules,
      replyToEmailRules,

      // methods
      onSubmit,
      onVerifySmtp,
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

    .verification-result-box {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 14px 16px;
      border-radius: 6px;

      &.is-success {
        background: rgba(var(--positive-rgb), 0.08);
        border: 1px solid rgba(var(--positive-rgb), 0.3);

        .verification-header-row {
          color: $positive;

          :deep(.verification-icon) {
            @include svg-icon-stroke('path', $positive);
          }
        }
      }

      &.is-error {
        background: rgba(var(--negative-rgb), 0.08);
        border: 1px solid rgba(var(--negative-rgb), 0.3);

        .verification-header-row {
          color: $negative;

          :deep(.verification-icon) {
            @include svg-icon-stroke('path', $negative);
          }
        }
      }

      .verification-header-row {
        display: flex;
        align-items: center;
        gap: 10px;

        .verification-title {
          font-size: 14px;
          font-weight: 600;
        }

        :deep(.verification-icon) {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }
      }

      .verification-breakdown-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 4px;
        padding-top: 10px;
        border-top: 1px solid rgba(var(--black-rgb), 0.08);

        .breakdown-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 8px 12px;
          border-radius: 4px;
          background: $white;

          &.item-pass {
            border-left: 3px solid $positive;

            .protocol-status {
              color: $positive;
            }
          }

          &.item-fail {
            border-left: 3px solid $negative;

            .protocol-status {
              color: $negative;
            }
          }

          .breakdown-protocol {
            display: flex;
            align-items: center;
            justify-content: space-between;

            .protocol-badge {
              font-weight: 600;
              font-size: 13px;
              color: $black;
            }

            .protocol-status {
              font-size: 12px;
              font-weight: 600;
            }
          }

          .breakdown-message {
            color: $grey-800;
            font-size: 12px;
            line-height: 1.4;
            margin: 0;
            word-break: break-word;
            font-family: monospace;
          }
        }
      }
    }
  }

  .smtp-footer-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid $grey-50;

    position: sticky;
    bottom: 0;
    z-index: 2;
    background: $white;

    .gap-12 {
      gap: 12px;
    }
  }
}
</style>
