<template>
  <div
    v-if="displayName"
    class="reply-category-pill flex items-center no-wrap"
  >
    <!-- AI Stars Icon (Displayed when AI-categorised) -->
    <LocalSvgIcon
      v-if="isAiCategorised"
      image="stars"
      class="ai-stars-icon"
    />

    <!-- Sentiment Dot Indicator -->
    <span
      class="category-status-dot"
      :style="{ backgroundColor: dotColor }"
    />

    <!-- Category Label -->
    <span
      class="category-text ellipsis"
      :title="displayName"
    >
      {{ displayName }}
    </span>

    <!-- Hover Tooltip -->
    <AppTooltip
      v-if="tooltipContent"
      :content="tooltipContent"
    />
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

// stores
import { useUniboxStore } from 'src/stores/unibox';

// utils
import { getBrandColorByName } from 'src/utils/quasarHelpers';

// constants
import { REPLY_SENTIMENT } from 'boot/campaign-constants';

export default defineComponent({
  name: 'ReplyCategoryPill',

  components: {
    AppTooltip,
  },

  props: {
    categoryId: {
      type: [Number, String],
      default: null,
    },
    categoryName: {
      type: String,
      default: '',
    },
    sentiment: {
      type: String,
      default: '',
    },
    isAiCategorised: {
      type: Boolean,
      default: false,
    },
    confidence: {
      type: Number,
      default: null,
    },
    tooltip: {
      type: [String, Boolean],
      default: true,
    },
  },

  setup(props) {
    const uniboxPinia = useUniboxStore();

    // Matched category object from Pinia store
    const categoryFromStore = computed(() => {
      if (!props.categoryId) return null;
      return uniboxPinia.getReplyCategoriesList.find(
        (cat) => String(cat.id) === String(props.categoryId),
      ) || null;
    });

    // Effective display name
    const displayName = computed(() => (
      props.categoryName
      || categoryFromStore.value?.name
      || ''
    ));

    // Effective sentiment
    const effectiveSentiment = computed(() => (
      props.sentiment
      || categoryFromStore.value?.sentiment
      || ''
    ));

    // Sentiment dot color
    const dotColor = computed(() => {
      const sentimentVal = (effectiveSentiment.value || '').toLowerCase();

      if (sentimentVal === REPLY_SENTIMENT.Positive.value.toLowerCase()) {
        return getBrandColorByName('positive');
      }
      if (sentimentVal === REPLY_SENTIMENT.Neutral.value.toLowerCase()) {
        return getBrandColorByName('warning');
      }
      if (sentimentVal === REPLY_SENTIMENT.Negative.value.toLowerCase()) {
        return getBrandColorByName('negative');
      }

      return getBrandColorByName('positive');
    });

    // Tooltip content
    const tooltipContent = computed(() => {
      if (props.tooltip === false) return '';
      if (typeof props.tooltip === 'string') return props.tooltip;

      if (props.isAiCategorised) {
        if (props.confidence) {
          const percent = Math.round(props.confidence * 100);
          return `AI Categorised (${percent}% confidence)`;
        }
        return 'Categorised automatically by AI';
      }

      return '';
    });

    return {
      // computed
      dotColor,
      displayName,
      tooltipContent,
    };
  },
});
</script>

<style lang="scss" scoped>
.reply-category-pill {
  padding: 2px 8px;
  border-radius: 34px;
  background: $white;
  border: 1px solid $grey-50;
  gap: 6px;
  flex-shrink: 0;
  cursor: default;
  user-select: none;

  :deep(.ai-stars-icon) {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
    @include svg-icon-fill('path', rgba(var(--primary-rgb), 1));
  }

  .category-status-dot {
    width: 7px;
    height: 7px;
    min-width: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .category-text {
    font-size: 13px;
    color: $black;
    max-width: 140px;
    white-space: nowrap;
  }
}
</style>
