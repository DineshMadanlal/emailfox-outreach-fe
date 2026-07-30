<template>
  <div
    class="sky-box-email-preview-header"
    :class="{ 'page-scrolled': isPageScrolled }"
  >
    <!-- contact replied -->
    <div
      v-if="!!sequenceId"
      class="contact-replied-seq-block"
    >
      <LocalSvgIcon
        image="seq-replied"
      />
      Contact Replied to Sequence 2
    </div>

    <!-- top -->
    <div class="header-top-section">

      <!-- Important button -->
      <q-btn
        flat
        dense

        @click="$emit('onClickImportant')"
        class="header-action-btn"

        :class="{
          'important': activeEmailJson.is_important,
        }"

        v-if="threadTypeJson.showImportant"
      >
        <LocalSvgIcon image="star" classes="preview-header-icon" />

        <AppTooltip
          :content="activeEmailJson.is_important ? 'Unmark as Important' : 'Mark as Important'"
        />
      </q-btn>

      <!-- Border Spacer -->
      <div
        class="border-spacer"

        v-if="threadTypeJson.showImportant"
      />

      <!-- Unread -->
      <q-btn
        flat
        dense

        @click="$emit('onClickUnread')"
        class="header-action-btn"
      >
        <LocalSvgIcon image="unread" classes="preview-header-icon" />

        <AppTooltip
          content="Mark as Unread"
        />
      </q-btn>

      <!-- Delete -->
      <q-btn
        flat
        dense

        @click="$emit('onClickDelete')"

        class="preview-delete-btn header-action-btn"
      >
        <LocalSvgIcon image="delete" classes="preview-header-icon" />

        <AppTooltip
          content="Delete"
        />
      </q-btn>

      <!-- Border Spacer -->
      <div class="border-spacer" />

      <!-- Copy -->
      <q-btn
        flat
        dense

        class="header-action-btn"

        @click="onCopyThreadLink"
      >
        <LocalSvgIcon image="copy" classes="preview-header-icon" />

        <AppTooltip
          content="Copy Link"
        />
      </q-btn>

      <q-space />

      <!-- Left arrow -->
      <q-btn
        flat
        dense

        :disable="!canMoveLeft"
        class="header-action-btn"

        @click="$emit('onClickLeftArrow')"
      >
        <LocalSvgIcon
          image="plain-down-arrow"
          classes="preview-header-icon left-arrow-icon"
        />

        <AppTooltip
          content="Previous Email"
        />
      </q-btn>

      <!-- Right arrow -->
      <q-btn
        flat
        dense

        :disable="!canMoveRight"
        class="right-arrow-btn header-action-btn"

        @click="$emit('onClickRightArrow')"
      >
        <LocalSvgIcon
          image="plain-down-arrow"
          classes="preview-header-icon right-arrow-icon"
        />

        <AppTooltip
          content="Next Email"
        />
      </q-btn>

      <!-- Border Spacer -->
      <div class="border-spacer" />

      <!-- Close -->
      <q-btn
        flat
        dense

        color="negative"
        class="app-negative-button"

        @click="$emit('onClickClose')"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />

        <AppTooltip
          content="Close"
        />
      </q-btn>
    </div>

    <!-- bottom -->
    <div class="header-bottom-section">
      <p class="email-subject-text">
        {{ activeEmailJson.subject }}
      </p>
    </div>

  </div>
</template>

<script>
// vue
import { defineComponent, getCurrentInstance, computed } from 'vue';

// vue router
import { useRoute } from 'vue-router';

// quasar
import { copyToClipboard } from 'quasar';

// Components
import AppTooltip from 'components/General/AppTooltip.vue';

// utils
import { convertStringToNumber } from 'src/utils/numbers';

export default defineComponent({
  name: 'SkyBoxEmailPreviewHeader',

  emits: ['onClickImportant', 'onClickClose', 'onClickUnread', 'onClickDelete', 'onClickLeftArrow', 'onClickRightArrow'],

  components: {
    AppTooltip,
  },

  props: {
    canMoveLeft: {
      type: Boolean,
      default: false,
    },
    canMoveRight: {
      type: Boolean,
      default: false,
    },
    activeEmailJson: {
      type: Object,
      required: true,
    },
    isPageScrolled: {
      type: Boolean,
      default: false,
    },

    threadTypeJson: {
      type: Object,
      default: () => {},
    },
  },

  setup(props) {
    // route
    const $route = useRoute();

    // app context
    const { appContext } = getCurrentInstance();

    // computed
    const sequenceId = computed(() => convertStringToNumber($route.params.campaignId));

    // methods
    const onCopyThreadLink = () => {
      const { origin, pathname } = window.location;
      // copy api key using clipboard
      copyToClipboard(`${origin}${pathname}?threadId=${props.activeEmailJson.thread_id}`).then(() => {
        // show toast
        appContext.config.globalProperties.$toast({
          message: 'Link copied successfully',
        });
      });
    };

    return {
      // computed
      sequenceId,

      /// methods
      onCopyThreadLink,
    };
  },
});
</script>

<style lang="scss" scoped>
.sky-box-email-preview-header {
  width: 100%;
  padding: 20px;

  position: sticky;
  top: 0;
  z-index: 1;
  background-color: transparent;
  backdrop-filter: blur(10px);

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 12px 16px;
  }

  &.page-scrolled {
    background-color: $white;
    border-bottom: 1px solid $grey-50;
  }

  .border-spacer {
    width: 1.2px;
    height: 16px;

    margin: 0px 16px;

    border-right: 1.2px solid $grey-100;
  }

  .contact-replied-seq-block {
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 4px;

    margin-bottom: 12px;
    padding: 4px 8px;

    color: $grey;
    font-size: 13px;
    font-weight: 500;
    line-height: 16px;

    border-radius: 34px;
    background: $white;
    border: 1px solid $grey-50;
  }

  .header-top-section {
    display: flex;
    align-items: center;

    .app-negative-button,
    .header-action-btn {
      min-height: unset;
      border-radius: 6px;

      height: 28px;
      width: 28px;
      border: 1px solid transparent;
    }

    .header-action-btn {
      &:hover {
        border: 1px solid rgba($color: var(--primary-rgb), $alpha: 0.1);
        background: rgba($color: var(--primary-rgb), $alpha: 0.1);

        :deep(.preview-header-icon) {
          path, rect {
            stroke: $black;
          }

          circle {
            fill: $black;
          }
        }
      }

      &.important {
        :deep(.preview-header-icon) {
          path {
            fill: $warning;
            stroke: $warning;
          }
        }
      }
    }

    .preview-delete-btn {
      margin-left: 16px;

      :deep(.preview-header-icon) {
        path {
          stroke: $grey;
        }
      }

      &:hover {
        border: 1px solid rgba($color: var(--negative-rgb), $alpha: 0.1);
        background: rgba($color: var(--negative-rgb), $alpha: 0.1);

        :deep(.preview-header-icon) {
          path {
            stroke: $negative;
          }
        }
      }
    }

    :deep(.left-arrow-icon) {
      transform: rotate(90deg);
      height: 16px;
      width: 16px;
    }

    .right-arrow-btn {
      margin-left: 16px;
    }

    :deep(.right-arrow-icon) {
      transform: rotate(-90deg);
      height: 16px;
      width: 16px;
    }

  }

  .header-bottom-section {
    margin-top: 16px;

    .email-subject-text {
      color: $black;
      font-size: 20px;
      font-weight: 600;
    }
  }
}
</style>
