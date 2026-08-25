<template>
  <q-card
    flat
    class="linkedin-proxy-settings-card app-modal-card"
  >
    <q-form
      class="full-width app-modal-form"
      ref="proxySettingsFormRef"

      @submit.prevent.stop="onSubmit"
    >
      <!-- Header -->
      <div class="app-modal-header">
        <h4 class="modal-header-text">
          Update Proxy
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
        <!-- Subtitle description -->
        <p class="proxy-description-text">
          Proxy configuration. A dedicated residential proxy
          keeps this account's login location consistent.
        </p>

        <!-- Proxy Type Selector -->
        <div class="form-section">
          <InputLabel
            isImportant
            label="Proxy Type"
          />

          <div class="proxy-types-group">
            <div
              v-for="type in proxyTypes"
              :key="type"
              class="proxy-type-btn"
              :class="{ 'proxy-type-btn--active': formData.protocol === type }"
              @click="formData.protocol = type"
            >
              {{ type }}
            </div>
          </div>
        </div>

        <!-- Host -->
        <div class="form-section">
          <InputLabel
            isImportant
            label="Host"
          />

          <q-input
            dense
            outlined
            hide-bottom-space

            v-model="formData.host"
            :rules="[val => !!val?.trim() || 'Host is required']"

            class="app-input"
            lazy-rules="ondemand"
            placeholder="proxy.provider.com"
          />
        </div>

        <!-- Port -->
        <div class="form-section">
          <InputLabel
            isImportant
            label="Port"
          />

          <q-input
            dense
            outlined
            hide-bottom-space

            v-model.number="formData.port"
            :rules="[
              val => (val !== null && val !== '' && val > 0) || 'Port is required',
            ]"

            type="number"
            class="app-input"
            lazy-rules="ondemand"
            placeholder="100010"
          />
        </div>

        <q-separator class="section-separator" />

        <!-- Country Select -->
        <div class="form-section">
          <InputLabel
            isImportant
            label="Country"
          />

          <CountriesSelect
            v-model="formData.country"
            placeholderText="Select Country"
            class="country-select-dropdown"
          />
        </div>

        <q-separator class="section-separator" />

        <!-- Username -->
        <div class="form-section">
          <InputLabel
            isImportant
            label="Username"
          />

          <q-input
            dense
            outlined
            hide-bottom-space

            v-model="formData.username"
            :rules="[val => !!val?.trim() || 'Username is required']"

            class="app-input"
            lazy-rules="ondemand"
            placeholder="user123"
          />
        </div>

        <!-- Password -->
        <div class="form-section">
          <InputLabel
            isImportant
            label="Password"
          />

          <q-input
            dense
            outlined
            hide-bottom-space

            :type="isPasswordInput ? 'password' : 'text'"
            v-model="formData.password"
            :rules="[val => !!val || 'Password is required']"

            class="app-input"
            lazy-rules="ondemand"
            placeholder="••••••••"
          >
            <template v-slot:append>
              <PasswordIconToggle
                :isPasswordInput="isPasswordInput"
                @click="isPasswordInput = !isPasswordInput"
              />
            </template>
          </q-input>
        </div>

        <!-- Proxy Status -->
        <div class="status-section">
          <div class="flex items-center no-wrap gap-sm">
            <span class="status-label">Status:</span>
            <span
              class="status-badge"
              :class="isProxyActive ? 'status-badge--active' : 'status-badge--inactive'"
            >
              {{ isProxyActive ? 'Proxy Connected' : 'Not Configured' }}
            </span>
          </div>

          <div
            v-if="proxyStatusDetails"
            class="status-details-text"
          >
            {{ proxyStatusDetails }}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="app-modal-footer">
        <!-- Update Proxy -->
        <q-btn
          no-caps
          unelevated

          type="submit"
          color="primary"
          label="Update Proxy"

          :loading="isSaving"
        />

        <!-- Cancel -->
        <q-btn
          flat
          no-caps
          unelevated

          color="primary"
          label="Cancel"
          class="light-primary-btn q-ml-md"

          v-close-popup
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// lodash
import get from 'lodash/get';

// countries list
import { countries } from 'countries-list';

// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance, watch, computed, onMounted,
} from 'vue';

// Components
import InputLabel from 'src/components/Form/InputLabel.vue';
import CountriesSelect from 'src/components/Dropdown/CountriesSelect.vue';
import PasswordIconToggle from 'src/components/Password/PasswordIconToggle.vue';

// Utils
import { updateLinkedInProxy } from 'src/utils/connectedAccountsApi';

