<template>
  <q-card
    flat
    class="warmup-profiles-card app-modal-card"
    :style="{
      display: showSaveWarmupProfileModal ? 'none' : 'flex',
    }"
  >
    <!-- Dialog -->
    <q-dialog
      v-model="showSaveWarmupProfileModal"
      :class="isMobileDevice
        ? 'app-modal-dialog' : 'app-modal-dialog--right-positioned'"

      :position="isMobileDevice ? 'standard' : 'right'"
      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveWarmupProfile
        @createdWarmupProfileDetails="onNewWarmupProfileCreated"
      />
    </q-dialog>

    <!-- header -->
    <div class="app-modal-header">
      <!-- header text -->
      <h4 class="modal-header-text">
        Warmup Profiles
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
    <div
      class="app-modal-content"
      id="warmupProfilesSection"
    >
      <div class="all-warmup-profiles-container">
        <!-- left section -->
        <div class="warmup-profiles-left-section">
          <div
            class="warmup-profiles-list"
          >
            <!-- list all warmup profiles -->
            <q-item
              dense
              clickable

              v-for="(profile, index) in warmupProfiles"
              :key="`warmup-profile-${index}`"

              :class="{ 'active-profile': profile.id === selectedWarmupProfileId }"

              class="each-warmup-profile"

              @click="selectedWarmupProfileId = profile.id"
            >
              <div class="profile-name-text">
                {{ profile.name }}
              </div>
            </q-item>
          </div>

          <!-- Api loader -->
          <div
            v-if="isApiLoading"
            class="api-loader-container"
          >
            <!-- api loader -->
            <ApiLoader
              show
              size="32px"
            />
          </div>

          <!-- Add an intersection to load more warmup profiles
          Kind of infinite scroll implementation -->
          <q-intersection
            :disable="allWarmupProfilesFetched"
            @visibility="loadMoreOptions"

            v-if="!isApiLoading"
          >
          </q-intersection>
        </div>

        <!-- right section -->
        <div
          class="warmup-profiles-right-section hide-scrollbar"
        >
          <ApiLoader
            show
            v-if="!selectedWarmupProfileDetails"
          />
          <div class="select-warmup-profile-mobile">
            <SelectWarmupProfile
              v-if="warmupProfiles?.length"
              :preloadedOptions="warmupProfiles"
              v-model="selectedWarmupProfileId"

              class="select-warmup-profile-dd"
            />
          </div>

          <div
            class=""
            v-if="selectedWarmupProfileDetails"
          >
            <p class="warmup-profile-name">
              {{ selectedWarmupProfileDetails.name }}
            </p>

            <p class="warmup-profile-created-at">
              Last updated: {{ formatDate1(selectedWarmupProfileDetails.updated_at) }}
            </p>
          </div>

          <div class="warmup-profile-preview-container">
            <!-- General Preference -->
            <q-card flat class="profile-preview-card">
              <!-- top -->
              <div class="profile-top-section">
                <LocalSvgIcon
                  image="mail"
                  classes="profile-mail-icon"
                />

                <p class="profile-header-text">
                  General Preferences
                </p>
              </div>

              <!-- main -->
              <div class="profile-main-section">
                <div class="preference-grid">
                  <!-- general preferences -->
                  <div
                    v-for="(item, index) in preferenceItems"
                    :key="`general-preference-item-${index}`"
                    class="preference-item"
                  >
                    <p class="preference-item-label">
                      {{ item.label }}
                    </p>
                    <p class="preference-item-value">
                      {{ item.value }}
                    </p>
                  </div>
                </div>

                <!-- Warmup Schedule -->
                <div
                  class="warmup-schedule"
                  v-if="warmupScheduleJson"
                >
                  <p class="preference-item-label">
                    Warmup Schedule
                  </p>
                  <p class="preference-item-value">
                    {{ warmupScheduleJson.label }}
                    <span>
                      ({{ warmupScheduleJson.value }})
                    </span>
                  </p>
                </div>
              </div>
            </q-card>

            <!-- Custom Signature -->
            <!--<q-card flat class="profile-preview-card">
              <!~~ top ~~>
              <div class="profile-top-section">
                <LocalSvgIcon
                  image="mail"
                  classes="profile-mail-icon"
                />

                <p class="profile-header-text">
                  Custom Signature
                </p>
              </div>

              <!~~ main ~~>
              <div class="profile-main-section">
                <!~~ content for custom signature ~~>
              </div>
            </q-card>-->
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <q-btn
        no-caps
        unelevated

        color="primary"

        @click="$emit('useWarmupProfile', selectedWarmupProfileDetails)"

        :disable="!selectedWarmupProfileId"
      >
        <p class="text-weight-medium">
          Use this Profile
        </p>
      </q-btn>

      <!-- Add New profile -->
      <q-btn
        flat
        no-caps
        unelevated

        color="primary"
        label="Add New Profile"

        class="light-primary-btn"

        @click="showSaveWarmupProfileModal = true"
      />
    </div>
  </q-card>
