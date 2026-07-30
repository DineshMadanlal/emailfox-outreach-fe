<template>
  <div class="theme-settings">
    <!-- Header -->
    <div class="settings-section-header">
      <!-- left side -->
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          App Theme
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          Manage your app theme and mode accessabilities
        </p>
      </div>

      <!-- right side -->
      <div class="settings-header-right-side">
      </div>
    </div>

    <!-- Content -->
    <div class="settings-section-content">
      <!-- Mode -->
      <div
        v-if="false"
        class="each-theme-section"
      >
        <p class="theme-type-text">
          Choose Mode
        </p>

        <p class="theme-desc-text">
          Choose if appearance should be light or dark, or follow your computer’s settings.
        </p>

        <div class="app-modes-grid">
          <SelectMode
            v-for="(mode, index) in supportedModes"
            :key="`app-mode-${index}-${mode.label}`"

            :label="mode.label"
            :image="mode.image"
            :isActive="mode.value === selectedMode"

            @click="onUpdateMode(mode.value)"
          />
        </div>
      </div>

      <!-- Theme -->
      <div class="each-theme-section">
        <p class="theme-type-text">
          Select Theme
        </p>

        <p class="theme-desc-text">
          Choose from a range of predefined colors or
          customize your own to personalize your experience.
        </p>

        <div class="app-modes-grid">
          <SelectTheme
            v-for="(mode, key, index) in supportedThemes"
            :key="`app-theme-${index}-${key}`"

            :label="mode.label"
            :color="mode.value"
            :isActive="mode.value === defaultThemeColor"

            @click="onUpdateTheme(mode.value)"
          />
        </div>

        <!-- Set Custom THeme -->
        <q-btn
          flat
          no-caps
          unelevated

          color="primary"
          class="q-mt-md"
          label="Set Custom Color"

          v-if="!customThemeColor"

          @click="setCustomThemeColorManually"
        >
        </q-btn>
      </div>

      <!-- Custom Theme -->
      <div
        v-if="customThemeColor"
        class="each-theme-section custom-theme-section"
      >
        <p class="theme-type-text">
          Custom Theme
        </p>

        <p class="theme-desc-text">
          Choose your organization’s primary color. It will change the app color.
        </p>

        <!-- Set Custom Color -->
        <SelectTheme
          isActive
          :color="customThemeColor"
          :label="customThemeColor"
        >
          <q-menu v-model="showColorPicker">
            <q-color
              v-model="customThemeColor"
              @update:modelValue="onCustomColorInputChange"
            />
          </q-menu>
        </SelectTheme>
      </div>

    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, computed, reactive, toRefs,
  onMounted, getCurrentInstance, watch,
} from 'vue';

// quasar
import { useMeta, debounce } from 'quasar';

// composition api
import { useWorkspace } from 'src/composables/useWorkspace';
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Import the Pinia store
import { useUserPreferencesStore } from 'src/stores/userPreferences.js';

// Components
import SelectMode from 'src/components/Themes/SelectMode.vue';
import SelectTheme from 'src/components/Themes/SelectTheme.vue';

// utils
import { isSupportedThemeColor } from 'src/utils/helperFunctions';
import { updatePrimaryAndSecondaryColor } from 'src/utils/quasarHelpers';
import { isMainApp, getPrimaryBrandColor } from 'src/utils/applyBranding';

// constants
import { APP_MODE, SUPPORTED_THEMES } from 'boot/constants';

