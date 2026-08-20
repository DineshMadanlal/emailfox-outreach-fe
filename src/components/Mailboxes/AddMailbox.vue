<template>
  <div class="add-mailbox">
    <!-- header -->
    <div class="add-mailbox-header">
      <div class="flex no-wrap items-center full-width">
        <h4 class="add-mailbox-header-text">
          Mailboxes
        </h4>

        <q-space />

        <div class="add-mailbox-stepper">
          <StepSummary
            :steps="activeSteps"
            :activeStep="stepperActiveStep"
            :completedStepsJson="completedStepsJson"

            @setStep="setStep"
          />
        </div>

        <q-space />

        <!-- Close -->
        <q-btn
          flat
          round
          dense

          color="negative"
          class="app-negative-button"

          @click="onClosePage"
        >
          <LocalSvgIcon
            image="close"
            classes="app-negative-icon"
          />
        </q-btn>
      </div>

      <div class="mobile-add-mailbox-stepper">
        <StepSummary
          :steps="activeSteps"
          :activeStep="stepperActiveStep"
          :completedStepsJson="completedStepsJson"

          @setStep="setStep"
        />
      </div>
    </div>

    <!-- Content -->
    <div
      class="add-mailbox-content"
      :class="{
        'smtp-mail': isCustomSmtp
      }"
    >
      <SelectMailboxProvider
        v-if="activeStep === 1"

        @onCompleteStep="onSelectMailboxProvider"
      />

      <template v-else-if="activeStep === 2">
        <!-- IMAP/SMTP bulk import -->
        <SmtpBulkImport
          v-if="isCustomSmtp && isBulkMode"

          @goBack="setStep(1)"
          @bulkStepChanged="onBulkStepChanged"
        />

        <!-- IMAP/SMTP single add -->
        <AddSmtpMailbox
          v-else-if="isCustomSmtp"

          :mailboxDataJson="mailboxDataJson"
          @goBack="setStep(1)"
        />

        <!-- OAuth providers (Google / Outlook) -->
        <ConnectionSteps
          v-else

          :mailboxDataJson="mailboxDataJson"
          @goBack="setStep(1)"
        />
      </template>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, toRefs, reactive, onMounted, computed,
} from 'vue';

// router
import { useRouter } from 'vue-router';

// components
import StepSummary from 'components/Mailboxes/StepSummary.vue';
import ConnectionSteps from 'components/Mailboxes/ConnectionSteps.vue';
import SelectMailboxProvider from 'components/Mailboxes/SelectMailboxProvider.vue';
import AddSmtpMailbox from 'components/Mailboxes/AddSmtpMailbox.vue';
import SmtpBulkImport from 'components/Mailboxes/SmtpBulkImport.vue';

// utils
import { scrollToTheTop } from 'src/utils/htmlScrollApi.js';

// constants
import {
  ESP_PROVIDERS,
  MAILBOX_IMPORT_STEPS,
  BULK_MAILBOX_IMPORT_STEPS,
} from 'boot/mailbox-constants';

export default defineComponent({
  name: 'AddMailbox',

  components: {
    StepSummary,
    SelectMailboxProvider,
    ConnectionSteps,
    AddSmtpMailbox,
    SmtpBulkImport,
  },

  setup() {
    // router
    const $router = useRouter();

    // state
    const state = reactive({
      activeStep: 1,
      // tracks sub-step inside SmtpBulkImport (1=upload, 2=import progress)
      bulkSubStep: 1,
      completedStepsJson: {},
      mailboxDataJson: {},

      previousRoutePath: '',
    });

    // computed
    const isCustomSmtp = computed(() => state.mailboxDataJson?.value === ESP_PROVIDERS.CUSTOM_SMTP);
    const isBulkMode = computed(() => state.mailboxDataJson?.mode === 'bulk');

    // Which step config to show in the stepper header
    const activeSteps = computed(
      () => (isBulkMode.value ? BULK_MAILBOX_IMPORT_STEPS : MAILBOX_IMPORT_STEPS),
    );

    // Map parent step + bulk sub-step → stepper highlight
    // Standard: activeStep maps directly (1 or 2)
    // Bulk: step 1 → 1, step 2 sub-step 1 → 2, step 2 sub-step 2 → 3
    const stepperActiveStep = computed(() => {
      if (!isBulkMode.value) return state.activeStep;
      if (state.activeStep === 1) return 1;
      return state.bulkSubStep + 1; // sub-step 1 → stepper 2, sub-step 2 → stepper 3
    });

    // methods
    const onClosePage = () => {
      $router.push({ path: state.previousRoutePath });
    };

    const onComponentMounted = async () => {
      const defaulthPath = '/outreach/mailboxes';
      state.previousRoutePath = $router?.options?.history?.state?.back || defaulthPath;
    };

    const setCompletedSteps = (completedStepValue) => {
      state.completedStepsJson = {
        ...state.completedStepsJson,
        [completedStepValue]: true,
      };
    };

    const setStep = (stepNumber) => {
      if (stepNumber === 1) {
        state.mailboxDataJson.value = null;
        state.bulkSubStep = 1;
      }

      state.activeStep = stepNumber;

      // time out is required for the scroll
      setTimeout(() => {
        scrollToTheTop();
      }, 750);
    };

    const onSelectMailboxProvider = (provider) => {
      state.mailboxDataJson = provider;

      setCompletedSteps(MAILBOX_IMPORT_STEPS.SELECT_PROVIDER.value);

      setStep(2);
    };

    // Called by SmtpBulkImport when it moves between its internal steps
    const onBulkStepChanged = (subStep) => {
      state.bulkSubStep = subStep;

      if (subStep === 2) {
        setCompletedSteps(BULK_MAILBOX_IMPORT_STEPS.UPLOAD_FILE.value);
      }
    };

    onMounted(() => {
      onComponentMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isBulkMode,
      isCustomSmtp,
      activeSteps,
      stepperActiveStep,

      // methods
      setStep,
      onClosePage,
      onBulkStepChanged,
      onSelectMailboxProvider,
    };
  },
});
</script>

<style lang="scss" scoped>
.add-mailbox {
  width: 100%;
  display: flex;
  flex-direction: column;

  .add-mailbox-header {
    width: 100%;
    position: sticky;
    z-index: 1;
    background: $white;
  }

  // header
  .add-mailbox-header {
    top: 0px;
    padding: 16px 20px;
    border-bottom: 1px solid $grey-50;

    display: flex;
    align-items: center;

    .add-mailbox-header-text {
      color: $black;
      font-size: 18px;
      font-weight: 600;
    }

    .add-mailbox-stepper {
      display: flex;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        display: none;
      }
    }

    .mobile-add-mailbox-stepper {
      display: none;
      margin-top: 10px;
    }

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      flex-direction: column;
      align-items: unset;

      height: fit-content;
      padding: 16px 12px;

      .mobile-add-mailbox-stepper {
        display: flex;
      }

      .add-mailbox-stepper {
        display: none;
      }
    }
  }

  // content
  .add-mailbox-content {
    flex: 1;
    overflow-y: auto;

    padding: 40px 20px;

    width: 100%;
    display: flex;
    justify-content: center;

    // include custom scrollbar
    @include custom-scrollbar;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 24px 12px;
    }

    &.smtp-mail {
      padding: 0;
      justify-content: flex-start;
    }
  }

  // Footer
  :deep(.smtp-footer-actions) {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 32px;
    padding-top: 24px;
    background: $white;
    border-top: 1px solid $grey-50;
    padding: 20px;

    position: sticky;
    bottom: 0px;
    z-index: 2;

    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;
    }
  }
}
</style>
