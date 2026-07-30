<template>
  <q-menu
    auto-close
    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"
  >
    <!-- List -->
    <q-list style="min-width: 202px" class="reply-action-list">
      <!-- Reply -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-email-action-item"
        @click="$emit('onReply')"
      >
        <LocalSvgIcon
          image="email-reply"
          classes="email-reply-menu-icon"
        />

        <p class="email-reply-action-text">
          Reply
        </p>
      </q-item>

      <!-- Forward -->
        <q-item
          v-ripple
          clickable
          class="flex items-center each-email-action-item"
          @click="$emit('onForward')"
        >
          <LocalSvgIcon
            image="email-reply"
            classes="email-reply-menu-icon forward-icon"
          />

          <p class="email-reply-action-text">
            Forward
          </p>
        </q-item>

      <!-- Show Original -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-email-action-item"
        @click="$emit('showOriginal')"
      >
        <LocalSvgIcon
          image="code"
          classes="email-reply-menu-icon"
        />
        <p class="email-reply-action-text">
          Show Original
        </p>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'EmailReplyMoreOptions',

  emits: ['onReply', 'onForward', 'showOriginal'],
});
</script>

<style lang="scss" scoped>
.reply-action-list {
  .each-email-action-item {
    padding: 10px 12px;
    min-height: unset;

    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
    }

    .email-reply-action-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-left: 8px;
    }

    :deep(.forward-icon) {
      transform: rotateY(180deg);
    }

    :deep(.email-reply-menu-icon) {
      @include svg-icon-stroke('path, circle, rect', $grey);
    }

    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
    }
  }
}
</style>
