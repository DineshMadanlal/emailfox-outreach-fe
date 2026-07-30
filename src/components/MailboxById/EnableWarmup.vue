<template>
  <div class="enable-warmup">
    <q-dialog
      v-model="showWarmupProfilesModal"
      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <WarmupProfiles
        @useWarmupProfile="onUpdateMailboxWarmupProfile"
        @newProfileCreated="onNewWarmupProfileCreated"
      />
    </q-dialog>

    <q-dialog
      v-model="showSaveWarmupProfileModal"
      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveWarmupProfile
        readOnly
        :warmupProfileId="selectedWarmupProfileId"
        :warmupProfileDetails="selectedWarmupProfileDetails"
      />
    </q-dialog>

    <div class="enable-warmup-container">
      <!-- warmup svg -->
      <div class="warmup-svg-illustration">
        <LocalSvgIcon image="warmup-1" classes="warmup-icon" />
      </div>

      <p class="enable-warmup-header-text">
        Warmup is not enabled
      </p>

      <p class="enable-warmup-desc-text">
        Warmup helps build mailbox reputation by sending and replying to real conversations
        automatically. Enable warmup before starting outreach to protect deliverability.
      </p>

      <q-card flat class="assign-warmup-profile-card">
        <!-- top section -->
        <div class="assign-top-section">
          <!-- header -->
          <p class="assign-header-text">
            Assign Warmup Profile
          </p>

          <!-- description -->
          <p class="assign-desc-text">
            Choose a warmup profile to apply sending rules like frequency and volume to this
            mailbox. You can change or update the profile later.
          </p>

          <!--  -->
          <div class="warmup-profile-select-wrapper">
            <SelectWarmupProfile
              class="warmup-dd-profile"
              ref="selectWarmupProfileRef"

              v-model="selectedWarmupProfileId"

              v-if="showSelectWarmupProfileDropdown"
            />

            <!-- Preview -->
            <q-btn
              flat
              dense
              no-caps
              unelevated
              color="primary"

              v-if="selectedWarmupProfileId"

              @click="showSaveWarmupProfileModal = true"
            >
              <p class="text-weight-medium">
                View Details
              </p>
            </q-btn>
          </div>

          <!-- Preview Text -->
          <p
            v-if="selectedWarmupProfilePreviewText"
            class="small-preview-text"
          >
            {{ selectedWarmupProfilePreviewText }}
          </p>
        </div>
        <!-- bottom section -->
        <div class="assign-bottom-section">
          <!-- Enable Warmup -->
          <q-btn
            no-caps
            unelevated

            color="primary"
            label="Enable Warmup"

            :loading="isSaveApiLoading"
            :disable="!selectedWarmupProfileId"

            @click="onEnableWarmup"
          />

          <!-- Manage Profiles -->
          <q-btn
            flat
            no-caps
            unelevated
            color="primary"
            label="Manage Profiles"
            class="light-primary-btn"

            @click="showWarmupProfilesModal = true"
          />
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed, getCurrentInstance,
  onMounted,
} from 'vue';

// components
import WarmupProfiles from 'components/Warmup/Modals/WarmupProfiles.vue';
import SaveWarmupProfile from 'components/Warmup/Modals/SaveWarmupProfile.vue';
import SelectWarmupProfile from 'components/Dropdown/SelectWarmupProfile.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { updateSingleMailboxWarmupProfile } from 'src/utils/warmupApi';

// constants
import { WARMUP_STATUS } from 'src/boot/warmup-constants';

