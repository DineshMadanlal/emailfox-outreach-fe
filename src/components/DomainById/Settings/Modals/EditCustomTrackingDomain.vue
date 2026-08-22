<template>
  <q-card flat class="app-modal-card edit-custom-tracking-domain-card">
    <q-form
      class="full-width"
      ref="trackingDomainFormRef"
      @submit.prevent.stop="onSave"
    >
      <!-- header -->
      <div class="app-modal-header">
        <h4 class="modal-header-text">
          Custom Tracking Domain
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
        <div class="modal-content-container">
          <p class="instruction-desc">
            Add a <strong>CNAME</strong> record in your
            DNS provider settings pointing to our tracking domain:
          </p>

          <!-- DNS Record Table -->
          <div class="dns-record-table">
            <div class="dns-row dns-header-row">
              <span class="dns-col type-col">Type</span>
              <span class="dns-col host-col">Host</span>
              <span class="dns-col value-col">Points to / Value</span>
            </div>

            <div class="dns-row dns-data-row">
              <span class="dns-col type-col type-badge">CNAME</span>

              <div class="dns-col host-col flex items-center no-wrap">
                <span class="host-text">track</span>

                <InfoTooltip
                  iconName="circle-question"
                  tooltipText="You can use any subdomain of your
                  choice (e.g. route, track, mail, etc.)"
                />
              </div>

              <div class="dns-col value-col flex items-center justify-between no-wrap">

                <span class="cname-value-text ellipsis" :title="cnameTarget">
                  {{ cnameTarget }}
                </span>

                <!-- Copy to clipboard -->
                <q-btn
                  flat
                  round
                  dense
                  class="copy-btn"
                  @click="onCopyCnameTarget"
                >
                  <LocalSvgIcon
                    image="copy"
                    classes="copy-icon"
                  />

                  <AppTooltip content="Copy to clipboard" />
                </q-btn>
              </div>
            </div>
          </div>

          <!-- Tip Card -->
          <TipCard
            class="full-width q-my-md"
            tipText="DNS changes can take up to 24-48 hours to
            propagate globally, but often take effect within a few minutes."
          />

          <!-- Input field -->
          <div class="domain-input-section">
            <InputLabel
              label="Custom Tracking Domain"
            />

            <q-input
              dense
              outlined
              hide-bottom-space
              v-model.trim="domain"
              placeholder="e.g. track.yourdomain.com"
              lazy-rules="ondemand"
              :rules="domainRules"
              @update:modelValue="onDomainChange"
            >
              <template v-if="isVerified && domain" v-slot:append>
                <LocalSvgIcon
                  image="basic-tick"
                  classes="verified-tick-icon"
                />
              </template>
            </q-input>
          </div>
        </div>
      </div>

      <!-- footer -->
      <div class="app-modal-footer">
        <!-- Save / Verify & Save -->
        <q-btn
          no-caps
          unelevated
          color="primary"
          :label="saveButtonLabel"
          :loading="isApiLoading"
          type="submit"
        />

        <!-- Verify button -->
        <q-btn
          flat
          no-caps
          unelevated
          color="primary"
          label="Verify"
          class="q-ml-sm light-primary-btn"
          :loading="isVerifying"
          :disable="!domain || isApiLoading"
          @click="onVerify"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, onMounted, computed, getCurrentInstance,
} from 'vue';

// quasar
import { copyToClipboard } from 'quasar';

// components
import TipCard from 'components/General/TipCard.vue';
import InputLabel from 'components/Form/InputLabel.vue';
import AppTooltip from 'components/General/AppTooltip.vue';
import InfoTooltip from 'components/General/InfoTooltip.vue';

// utils
import { bulkUpdateDomains, verifyTrackingUrlByDomainId } from 'src/utils/domainMailboxesApi';

// constants
import { CUSTOM_TRACKING_URL_REGEX } from 'boot/constants';

const CNAME_TARGET = 'cdn.sys-gateway.com';