export default defineComponent({
  name: 'LinkedInProxySettings',

  emits: ['proxySettingsUpdated'],

  components: {
    InputLabel,
    CountriesSelect,
    PasswordIconToggle,
  },

  props: {
    editLinkedInJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      formData: {
        protocol: 'HTTPS',
        host: '',
        port: null,
        country: '',
        username: '',
        password: '',
      },
      isPasswordInput: true,
      isSaving: false,
      proxySettingsFormRef: null,
    });

    const proxyTypes = ['HTTP', 'HTTPS', 'SOCKS5'];

    // computed
    const isProxyActive = computed(() => {
      const { host, country } = state.formData;
      return !!(host?.trim() || country);
    });

    const proxyStatusDetails = computed(() => {
      const { host, country } = state.formData;
      const parts = [];

      if (host) {
        parts.push(`Host: ${host}`);
      }

      if (country) {
        const countryName = get(countries, `${country}.name`, country);
        parts.push(countryName);
      }

      return parts.join(' · ');
    });

    // methods
    const onSubmit = async () => {
      try {
        state.isSaving = true;

        const payload = {
          proxy_details: {
            host: state.formData.host?.trim() || '',
            port: Number(state.formData.port) || 0,
            protocol: state.formData.protocol.toLowerCase(),
            username: state.formData.username?.trim() || '',
            password: state.formData.password || '',
          },
          auto_proxy_country: state.formData.country || null,
        };

        await updateLinkedInProxy({
          accountId: props.editLinkedInJson.id,
          payload,
        });

        emit('proxySettingsUpdated', {
          ...props.editLinkedInJson,
          proxy_country: state.formData.country,
          proxy_details: payload.proxy_details,
        });

        appContext.config.globalProperties.$toast({
          message: 'Proxy settings updated successfully',
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isSaving = false;
      }
    };

    const initFormDataFromProps = () => {
      const details = props.editLinkedInJson?.proxy_details || {};
      const country = props.editLinkedInJson?.proxy_country || '';

      state.formData = {
        protocol: (details.protocol || 'HTTPS').toUpperCase(),
        host: details.host || '',
        port: details.port || null,
        country,
        username: details.username || '',
        password: details.password || '',
      };
    };

    // lifecycle hooks
    onMounted(() => {
      initFormDataFromProps();
    });

    watch(
      () => props.editLinkedInJson,
      () => {
        initFormDataFromProps();
      },
      { immediate: true, deep: true },
    );

    return {
      // state
      ...toRefs(state),

      // constants
      proxyTypes,

      // computed
      isProxyActive,
      proxyStatusDetails,

      // methods
      onSubmit,
    };
  },
});
</script>

<style lang="scss" scoped>
.linkedin-proxy-settings-card {
  position: relative;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  flex: 1;

  // sm min
  @media (min-width: $breakpoint-sm-min) {
    width: 640px;
    min-height: 100%;

    display: flex;
    flex-direction: column;
  }

  @media (min-width: 601px) {
    border-radius: 8px 0px 0px 8px !important;
  }

  @media (min-width: 601px) and (max-width: 685px) {
    width: calc(100vw - 32px);
  }

  .app-modal-form {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .app-modal-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 20px 12px;
    }

    .proxy-description-text {
      font-size: 14px;
      color: $black;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 6px;

      .proxy-types-group {
        display: flex;
        gap: 12px;
        align-items: center;

        .proxy-type-btn {
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid $blue-grey;
          font-size: 14px;
          color: $black;
          line-height: 16px;
          cursor: pointer;
          background: $white;
          transition: all 0.2s ease;
          user-select: none;

          &:hover {
            border-color: rgba(var(--primary-rgb), 0.4);
          }

          &--active {
            color: $primary;
            font-weight: 500;
            border-color: $primary;
            background: rgba(var(--primary-rgb), 0.1);
          }
        }
      }

      .app-input {
        width: 100%;

        :deep(.q-field__native) {
          font-size: 14px;
        }

        .password-toggle-icon {
          color: $grey-400;
          font-size: 18px;
        }
      }

      .country-select-dropdown {
        width: 100%;
      }
    }

    .section-separator {
      background: $grey-50;
      margin: 4px 0;
    }

    .status-section {
      margin-top: 4px;
      padding-top: 12px;
      border-top: 1px solid $grey-50;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .status-label {
        font-size: 13px;
        font-weight: 500;
        color: $grey-700;
      }

      .status-badge {
        font-size: 11px;
        font-weight: 600;
        border-radius: 4px;
        padding: 2px 8px;
        line-height: 16px;

        &--active {
          color: $positive;
          background: rgba(var(--positive-rgb), 0.1);
        }

        &--inactive {
          color: $grey-400;
          background: $grey-50;
        }
      }

      .status-details-text {
        font-size: 12px;
        color: $grey-400;
        line-height: 16px;
      }
    }
  }
}
</style>
