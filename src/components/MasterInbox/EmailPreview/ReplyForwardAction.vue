<template>
  <div class="reply-footer-action">
    <!-- Reply -->
    <q-btn
      flat
      no-caps
      unelevated
      color="primary"
      class="reply-action"

      @click="$emit('onReply')"
    >
      <!--  -->
      <div class="flex no-wrap items-center">
        <LocalSvgIcon
          image="email-reply"
          classes="action-icon"
        />

        <p class="action-text">
          Reply
        </p>
      </div>
    </q-btn>

    <!-- border spacer -->
    <div class="border-spacer"></div>

    <!-- Forward -->
    <q-btn
      flat
      no-caps
      unelevated
      color="primary"
      class="forward-action"

      @click="$emit('onForward')"
    >
      <!--  -->
      <div class="flex no-wrap items-center">
        <LocalSvgIcon
          image="email-reply"
          classes="action-icon forward-icon"
        />

        <p class="action-text">
          Forward
        </p>
      </div>
    </q-btn>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ReplyForwardAction',

  emits: ['onReply', 'onForward'],
});
</script>

<style lang="scss" scoped>
.reply-footer-action {
  width: 100%;

  display: flex;
  align-items: center;

  padding: 8px 0px;

  border-top: 1px solid $grey-50;

  .border-spacer {
    height: 16px;
    width: 1px;
    border-left: 1px solid $grey-100;

    margin: 0px 2px;
  }

  .action-text {
    color: $primary;
    font-size: 14px;
    font-weight: 500;
    line-height: 16px; /* 114.286% */

    margin-left: 8px;
  }

  :deep(.action-icon) {
    path {
      stroke: $primary;
    }
  }

  :deep(.forward-icon) {
    transform: rotateY(180deg);
  }
}
</style>
