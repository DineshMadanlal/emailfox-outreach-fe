<template>
  <div class="mailbox-esp">
    <LocalSvgIcon :image="espLogo" classes="esp-icon" />

    <div class="esp-text">
      {{ esp }}
    </div>
  </div>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'MailboxEsp',

  props: {
    esp: {
      type: String,
      default: 'gmail',
    },
  },

  setup(props) {
    //
    const espLogo = computed(() => {
      switch (props.esp.toLowerCase()) {
        case 'gmail':
          return 'gmail';
        case 'yahoo':
          return 'yahoo';
        case 'outlook':
          return 'outlook';
        case 'zoho':
          return 'zoho';
        default:
          return 'other-smtp';
      }
    });

    return {
      // computed
      espLogo,
    };
  },
});
</script>

<style lang="scss" scoped>
.mailbox-esp {
  display: flex;
  align-items: center;

  .esp-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px;
    text-transform: capitalize;

    margin-left: 8px;
  }
}
</style>