</template>

<script>
// lodash
import size from 'lodash/size';

// vue
import {
  defineComponent, onMounted, reactive, toRefs, getCurrentInstance, computed,
} from 'vue';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import SelectWarmupProfile from 'components/Dropdown/SelectWarmupProfile.vue';
import SaveWarmupProfile from 'components/Warmup/Modals/SaveWarmupProfile.vue';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { formatDate1 } from 'src/utils/dates';
import { fetchWarmupProfiles } from 'src/utils/warmupApi';

// constants
import { API_CALLS_MAX_LIMIT } from 'src/boot/constants';
import { WARMUP_SENDING_SCHEDULE } from 'src/boot/warmup-constants';

export default defineComponent({
  name: 'WarmupProfiles',

  emits: ['useWarmupProfile', 'newProfileCreated'],

  components: {
    ApiLoader,
    SaveWarmupProfile,
    SelectWarmupProfile,
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      warmupProfiles: [],
      isApiLoading: false,
      allWarmupProfilesFetched: false,
      showSaveWarmupProfileModal: false,

      selectedWarmupProfileId: null,
    });

    // computed
    const selectedWarmupProfileDetails = computed(() => {
      if (state.selectedWarmupProfileId) {
        return state.warmupProfiles.find(
          (profile) => profile.id === state.selectedWarmupProfileId,
        );
      }

      return null;
    });

    const preferenceItems = computed(() => {
      if (!selectedWarmupProfileDetails.value) {
        return [];
      }

      const {
        start_value, max_warmup_value, ramp_up_value, reply_rate, schedule_timezone,
      } = selectedWarmupProfileDetails.value;

      const items = [
        {
          label: 'Start Volume',
          value: `${start_value} emails/day`,
        },
        {
          label: 'Warm-up Rate',
          value: `${ramp_up_value} emails/day`,
        },
        {
          label: 'Max Volume',
          value: `${max_warmup_value} emails/day`,
        },
        {
          label: 'Reply Rate',
          value: `${reply_rate}%`,
        },
        {
          label: 'Schedule Timezone',
          value: schedule_timezone,
        },
      ];

      return items;
    });

    const warmupScheduleJson = computed(() => {
      if (!selectedWarmupProfileDetails.value) {
        return '';
      }

      const {
        sending_schedule,
      } = selectedWarmupProfileDetails.value;

      if (sending_schedule === WARMUP_SENDING_SCHEDULE.ONLY_WEEKDAYS) {
        return {
          label: 'Only Weekdays',
          value: 'Mon, Tue, Wed, Thu, Fri',
        };
      }

      return {
        label: 'Daily',
        value: 'Mon, Tue, Wed, Thu, Fri, Sat, Sun',
      };
    });

    // methods
    const getAllWarmupProfiles = async () => {
      try {
        state.isApiLoading = true;

        const response = await fetchWarmupProfiles({
          apiEndPoint: '/warmup/profiles',
          apiParams: {
            limit: API_CALLS_MAX_LIMIT,
            offset: size(state.warmupProfiles),
          },
        });

        const responseLength = size(response);

        if (responseLength < API_CALLS_MAX_LIMIT) {
          state.allWarmupProfilesFetched = true;
        }

        if (responseLength > 0) {
          // if no profile is selected, select the first profile by default
          state.selectedWarmupProfileId = state.selectedWarmupProfileId || response[0].id;
        }

        // set state
        state.warmupProfiles = [
          ...state.warmupProfiles,
          ...response,
        ];

        state.isApiLoading = false;
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      }
    };

    const loadMoreOptions = async () => {
      await getAllWarmupProfiles();

      return true;
    };

    const onNewWarmupProfileCreated = (newProfile) => {
      emit('newProfileCreated', newProfile);

      // add new profile to the top of the list
      state.warmupProfiles = [
        newProfile,
        ...state.warmupProfiles,
      ];

      // select the new profile
      state.selectedWarmupProfileId = newProfile.id;

      state.showSaveWarmupProfileModal = false;
    };

    // lifecycle hooks
    onMounted(() => {
      if (isMobileDevice.value) {
        loadMoreOptions();
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      preferenceItems,
      warmupScheduleJson,
      selectedWarmupProfileDetails,

      // methods
      formatDate1,
      loadMoreOptions,
      onNewWarmupProfileCreated,
    };
  },
});
</script>