export default defineComponent({
  name: 'EditCustomTrackingDomain',

  components: {
    TipCard,
    InputLabel,
    AppTooltip,
    InfoTooltip,
  },

  props: {
    domainByJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  emits: ['onSuccessfulUpdate'],

  setup(props, { emit }) {
    const { appContext } = getCurrentInstance();

    const state = reactive({
      domain: '',
      isVerified: false,
      isVerifying: false,
      isApiLoading: false,
      trackingDomainFormRef: null,
      cnameTarget: CNAME_TARGET,
    });

    const domainRules = [
      (val) => !val || CUSTOM_TRACKING_URL_REGEX.test(val) || 'Please enter a valid tracking domain (e.g. track.yourdomain.com)',
    ];

    const saveButtonLabel = computed(() => {
      if (!state.domain) return 'Save';
      return state.isVerified ? 'Save' : 'Verify & Save';
    });

    const onDomainChange = () => {
      state.isVerified = false;
      state.trackingDomainFormRef?.resetValidation();
    };

    const onCopyCnameTarget = () => {
      copyToClipboard(CNAME_TARGET).then(() => {
        appContext.config.globalProperties.$toast({
          message: 'Copied to clipboard',
        });
      });
    };

    const onVerify = async () => {
      try {
        const isValid = await state.trackingDomainFormRef?.validate();
        if (!isValid) return;

        if (!state.domain) return;

        state.isVerifying = true;

        if (props.domainByJson?.id) {
          await verifyTrackingUrlByDomainId({
            payload: { tracking_domain_url: state.domain.trim() },
          });
        }

        state.isVerified = true;

        appContext.config.globalProperties.$toast({
          message: 'Custom tracking domain verified successfully',
        });
      } catch (error) {
        state.isVerified = false;
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'DNS verification failed. Please ensure the CNAME record is configured correctly.',
        });
      } finally {
        state.isVerifying = false;
      }
    };

    const onSave = async () => {
      try {
        const isValid = await state.trackingDomainFormRef?.validate();
        if (!isValid) return;

        state.isApiLoading = true;

        const cleanDomain = state.domain ? state.domain.trim() : '';
        const isDomainEmpty = !cleanDomain;

        // If domain is provided and not verified yet, verify first
        if (!isDomainEmpty && !state.isVerified && props.domainByJson?.id) {
          try {
            await verifyTrackingUrlByDomainId({
              payload: { tracking_domain_url: cleanDomain },
            });
            state.isVerified = true;
          } catch (_) {
            // continue saving even if DNS check fails or let it save
          }
        }

        const updateFields = {};

        if (isDomainEmpty) {
          updateFields.clear_tracking_domain_url = true;
        } else {
          updateFields.tracking_domain_url = cleanDomain;
        }

        const payload = {
          filter: {
            domain_ids: [props.domainByJson.id],
          },
          update_fields: {
            ...updateFields,
          },
        };

        await bulkUpdateDomains(payload);

        appContext.config.globalProperties.$toast({
          message: 'Custom tracking domain updated successfully',
        });

        const updatedMailbox = {
          ...props.domainByJson,
          tracking_domain_url: isDomainEmpty ? '' : cleanDomain,
        };

        emit('onSuccessfulUpdate', updatedMailbox);
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    onMounted(() => {
      state.domain = props.domainByJson.tracking_domain_url || '';
      if (state.domain) {
        state.isVerified = true;
      }
    });

    return {
      ...toRefs(state),
      domainRules,
      saveButtonLabel,
      onDomainChange,
      onCopyCnameTarget,
      onVerify,
      onSave,
    };
  },
});
</script>

<style lang="scss" scoped>
.edit-custom-tracking-domain-card {
  max-width: 580px;
  width: 100%;

  .app-modal-content {
    .modal-content-container {
      width: 100%;
      display: flex;
      flex-direction: column;

      .instruction-desc {
        color: rgba($color: var(--black-rgb), $alpha: 0.8);
        font-size: 14px;
      }

      .dns-record-table {
        width: 100%;
        padding: 6px;
        background: rgba($color: var(--primary-rgb), $alpha: 0.1);
        border-radius: 6px 4px;
        overflow: hidden;
        margin-bottom: 8px;
        margin-top: 12px;

        .dns-row {
          display: grid;
          grid-template-columns: 80px 100px 1fr;
          align-items: center;
          padding: 8px 16px;
          gap: 12px;

          &.dns-header-row {
            border-bottom: 1px solid $grey-50;

            .dns-col {
              color: $grey;
              font-size: 13px;
              font-weight: 500;
              letter-spacing: 0.26px;
              text-transform: uppercase;
            }
          }

          &.dns-data-row {
            background: $white;

            .type-badge {
              font-size: 14px;
              color: $black;
            }

            .host-text {
              font-size: 14px;
              color: $primary;
              user-select: all;

              margin-right: 4px;
            }

            .cname-value-text {
              font-size: 14px;
              color: $primary;
              font-family: monospace;
              user-select: all;
            }

            .copy-btn {
              padding: 4px;
              margin-left: 6px;

              :deep(.copy-icon) {
                width: 14px;
                height: 14px;

                @include svg-icon-stroke('path', $primary);
              }
            }
          }
        }
      }

      .domain-input-section {
        margin-top: 8px;

        .verified-tick-icon {
          width: 16px;
          height: 16px;

          @include svg-icon-stroke('path', $positive);
        }
      }
    }
  }
}
</style>
