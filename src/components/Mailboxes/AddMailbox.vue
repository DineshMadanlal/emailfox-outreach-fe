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
            :activeStep="activeStep"
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
          :activeStep="activeStep"
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
import { MAILBOX_IMPORT_STEPS } from 'src/boot/constants';
import { ESP_PROVIDERS } from 'boot/mailbox-constants';

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
      completedStepsJson: {},
      mailboxDataJson: {},

      previousRoutePath: '',
    });

    // computed
    const isCustomSmtp = computed(() => state.mailboxDataJson?.value === ESP_PROVIDERS.CUSTOM_SMTP);
    const isBulkMode = computed(() => state.mailboxDataJson?.mode === 'bulk');

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

    onMounted(() => {
      onComponentMounted();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isBulkMode,
      isCustomSmtp,

      // methods
      setStep,
      onClosePage,
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
}
</style>