<style lang="scss" scoped>
.warmup-profiles-card {
  $modalHeaderHeight: 68px;
  position: relative;
  max-width: 738px;
  flex-direction: column;

  // sm min
  @media (min-width: $breakpoint-sm-min) {
    width: 738px;
    min-height: 100%;

    display: flex;
    flex-direction: column;

    .app-modal-content {
      flex: 1;
    }
  }

  @media (min-width: 601px) {
    border-radius: 8px 0px 0px 8px !important;
  }

  @media (min-width: 601px) and (max-width: 737px) {
    // For medium screens, we can set a specific width or use a percentage
    width: calc(100vw - 32px);
  }

  .app-modal-header {
    background: $grey-50;
    height: $modalHeaderHeight;
  }

  .app-modal-content {
    display: flex;
    padding: 0px;
    min-height: 0;

    .all-warmup-profiles-container {
      width: 100%;
      display: flex;
      // include custom scrollbar
      @include custom-scrollbar;

      .warmup-profiles-left-section {
        width: 100%;
        max-width: 228px;
        position: relative;
        overflow-y: auto;

        display: flex;
        flex-direction: column;

        border-right: 1px solid $grey-50;

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          display: none;
        }

        .warmup-profiles-list {
          width: 100%;
          padding:10px;

          .each-warmup-profile {
            min-height: 36px;
            display: flex;
            align-items: center;
            padding: 10px;
            border-radius: 6px;

            .profile-name-text {
              color: $black;
              font-size: 14px;
              font-weight: 400;
              line-height: 16px; /* 114.286% */
            }

            &.active-profile {
              background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);

              .profile-name-text {
                color: $primary;
                font-weight: 500;
              }
            }
          }
        }

        .api-loader-container {
          height: 32px;
          position: relative;

          display: flex;
          justify-content: center;
          align-items: center;
        }
      }

      .warmup-profiles-right-section {
        width: 100%;
        overflow-y: auto;
        position: relative;

        padding: 24px 32px;

        .select-warmup-profile-mobile {
          width: 100%;
          padding-bottom: 20px;
          margin-bottom: 20px;

          border-bottom: 1px solid $grey-50;

          display: none;
        }

        .warmup-profile-name {
          color: $black;
          font-size: 18px;
          font-weight: 600;
        }

        .warmup-profile-created-at {
          color: rgba($color: var(--black-rgb), $alpha: 0.8);
          font-size: 14px;
          font-weight: 400;

          margin-top: 4px;
          margin-bottom: 16px;
        }

        .warmup-profile-preview-container {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;

          .profile-preview-card {
            width: 100%;
            // max-width: 339px;
            border-radius: 6px;
            background: $white;
            border: 1px solid $grey-50;

            .profile-top-section {
              border-bottom: 1px solid $grey-50;
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 20px;

              .profile-header-text {
                color: $black;
                font-size: 16px;
                font-weight: 600;
              }

              :deep(.profile-mail-icon) {
                @include svg-icon-stroke('path, rect', $grey);
              }
            }

            .profile-main-section {
              padding: 24px 20px;

              .preference-item-label {
                margin-bottom: 8px;
                font-size: 14px;
                color: $black;
              }

              .preference-item-value {
                font-size: 14px;
                font-weight: 600;
                color: $black;
              }

              .preference-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 32px 0px;
                margin-bottom: 32px;

                .preference-item {
                  min-width: 0;
                }
              }
            }
          }
        }

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          padding: 24px 12px;

          .select-warmup-profile-mobile {
            display: flex;
          }

          .warmup-profile-preview-container {
            .profile-preview-card {
              max-width: 100%;

              .profile-top-section {
                padding: 20px 12px;
              }

              .profile-main-section {
                padding: 20px 12px;
              }
            }
          }
        }
      }
    }
  }

  .app-modal-footer {
    gap: 12px;
  }
}
</style>
