<template>
  <div class="unibox-conversation-toolbar">
    <!-- Toolbar for conversation actions -->
    <div class="unibox-toolbar-top">
      <!-- Left Action Group -->
      <div class="toolbar-left-actions">
        <!-- Star / Important Button -->
        <q-btn
          flat
          round
          dense

          size="sm"
          class="toolbar-action-btn"
          :class="{ 'is-starred': isStarred }"

          @click="$emit('toggle-star')"

          v-if="canStar"
        >
          <LocalSvgIcon
            image="star"
            class="toolbar-icon"
          />

          <AppTooltip
            :content="isStarred ? 'Unstar' : 'Star as important'"
          />
        </q-btn>

        <span
          class="toolbar-divider"
          v-if="canStar"
        />

        <!-- Mark as Unread Button -->
        <q-btn
          flat
          round
          dense

          size="sm"
          class="toolbar-action-btn"

          @click="$emit('toggle-read')"
        >
          <LocalSvgIcon
            :image="isUnread ? 'mail' : 'unread'"
            class="toolbar-icon"
          />
          <AppTooltip
            :content="isUnread ? 'Mark as read' : 'Mark as unread'"
          />
        </q-btn>

        <!-- Delete / Move to Trash Button -->
        <q-btn
          flat
          round
          dense

          size="sm"
          class="toolbar-action-btn"

          @click="$emit('delete')"

          v-if="false"
        >
          <LocalSvgIcon
            image="delete"
            class="toolbar-icon"
          />
          <AppTooltip content="Delete conversation" />
        </q-btn>
      </div>

      <!-- Right Action Group -->
      <div class="toolbar-right-actions">
        <!-- View Activities Button -->
        <q-btn
          flat
          dense
          no-caps

          class="activities-btn"
          @click="$emit('view-activities')"
        >
          <div class="flex no-wrap items-center">
            <LocalSvgIcon
              image="info-circle"
              class="toolbar-icon q-mr-xs"
            />

            <div class="activities-btn-text">View Activities</div>

            <AppTooltip content="View lead activity history" />
          </div>
        </q-btn>

        <span class="toolbar-divider" />

        <!-- Navigation: Previous Thread -->
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="chevron_left"
          class="toolbar-action-btn"
          :disable="!hasPrev"
          @click="$emit('prev-thread')"
        >
          <AppTooltip content="Previous conversation" />
        </q-btn>

        <!-- Navigation: Next Thread -->
        <q-btn
          flat
          round
          dense
          size="sm"
          icon="chevron_right"
          class="toolbar-action-btn"
          :disable="!hasNext"
          @click="$emit('next-thread')"
        >
          <AppTooltip content="Next conversation" />
        </q-btn>

        <span class="toolbar-divider" />

        <!-- Close Conversation Preview -->
        <q-btn
          flat
          round
          dense
          size="sm"
          class="toolbar-action-btn close-btn"
          @click="$emit('close')"
        >
          <LocalSvgIcon
            image="close"
            class="toolbar-icon"
          />
          <AppTooltip content="Close preview" />
        </q-btn>
      </div>
    </div>

    <!--  -->
    <div
      v-if="isUntrackedReply"
      class="unibox-toolbar-end"
    >
      <!--  -->
      <div class="contact-header-text ellipsis">
        {{ fetchedData?.subject }}
      </div>
    </div>

    <!-- Rest -->
    <div
      v-else-if="fetchedData"
      class="unibox-toolbar-end"
    >
      <!-- Name -->
      <div class="contact-header-text ellipsis">
        {{ contactDisplayName }}
      </div>

      <!--  -->
      <div class="campaign-reply-grid">
        <!-- Campaign Pill Badge -->
        <div>
          <CampaignPill
            :seqId="threadJson?.seq_id"
          />
        </div>

        <!-- Reply Category -->
        <div>
          <SelectReplyCategory
            :options="replyCategoriesList"
            :modelValue="threadJson.reply_category_id"

            placeholderText="Select Reply Category"
            class="medium-height reply-category-dd"

            @update:modelValue="handleReplyCategoryUpdate"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// components
import AppTooltip from 'components/General/AppTooltip.vue';
import CampaignPill from 'components/Unibox/Components/CampaignPill.vue';
import SelectReplyCategory from 'src/components/Dropdown/Unibox/SelectReplyCategory.vue';

// pinia
import { useUniboxStore } from 'src/stores/unibox';

