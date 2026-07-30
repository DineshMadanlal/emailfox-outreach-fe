<template>
  <q-card flat class="app-modal-card save-campaign-name-card">
    <q-form
      class="full-width"
      ref="saveCampaignNameFormRef"

      @submit.prevent.stop="onSaveName"
    >
      <!-- header -->
      <div class="app-modal-header">
        <!--  -->
        <h4
          v-if="isNewCampaign"
          class="modal-header-text"
        >
          Create New Campaign
        </h4>

        <!--  -->
        <h4
          v-else
          class="modal-header-text"
        >
          Edit Campaign {{ isUpdateName ? 'Name' : 'Type' }}
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

            v-model="campaignName"

            lazy-rules="ondemand"
            class="input-width-maxed"
            placeholder="e.g. Welcome Campaign"
            :rules="[val => !!val || 'Name is required']"

            @update:model-value="onInputChange"
          />
        </div>

        <!-- Channel Type -->
        <div
          v-if="isNewCampaign"
          class="full-width"
        >
          <InputLabel
            label="Channel Type"
          />

          <div class="campaign-options-flex">
            <!--  -->
            <q-card
              flat

              v-for="option in campaignTypeOptions"
              :key="option.value"

              class="campaign-option-card"
              :class="{ 'selected': campaignType === option.value }"

              @click="campaignType = option.value"
            >
              <q-radio
                dense
                color="primary"
                class="each-campaign-option-radio"

                :val="option.value"
                v-model="campaignType"
              >
                <div>
                  <div class="radio-header-img-flex">
                    <div class="radio-header-text">
                      {{ option.label }}
                    </div>

                    <LocalSvgIcon
                      v-for="imgOption in option.icons"
                      :key="imgOption.image"

                      :image="imgOption.image"
                      :classes="imgOption.classes"
                    />
                  </div>

                  <div class="radio-desc-text">
                    {{ option.description }}
                  </div>
                </div>
              </q-radio>
            </q-card>
          </div>
        </div>
      </div>

      <!-- footer -->
      <div class="app-modal-footer">
        <!-- Create/Update -->
        <q-btn
          no-caps
          unelevated

          type="submit"
          color="primary"
          :loading="isApiLoading"
          :label="isNewCampaign ? 'Create' : 'Update'"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  computed, defineComponent, getCurrentInstance, onMounted, reactive, toRefs,
} from 'vue';

// router
import { useRouter } from 'vue-router';

// Components
import InputLabel from 'components/Form/InputLabel.vue';

// utils
import { postApiCall, patchApiCall } from 'src/utils/apiRequests';

// constants
import { CAMPAIGN_TYPES } from 'boot/campaign-constants';

export default defineComponent({
  name: 'SaveCampaignDetails',

  emits: ['onUpdateCampaign'],

  components: {
    InputLabel,
  },

  props: {
    campaignJson: {
      type: Object,
      default: () => {},
    },
    isUpdateName: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // router
    const $router = useRouter();

    // state
    const state = reactive({
      campaignName: '',
      isApiLoading: false,
      saveCampaignNameFormRef: null,

      campaignType: CAMPAIGN_TYPES.EMAIL.value,
    });

    // computed
    const isNewCampaign = computed(() => isEmpty(props.campaignJson));

    const campaignTypeOptions = computed(() => [
      CAMPAIGN_TYPES.EMAIL,
      CAMPAIGN_TYPES.LINKEDIN,
      CAMPAIGN_TYPES.MULTI_CHANNEL,
    ]);

    // methods
    const createNewCampaign = async () => {
      try {
        const payload = {
          name: state.campaignName,
          type: state.campaignType,
        };

        // API call
        const response = await postApiCall({
          payload,
          endpoint: '/sequences',
          includeWorkspace: true,
        });

        const campaignId = response.id;

        // route to the campaign edit page
        $router.push(`/outreach/campaigns/${campaignId}/edit`);
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to create new campaign. Please try again later.',
        });
      }
    };

    const updateCampaignName = async () => {
      try {
        const payload = {
          name: state.campaignName,
        };

        // update API
        await patchApiCall({
          endpoint: `sequences/${props.campaignJson.id}/rename`,
          payload,
          includeWorkspace: true,
        });

        appContext.config.globalProperties.$toast({
          message: 'Updated Sucessfully',
        });

        emit('onUpdateCampaign', {
          ...props.campaignJson,
          name: state.campaignName,
        });
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to update the campaign name. Please try again later.',
        });
      }
    };

    const updateCampaignType = async () => {
      try {
        const payload = {
          type: state.campaignType,
        };

        // update API
        await patchApiCall({
          endpoint: `sequences/${props.campaignJson.id}/type`,
          payload,
          includeWorkspace: true,
        });

        appContext.config.globalProperties.$toast({
          message: 'Updated Sucessfully',
        });

        emit('onUpdateCampaign', {
          ...props.campaignJson,
          type: state.campaignType,
        });
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to update the campaign name. Please try again later.',
        });
      }
    };

    const onSaveName = async () => {
      state.isApiLoading = true;

      if (isNewCampaign.value) {
        await createNewCampaign();
      } else if (props.isUpdateName) {
        await updateCampaignName();
      } else {
        await updateCampaignType();
      }

      state.isApiLoading = false;
    };

    const onInputChange = () => {
      state.saveCampaignNameFormRef.resetValidation();
    };

    onMounted(() => {
      // set initial name
      state.campaignName = props.campaignJson?.name || '';
      state.campaignType = props.campaignJson?.type || CAMPAIGN_TYPES.MULTI_CHANNEL.value;
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isNewCampaign,
      campaignTypeOptions,

      // methods
      onSaveName,
      onInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.save-campaign-name-card {
  max-width: 600px;

  .app-modal-footer {
    gap: 16px;
  }

  .app-modal-content {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .input-width-maxed {
      width: 100%;
      max-width: 424px;
    }

    .campaign-options-flex {
      width: 100%;
      max-width: 500px;
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      border: 1px solid $grey-50;

      .campaign-option-card {
        width: 100%;
        background: $white;
        cursor: pointer;
        border-bottom: 1px solid $grey-50;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: rgba(var(--primary-rgb), 0.02);
        }

        &.selected {
          background: rgba(var(--primary-rgb), 0.04);
        }

        :deep(.each-campaign-option-radio) {
          padding: 20px 16px;
          align-items: flex-start;

          .radio-header-img-flex {
            display: flex;
            gap: 8px;
            align-items: center;

            .radio-header-text {
              color: $black;
              font-size: 14px;
              font-weight: 500;
            }

            .mail-icon {
              width: 14px;

              @include svg-icon-stroke('rect, path', $warning);
            }
          }

          .radio-desc-text {
            margin-top: 4px;

            color: $grey;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
          }

          .q-radio__inner {
            position: relative;
            top: 2px
          }

          // xs max
          @media (max-width: $breakpoint-xs-max) {
            padding: 16px 12px;
          }
        }
      }

      // sm max
      @media (max-width: $breakpoint-sm-max) {
        flex-wrap: wrap;
      }
    }
  }
}
</style>
