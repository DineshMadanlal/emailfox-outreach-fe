<template>
  <q-card flat class="app-modal-card unblock-warmup-card">
    <!-- Header -->
    <div class="app-modal-header">
      <h4 class="modal-header-text">
        {{ isStepReason ? 'Unblock Warm-up' : 'Verify Email' }}
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
      <!-- Step 1: Reason -->
      <template v-if="isStepReason">
        <div class="unblock-reason-container custom-scrollbar">
          <!-- Error alert box -->
          <div
            v-if="blockReason"
            class="error-reason-box"
          >
            <!--  -->
            <div class="error-header">
              <LocalSvgIcon
                image="info-circle"
                classes="error-icon"
              />
              <span class="error-title">
                Blocked Reason
              </span>
            </div>

            <!-- Block reason -->
            <div
              v-if="blockReason"
              class="block-reason-content"
              v-html="formattedBlockReason"
            />
          </div>

          <p class="unblock-instructions-text">
            To resume warm-up activities for
            <strong>{{ mailboxEmail }}</strong>, we need to verify your account.
            Click <strong>Verify Email</strong> to receive an unblock code.
          </p>
        </div>
      </template>

      <!-- Step 2: Verify Code -->
      <template v-else>
        <div class="verify-code-container">
          <p class="verify-description-text">
            We've sent an email with an Unblock Code to
            <strong>{{ mailboxEmail }}</strong>. Copy the code
            and enter it below to unblock warm-up.
          </p>

          <div class="code-input-section">
            <q-input
              dense
              outlined
              v-model="verificationCode"
              placeholder="Enter unblock code"
              class="verification-code-input"
              autofocus
              :disable="loaders.isVerifying"
              @keydown.enter="onVerifyCode"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Step 1: Request Code Button -->
      <q-btn
        v-if="isStepReason"
        no-caps
        unelevated
        color="primary"
        label="Verify Email"
        :loading="loaders.isSendingCode"
        :disable="isReadOnly"
        @click="onRequestCode"
      >
        <AppTooltip
          v-if="isReadOnly"
          content="You have read-only access in this workspace"
        />
      </q-btn>

      <!-- Step 2: Verify & Unblock Button -->
      <q-btn
        v-else
        no-caps
        unelevated
        color="primary"
        label="Verify & Unblock"
        :loading="loaders.isVerifying"
        :disable="!canVerify || isReadOnly"
        @click="onVerifyCode"
      >
        <AppTooltip
          v-if="isReadOnly"
          content="You have read-only access in this workspace"
        />
      </q-btn>
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, getCurrentInstance,
} from 'vue';

// composables
import { usePermissions } from 'src/composables/usePermissions';

// Components
import AppTooltip from 'components/General/AppTooltip.vue';

// utils
import { sendUnblockWarmupOtp, verifyUnblockWarmupOtp } from 'src/utils/warmupApi';

export default defineComponent({
  name: 'UnblockWarmup',

  components: {
    AppTooltip,
  },

  props: {
    mailboxByJson: {
      type: Object,
      default: () => ({}),
    },
    warmupDetails: {
      type: Object,
      default: () => ({}),
    },
  },

  emits: ['unblockSuccess'],

  setup(props, { emit }) {
    // current instance
    const { appContext } = getCurrentInstance();

    // permissions
    const { isReadOnly } = usePermissions();

    // state
    const state = reactive({
      step: 'REASON', // 'REASON' | 'VERIFY'
      verificationCode: '',

      loaders: {
        isSendingCode: false,
        isVerifying: false,
      },
    });

    // computed
    const isStepReason = computed(() => state.step === 'REASON');

    const mailboxEmail = computed(() => (
      props.mailboxByJson?.email || props.warmupDetails?.mailbox_email || 'your mailbox'
    ));

    const blockReason = computed(() => (
      props.warmupDetails?.block_reason || ''
    ));

    const formattedBlockReason = computed(() => {
      const reason = blockReason.value;
      if (!reason) return '';

      if (reason.includes('<') && reason.includes('>')) {
        return reason;
      }

      return reason.replace(/\n/g, '<br />');
    });

    const canVerify = computed(() => (
      !!state.verificationCode && state.verificationCode.trim().length > 0
    ));

    // methods
    const onRequestCode = async () => {
      try {
        state.loaders.isSendingCode = true;

        const response = await sendUnblockWarmupOtp({
          mailboxId: props.mailboxByJson?.id,
        });

        appContext.config.globalProperties.$toast({
          message: response?.message || 'Verification code sent to your email',
        });

        state.step = 'VERIFY';
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.isSendingCode = false;
      }
    };

    const onVerifyCode = async () => {
      if (!canVerify.value || state.loaders.isVerifying) return;

      try {
        state.loaders.isVerifying = true;

        const response = await verifyUnblockWarmupOtp({
          mailboxId: props.mailboxByJson?.id,
          otp: state.verificationCode.trim(),
        });

        appContext.config.globalProperties.$toast({
          message: response?.message || 'Warm-up unblocked successfully',
        });

        emit('unblockSuccess', response);
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.loaders.isVerifying = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed
      canVerify,
      isReadOnly,
      blockReason,
      isStepReason,
      mailboxEmail,
      formattedBlockReason,

      // methods
      onVerifyCode,
      onRequestCode,
    };
  },
});
</script>

<style lang="scss" scoped>
.unblock-warmup-card {
  max-width: 600px;

  .unblock-reason-container {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .error-reason-box {
      padding: 14px 16px;
      border-radius: 8px;
      background: #FFF5F5;
      border: 1px solid rgba($negative, 0.2);

      .error-header {
        display: flex;
        align-items: center;
        gap: 8px;

        :deep(.error-icon) {
          width: 16px;
          height: 16px;
          flex-shrink: 0;

          @include svg-icon-stroke('path, circle', $negative);
        }

        .error-title {
          font-size: 14px;
          font-weight: 600;
          color: $negative;
          line-height: 18px;
        }
      }

      .block-reason-content {
        max-height: 180px;
        overflow-y: auto;
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid rgba($negative, 0.12);

        font-size: 13px;
        line-height: 18px;
        color: $grey;
        word-break: break-word;
        white-space: pre-wrap;
      }
    }

    .unblock-instructions-text {
      color: rgba(var(--black-rgb), 0.8);
      font-size: 14px;
      line-height: 20px;

      strong {
        color: $black;
      }
    }
  }

  .verify-code-container {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .verify-description-text {
      color: $grey-800;
      font-size: 14px;
      line-height: 20px;
      margin: 0;
    }

    .code-input-section {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .verification-code-input {
        width: 100%;
      }
    }
  }
}
</style>
