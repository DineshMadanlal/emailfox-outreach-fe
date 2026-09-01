<template>
  <div class="unibox-contact-header">
    <!-- Contact Name -->
    <h4 class="contact-display-name ellipsis">
      {{ contactName || contactEmail || 'Unknown Contact' }}
    </h4>

    <!-- Metadata & Category Action Row -->
    <div class="contact-meta-row flex items-center justify-between">
      <!-- Left: Campaign / Sequence Badge -->
      <div
        v-if="campaignName"
        class="campaign-badge-pill flex items-center no-wrap"
      >
        <LocalSvgIcon
          image="sequence"
          class="campaign-icon"
        />
        <span class="campaign-name-text ellipsis">{{ campaignName }}</span>
      </div>
      <div v-else />

      <!-- Right: Select Reply Category Dropdown Trigger -->
      <div class="reply-category-action-wrapper">
        <q-btn
          flat
          no-caps
          unelevated
          class="reply-category-btn flex items-center"
          :class="{ 'has-category': !!currentReplyCategoryName }"
        >
          <!-- Category Status Dot or Lightning Icon -->
          <span
            v-if="currentReplyCategoryName"
            class="category-status-dot q-mr-xs"
            :style="{ backgroundColor: currentReplyCategoryDotColor }"
          />
          <LocalSvgIcon
            v-else
            image="lightning"
            class="lightning-icon q-mr-xs"
          />

          <span class="reply-category-label ellipsis">
            {{ currentReplyCategoryName || 'Select Reply Category' }}
          </span>

          <q-icon
            name="keyboard_arrow_down"
            size="18px"
            class="arrow-icon q-ml-xs"
          />

          <!-- Category Selection Menu -->
          <q-menu
            transition-show="jump-down"
            transition-hide="jump-up"
          >
            <q-list
              dense
              class="reply-categories-menu-list"
            >
              <q-item
                clickable
                v-close-popup
                v-for="category in replyCategories"
                :key="`unibox-reply-cat-${category.id}`"
                :active="category.id === selectedCategoryId"
                @click="$emit('select-category', category)"
              >
                <q-item-section avatar>
                  <span
                    class="menu-category-dot"
                    :style="{ backgroundColor: getCategoryDotColor(category) }"
                  />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="ellipsis">
                    {{ category.name || category.title }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// Brand Colors
import { getBrandColorByName } from 'src/utils/quasarHelpers';

// constants
import { REPLY_SENTIMENT } from 'boot/campaign-constants';

export default defineComponent({
  name: 'UniboxContactHeader',

  emits: ['select-category'],

  props: {
    contactName: {
      type: String,
      default: '',
    },
    contactEmail: {
      type: String,
      default: '',
    },
    campaignName: {
      type: String,
      default: '',
    },
    selectedCategoryId: {
      type: [Number, String],
      default: null,
    },
    replyCategories: {
      type: Array,
      default: () => [],
    },
  },

  setup(props) {
    const selectedCategory = computed(() => {
      if (!props.selectedCategoryId || !props.replyCategories?.length) return null;
      return props.replyCategories.find((c) => c.id === props.selectedCategoryId) || null;
    });

    const currentReplyCategoryName = computed(() => (
      selectedCategory.value?.name || selectedCategory.value?.title || ''
    ));

    const getCategoryDotColor = (category) => {
      if (category?.sentiment === REPLY_SENTIMENT.Positive.value) {
        return getBrandColorByName('positive');
      }
      if (category?.sentiment === REPLY_SENTIMENT.Neutral.value) {
        return getBrandColorByName('warning');
      }
      if (category?.sentiment === REPLY_SENTIMENT.Negative.value) {
        return getBrandColorByName('negative');
      }
      return getBrandColorByName('primary');
    };

    const currentReplyCategoryDotColor = computed(() => (
      selectedCategory.value ? getCategoryDotColor(selectedCategory.value) : ''
    ));

    return {
      currentReplyCategoryName,
      currentReplyCategoryDotColor,
      getCategoryDotColor,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-contact-header {
  width: 100%;
  padding: 20px 24px 16px 24px;
  background-color: $white;

  .contact-display-name {
    font-size: 20px;
    font-weight: 600;
    color: $black;
    line-height: 26px;
    margin-bottom: 12px;
  }

  .contact-meta-row {
    gap: 12px;
  }

  .campaign-badge-pill {
    padding: 4px 12px;
    border-radius: 34px;
    background-color: $white;
    border: 1px solid $grey-100;
    gap: 6px;

    :deep(.campaign-icon) {
      width: 14px;
      height: 14px;
      @include svg-icon-stroke('path, circle, rect', grey);
    }

    .campaign-name-text {
      font-size: 13px;
      font-weight: 500;
      color: $grey-800;
      max-width: 220px;
    }
  }

  .reply-category-btn {
    padding: 6px 12px;
    border-radius: 8px;
    background: rgba($color: var(--primary-rgb), $alpha: 0.08);
    border: 1px solid rgba($color: var(--primary-rgb), $alpha: 0.2);
    color: $primary;

    :deep(.lightning-icon) {
      width: 14px;
      height: 14px;
      @include svg-icon-fill('path', $primary);
      @include svg-icon-stroke('path, circle, rect', $primary);
    }

    .category-status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .reply-category-label {
      font-size: 13px;
      font-weight: 500;
      color: $primary;
      max-width: 180px;
    }

    .arrow-icon {
      color: $primary;
    }

    &:hover {
      background: rgba($color: var(--primary-rgb), $alpha: 0.15);
    }
  }

  .reply-categories-menu-list {
    min-width: 200px;
    padding: 6px 0;

    .menu-category-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      display: inline-block;
    }
  }
}
</style>