export default defineComponent({
  name: 'UniboxConversationToolbar',

  emits: [
    'toggle-star',
    'toggle-read',
    'delete',
    'update:replyCategory',

    'view-activities',
    'prev-thread',
    'next-thread',
    'close',
  ],

  components: {
    AppTooltip,
    CampaignPill,
    SelectReplyCategory,
  },

  props: {
    hasPrev: {
      type: Boolean,
      default: false,
    },
    hasNext: {
      type: Boolean,
      default: false,
    },
    threadTypeConfig: {
      type: Object,
      default: () => ({}),
    },
    threadJson: {
      type: Object,
      default: () => ({}),
    },
    fetchedData: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // store
    const uniboxPinia = useUniboxStore();

    // computed
    const isUnread = computed(() => !props.threadJson?.is_read);
    const isStarred = computed(() => !!props.threadJson?.is_important);

    const canStar = computed(() => !props.threadTypeConfig?.data?.hideStarInHeader);
    const isUntrackedReply = computed(() => props.threadTypeConfig?.data?.isUntracked);

    const replyCategoriesList = computed(() => uniboxPinia.getReplyCategoriesList);

    const contactDisplayName = computed(() => {
      const data = props.fetchedData;
      if (!data) return '';

      const firstName = data.first_name ? data.first_name.trim() : '';
      const lastName = data.last_name ? data.last_name.trim() : '';
      const fullName = `${firstName} ${lastName}`.trim();

      if (fullName) {
        return fullName;
      }

      return data.contact_email || '';
    });

    // methods
    const handleReplyCategoryUpdate = (newValue) => {
      // Emit the update event to the parent component
      emit('update:replyCategory', newValue);
    };

    // return
    return {
      // computed
      canStar,
      isUnread,
      isStarred,
      isUntrackedReply,
      contactDisplayName,
      replyCategoriesList,

      // methods
      handleReplyCategoryUpdate,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-conversation-toolbar {
  width: 100%;
  padding: 20px;

  position: sticky;
  top: 0;
  z-index: 3;

  &.page-scrolled {
    background-color: #f9fafc;
    // border-bottom: 1px solid $grey-50;
  }

  // top
  .unibox-toolbar-top {
    width: 100%;
    margin-bottom: 8px;

    display: flex;
    align-items: center;
    justify-content: space-between;

    flex-wrap: wrap;

    .toolbar-left-actions,
    .toolbar-right-actions {
      gap: 4px;
      display: flex;
      align-items: center;
    }

    .toolbar-action-btn {
      width: 28px;
      height: 28px;
      color: grey;

      :deep(.toolbar-icon) {
        width: 16px;
        height: 16px;
        @include svg-icon-stroke('path, circle, rect', $grey);
      }

      &:hover {
        background-color: rgba($color: var(--grey-50-rgb), $alpha: 0.5);
      }

      &.is-starred {
        :deep(.toolbar-icon) {
          @include svg-icon-fill('path', $warning);
          @include svg-icon-stroke('path', $warning);
        }
      }

      &.close-btn {
        &:hover {
          background-color: rgba($color: var(--negative-rgb), $alpha: 0.1);

          :deep(.toolbar-icon) {
            @include svg-icon-stroke('path, circle, rect', $negative);
          }
        }
      }
    }

    .activities-btn {
      padding: 4px 8px;
      border-radius: 6px;
      color: $grey;

      .activities-btn-text {
        font-size: 13px;
        font-weight: 500;
        color: $grey;
      }

      :deep(.toolbar-icon) {
        width: 14px;
        height: 14px;
      }

      &:hover {
        background-color: rgba($color: var(--grey-50-rgb), $alpha: 0.5);
      }
    }

    .toolbar-divider {
      width: 1px;
      height: 16px;
      background-color: $grey-100;
      margin: 0 4px;
    }
  }

  // end
  .unibox-toolbar-end {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .contact-header-text {
      font-size: 18px;
      font-weight: 600;
      color: $black;
    }

    .campaign-reply-grid {
      display: flex;
      align-items: center;
      justify-content: space-between;

      flex-wrap: wrap;
      gap: 12px;

      :deep(.reply-category-dd) {
        min-width: 200px;

        &.show-placeholder {
          .q-field__native {
            &::before {
              color: $primary;
            }
          }
        }

        .q-field__control {
          &::before {
            background: rgba($color: var(--primary-rgb), $alpha: 0.1);
            border-color: rgba($color: var(--primary-rgb), $alpha: 0.3);
          }

          i {
            color: $primary;
          }
        }

        .q-field__append {
          [aria-label="Clear"] {
            font-size: 18px;
            color: $negative;
          }
        }
      }
    }
  }
}
</style>