export default defineComponent({
  name: 'AppTheme',

  components: {
    SelectMode,
    SelectTheme,
  },

  setup() {
    // app context
    const { appContext } = getCurrentInstance();

    // Access the user store
    const userStore = useUserPreferencesStore();

    // composition API
    const {
      // computed
      activeWorkspaceJson,

      // methods
      updateWorkspaceById,
    } = useWorkspace();
    const { generateMetadata, updateAppMode } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('App Theme'));

    // state
    const state = reactive({
      showColorPicker: false,
      customThemeColor: '',
      defaultThemeColor: '',
    });

    // Create a computed property to access the current app mode
    const isPrimaryApp = computed(() => isMainApp());

    // computed
    const supportedModes = computed(() => [
      {
        label: 'Light Mode',
        image: 'light-mode',
        value: APP_MODE.LIGHT_MODE,
      },
      {
        label: 'Dark Mode',
        image: 'dark-mode',
        value: APP_MODE.DARK_MODE,
      },
      {
        label: 'System Default',
        image: 'default-mode',
        value: APP_MODE.DEFAULT_MODE,
      },
    ]);

    const supportedThemes = computed(() => {
      const themes = { ...SUPPORTED_THEMES };

      if (!isPrimaryApp.value) {
        delete themes.DEFAULT;

        // blue
        themes.BLUE = {
          label: 'Blue',
          value: '#1C1F26',
        };
      }

      return themes;
    });

    const selectedMode = computed(() => APP_MODE.DEFAULT_MODE);

    const selectedTheme = computed(() => {
      if (activeWorkspaceJson.value.theme_color) {
        return activeWorkspaceJson.value.theme_color;
      }

      return '';
    });

    const supportedThemeColorSelected = computed(() => isSupportedThemeColor(selectedTheme.value));

    // methods
    const onUpdateWorkspaceTheme = async (theme) => {
      try {
        await updateWorkspaceById(activeWorkspaceJson.value.id, {
          ...activeWorkspaceJson.value,
          theme_color: theme,
        });

        return true;
      } catch (error) {
        // show error toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });

        return false;
      }
    };

    const saveCustomThemeColor = debounce(async (color) => {
      await onUpdateWorkspaceTheme(color);
    }, 500);

    const onUpdateMode = (newMode) => {
      userStore.setField({ field: 'appMode', value: newMode });
      updateAppMode(newMode);
    };

    const onUpdateTheme = (theme) => {
      state.defaultThemeColor = theme;

      saveCustomThemeColor(theme);

      updatePrimaryAndSecondaryColor(theme);
    };

    const onCustomColorInputChange = () => {
      state.showColorPicker = true;

      saveCustomThemeColor(state.customThemeColor);

      updatePrimaryAndSecondaryColor(state.customThemeColor);
    };

    const setCustomThemeColorManually = () => {
      const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');

      state.customThemeColor = primaryColor;
    };

    onMounted(() => {
      if (selectedTheme.value) {
        if (supportedThemeColorSelected.value) {
          // if the selected theme is from supported themes, set it as default theme color
          state.defaultThemeColor = selectedTheme.value;
        } else {
          // if the selected theme is a custom color, set it as custom theme color
          state.customThemeColor = selectedTheme.value;
        }

        updatePrimaryAndSecondaryColor(selectedTheme.value);
      } else if (!isPrimaryApp.value) {
        const defaultColor = getPrimaryBrandColor();

        updatePrimaryAndSecondaryColor(defaultColor);
      }
    });

    watch(() => supportedThemeColorSelected.value, (newVal) => {
      if (newVal) {
        state.customThemeColor = '';
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      selectedMode,
      selectedTheme,
      supportedModes,
      supportedThemes,
      supportedThemeColorSelected,

      // methods
      onUpdateMode,
      onUpdateTheme,
      onCustomColorInputChange,
      setCustomThemeColorManually,
    };
  },
});
</script>

<style lang="scss" scoped>
.theme-settings {
  width: 100%;

  .settings-section-content {
    width: 100%;
    padding-bottom: 20px;
  }

  .each-theme-section {
    width: 100%;
    // padding-top: 40px;

    &.custom-theme-section {
      padding-top: 40px;
    }

    .theme-type-text {
      color: $black;
      font-size: 16px;
      font-weight: 500;
    }

    .theme-desc-text {
      color: rgba($color: var(--black-rgb), $alpha: 0.8);
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;

      margin-bottom: 24px;
    }

    .app-modes-grid {
      display: flex;
      align-items: center;
      flex-wrap: wrap;

      max-width: 730px;

      gap: 20px;
    }
  }
}
</style>
