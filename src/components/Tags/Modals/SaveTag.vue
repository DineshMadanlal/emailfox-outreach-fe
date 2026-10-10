<template>
  <q-card flat class="app-modal-card save-tag-card">
    <q-form
      class="full-width"
      ref="saveTagFormRef"
      @submit.prevent.stop="onSaveTag"
    >
      <!-- header -->
      <div class="app-modal-header">
        <h4 class="modal-header-text">
          {{ isNewTag ? 'Create' : 'Edit' }} Tag
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
        <!-- Tag Name -->
        <div class="full-width">
          <InputLabel
            isImportant
            label="Tag Name"
          />

          <q-input
            dense
            outlined
            autofocus
            hide-bottom-space
            v-model="name"
            class="input-width-maxed"
            placeholder="e.g. New Prospect"
            lazy-rules="ondemand"
            :rules="[val => !!val?.trim() || 'Tag Name is required']"
            @update:model-value="onInputChange"
          />
        </div>

        <!-- Pick Tag Color -->
        <div class="full-width">
          <InputLabel
            isImportant
            label="Pick Tag Color"
          />

          <div class="color-options-row">
            <div
              v-for="colorItem in PRESET_COLORS"
              :key="colorItem"
              class="color-swatch-item"
              :style="{
                backgroundColor: colorItem,
                boxShadow: color === colorItem ? `0 0 0 2px white, 0 0 0 4px ${colorItem}` : ''
              }"
              :class="{
                active: color === colorItem
              }"
              @click="color = colorItem"
            >
              <q-icon
                v-if="color === colorItem"
                name="check"
                color="white"
                size="16px"
              />
            </div>

            <!-- Custom Color Picker -->
            <div
              class="color-picker-btn"
              :class="{ active: isCustomColor }"
              :style="isCustomColor ? {
                borderColor: color,
                color: color,
              } : {}"
            >
              <q-icon name="colorize" size="18px" class="custom-color-icon" />

              <q-popup-proxy
                transition-show="scale"
                transition-hide="scale"
              >
                <q-color v-model="color" />
              </q-popup-proxy>
            </div>
          </div>
        </div>

        <!-- Tag Preview -->
        <div class="full-width">
          <InputLabel label="Tag Preview" />

          <div class="tag-preview-container">
            <div
              class="tag-preview-chip"
              :style="{
                backgroundColor: getTagRgbaColor(color, 0.12),
                color: color || '#2563EB',
                borderColor: getTagRgbaColor(color, 0.25),
              }"
            >
              {{ name?.trim() }}
            </div>
          </div>
        </div>
      </div>

      <!-- footer -->
      <div class="app-modal-footer">
        <q-btn
          no-caps
          unelevated
          type="submit"
          color="primary"
          :loading="isApiLoading"
          :label="isNewTag ? 'Create' : 'Update'"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// quasar
import { colors } from 'quasar';

// vue
import {
  computed,
  defineComponent,
  getCurrentInstance,
  onMounted,
  reactive,
  toRefs,
} from 'vue';

// Components
import InputLabel from 'components/Form/InputLabel.vue';
import LocalSvgIcon from 'components/Global/LocalSvgIcon.vue';

// Utils
import { postApiCall, putApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'SaveTag',

  emits: ['onSuccessSaveTag'],

  components: {
    InputLabel,
    LocalSvgIcon,
  },

  props: {
    tagJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // Preset color options matching design spec
    const PRESET_COLORS = [
      '#2563EB', // Blue
      '#0D9488', // Teal
      '#BE185D', // Magenta/Pink
      '#581C87', // Dark Purple
      '#D97706', // Orange/Amber
      '#374151', // Slate/Charcoal
    ];

    // state
    const state = reactive({
      name: '',
      color: PRESET_COLORS[0],
      isApiLoading: false,
      saveTagFormRef: null,
    });

    // computed
    const isNewTag = computed(() => isEmpty(props.tagJson) || !props.tagJson?.id);
    const isCustomColor = computed(() => !PRESET_COLORS.includes(state.color));

    // Quasar color helper for RGBA conversion
    const getTagRgbaColor = (hexColor, alpha = 0.12) => {
      if (!hexColor) return `rgba(37, 99, 235, ${alpha})`;
      const rgb = colors.hexToRgb(hexColor);
      if (!rgb) return `rgba(37, 99, 235, ${alpha})`;
      return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    };

    // API calls
    const createTag = async () => {
      const payload = {
        name: state.name.trim(),
        color: state.color,
      };

      const response = await postApiCall({
        payload,
        endpoint: '/tags',
        includeWorkspace: true,
      });

      appContext.config.globalProperties.$toast({
        message: 'Tag created successfully',
      });

      const result = response?.data || response;

      // emit
      emit('onSuccessSaveTag', result);
    };

    const updateTag = async () => {
      const payload = {
        name: state.name.trim(),
        color: state.color,
      };

      const response = await putApiCall({
        endpoint: `/tags/${props.tagJson.id}`,
        payload,
        includeWorkspace: true,
      });

      appContext.config.globalProperties.$toast({
        message: 'Tag updated successfully',
      });

      const result = response?.data || response;

      // emit
      emit('onSuccessSaveTag', result);
    };

    const onSaveTag = async () => {
      try {
        state.isApiLoading = true;

        if (isNewTag.value) {
          await createTag();
        } else {
          await updateTag();
        }
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to save tag',
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    const onInputChange = () => {
      // reset validation
      if (state.saveTagFormRef) {
        state.saveTagFormRef.resetValidation();
      }
    };

    // lifecycle hooks
    onMounted(() => {
      if (!isNewTag.value) {
        state.name = props.tagJson?.name || '';
        state.color = props.tagJson?.color || PRESET_COLORS[0];
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isNewTag,
      isCustomColor,
      PRESET_COLORS,

      // methods
      getTagRgbaColor,
      onSaveTag,
      onInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.save-tag-card {
  max-width: 540px;
  width: 100%;

  .app-modal-content {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .input-width-maxed {
      width: 100%;
    }

    .color-options-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;

      .color-swatch-item {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;

        transition: transform 0.15s ease, box-shadow 0.15s ease;

        &:hover {
          transform: scale(1.08);
        }

        &.active {
          transform: scale(1.1);
        }
      }

      .color-picker-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1px dashed $grey-100;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: $grey;
        transition: transform 0.15s ease,
        border-color 0.15s ease, background 0.15s ease;

        &.active {
          transform: scale(1.1);
        }

        &:hover {
          border-color: $primary;
          background: rgba(var(--primary-rgb), 0.05);

          &:not(.active) {
            color: $primary;
          }
        }

        .custom-color-icon {
          color: inherit;
        }
      }
    }

    .tag-preview-container {
      margin-top: 8px;

      .tag-preview-chip {
        display: inline-flex;
        align-items: center;
        padding: 4px 8px;
        border-radius: 50px;
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
        border: 1px solid transparent;
        transition: all 0.2s ease;
      }
    }
  }

  .app-modal-footer {
    display: flex;
    justify-content: flex-start;
    padding-top: 16px;
  }
}
</style>
