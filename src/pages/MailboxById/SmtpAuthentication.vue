<template>
  <div class="smtp-authentication-page">
    <AddSmtpMailbox
      :mailboxByJson="mailboxByJson"
      @updateMailbox="onUpdateMailbox"
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue';

// components
import AddSmtpMailbox from 'components/Mailboxes/AddSmtpMailbox.vue';

export default defineComponent({
  name: 'SmtpAuthentication',

  components: {
    AddSmtpMailbox,
  },

  props: {
    mailboxByJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  emits: ['updateMailbox'],

  setup(props, { emit }) {
    const onUpdateMailbox = (updatedMailbox) => {
      emit('updateMailbox', updatedMailbox);
    };

    return {
      onUpdateMailbox,
    };
  },
});
</script>

<style lang="scss" scoped>
.smtp-authentication-page {
  width: 100%;
  display: flex;
  flex: 1;
  overflow-y: auto;
}
</style>