export default defineComponent({
  name: 'MailboxByIdEnableWarmup',

  emits: ['reloadApiCalls'],

  components: {
    WarmupProfiles,
    SaveWarmupProfile,
    SelectWarmupProfile,
  },

  props: {
    mailboxByJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      selectedWarmupProfileId: null,
      selectWarmupProfileRef: null,

      // modals
      showWarmupProfilesModal: false,
      showSaveWarmupProfileModal: false,

      // loading
      isSaveApiLoading: false,

      // ui loader
      showSelectWarmupProfileDropdown: false,
    });

    // computed
    const selectedWarmupProfileDetails = computed(() => {
      if (state.selectedWarmupProfileId) {
        return state.selectWarmupProfileRef?.dropdownOptions.find(
          (profile) => profile.id === state.selectedWarmupProfileId,
        );
      }

      return null;
    });

    const selectedWarmupProfilePreviewText = computed(() => {
      if (selectedWarmupProfileDetails.value) {
        const { start_value, max_warmup_value, reply_rate } = selectedWarmupProfileDetails.value;

        return `Starts: ${start_value}/day • Max: ${max_warmup_value}/day • Reply Rate: ${reply_rate}%`;
      }

      return '';
    });

    // methods
    const onEnableWarmup = async () => {
      try {
        state.isSaveApiLoading = true;

        // api call
        await updateSingleMailboxWarmupProfile({
          mailbox_id: props.mailboxByJson.id,
          mailbox_email: props.mailboxByJson.email,
          warmup_profile_id: state.selectedWarmupProfileId,
          status: WARMUP_STATUS.ACTIVE,
        });

        // show toast
        appContext.config.globalProperties.$toast({
          message: 'Warmup has been successfully enabled for this mailbox.',
        });

        emit('reloadApiCalls');
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isSaveApiLoading = false;
      }
    };

    const updateSelectedWarmupProfileId = (warmupProfileId) => {
      setTimeout(() => {
        state.selectedWarmupProfileId = warmupProfileId;

        state.showSelectWarmupProfileDropdown = true;
      }, 200);
    };

    const onUpdateMailboxWarmupProfile = async (warmupProfile) => {
      updateSelectedWarmupProfileId(warmupProfile.id);

      // close modal
      state.showWarmupProfilesModal = false;
    };

    const onNewWarmupProfileCreated = (newWarmupProfile) => {
      state.showSelectWarmupProfileDropdown = false;

      updateSelectedWarmupProfileId(newWarmupProfile.id);
    };

    // lifecycle
    onMounted(() => {
      state.showSelectWarmupProfileDropdown = true;
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      selectedWarmupProfileDetails,
      selectedWarmupProfilePreviewText,

      // methods
      onEnableWarmup,
      onNewWarmupProfileCreated,
      onUpdateMailboxWarmupProfile,
    };
  },
});
</script>

<style lang="scss" scoped>
.enable-warmup {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 20px;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 12px;
  }

  .enable-warmup-container {
    width: 100%;
    max-width: 616px;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .warmup-svg-illustration {
      width: 76px;
      height: 76px;
      border-radius: 50%;
      background: $grey-50;

      display: flex;
      align-items: center;
      justify-content: center;

      :deep(.warmup-icon) {
        height: 34px;
        width: 32px;

        // path {
        //   stroke: $grey;
        //   fill: $grey-50;
        // }
      }
    }

    .enable-warmup-header-text {
      color: $black;
      text-align: center;
      font-size: 18px;
      font-weight: 600;

      margin-top: 24px;
      margin-bottom: 8px;
    }

    .enable-warmup-desc-text {
      color: rgba($color: var(--black-rgb), $alpha: 0.8);
      text-align: center;
      font-size: 14px;
      font-weight: 400;
      line-height: 22px; /* 157.143% */

      margin-bottom: 24px;
    }

    .assign-warmup-profile-card {
      width: 100%;
      border-radius: 8px;
      border: 1px solid $grey-50;
      background: rgba($color: var(--grey-50-rgb), $alpha: 0.4);

      .assign-bottom-section {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        padding: 20px 12px;
        border-top: 1px solid $grey-50;

        // md min
        @media (min-width: $breakpoint-md-min) {
          padding: 20px 32px;
        }
      }

      .assign-top-section {
        width: 100%;
        padding: 24px 12px;

        // md min
        @media (min-width: $breakpoint-md-min) {
          padding: 24px 32px;
        }

        .small-preview-text {
          margin-top: 12px;
          font-size: 12px;
          color: rgba($color: var(--black-rgb), $alpha: 0.8);
          margin-top: 6px;
          margin-left: 8px;
        }

        .assign-header-text {
          color: $black;
          font-size: 14px;
          font-weight: 500;
        }

        .assign-desc-text {
          color: $grey;
          font-size: 14px;
          font-weight: 400;
          line-height: 16px;

          margin-top: 8px;
          margin-bottom: 16px;
        }

        .warmup-profile-select-wrapper {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 12px;

          // xs max
          @media (max-width: $breakpoint-xs-max) {
            flex-wrap: wrap;
          }

          .warmup-dd-profile {
            width: 100%;
            max-width: 325px;
          }
        }
      }
    }
  }
}
</style>
