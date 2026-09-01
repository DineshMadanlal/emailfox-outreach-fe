<template>
  <div class="unibox-conversation-toolbar">
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
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

export default defineComponent({
  name: 'UniboxConversationToolbar',

  components: {
    AppTooltip,
  },

  emits: [
    'toggle-star',
    'toggle-read',
    'delete',

    'view-activities',
    'prev-thread',
    'next-thread',
    'close',
  ],

  props: {
    isStarred: {
      type: Boolean,
      default: false,
    },
    isUnread: {
      type: Boolean,
      default: false,
    },
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
  },

  setup(props) {
    // computed
    const canStar = computed(() => !props.threadTypeConfig?.data?.hideStar);

    // return
    return {
      // computed
      canStar,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-conversation-toolbar {
  width: 100%;
  padding: 20px;

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
</style>
