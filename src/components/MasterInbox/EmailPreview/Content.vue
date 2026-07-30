<template>
  <div class="master-inbox-email-preview-content">
    <SkyBoxReplyThread
      v-for="(message, index) in threadMessages"
      :key="`master-inbox-reply-thread-${index}`"

      :eachThreadJson="message"
      :showReplyForwardAction="showReplyForwardAction"
      :defaultOpened="index === threadMessages.length - 1"

      @refetchThreadById="$emit('refetchThreadById')"
    />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// Components
import SkyBoxReplyThread from 'components/MasterInbox/EmailPreview/ReplyThread.vue';

export default defineComponent({
  name: 'SkyBoxEmailPreviewContent',

  emits: ['refetchThreadById'],

  components: {
    SkyBoxReplyThread,
  },

  props: {
    threadMessages: {
      type: Array,
      required: true,
      default: () => [],
    },
    showReplyForwardAction: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.master-inbox-email-preview-content {
  width: 100%;
  padding: 0px 20px 20px 20px;

  display: grid;
  grid-row-gap: 12px;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 0px 8px 12px 8px;
  }
}
</style>
