<template>

  <div class="esp-provider-container">
    <LocalSvgIcon :image="providerData.image" classes="esp-icon" />
    <div class="esp-label-text">
      {{ providerData.label }}
    </div>
  </div>

</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// constants
import { ESP_PROVIDERS } from 'boot/mailbox-constants';

export default defineComponent({
  name: 'EspProvider',

  props: {
    provider: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    // computed
    const providerData = computed(() => {
      switch (props.provider) {
        case ESP_PROVIDERS.GMAIL:
          return {
            image: 'gmail',
            label: 'Gmail',
          };
        case ESP_PROVIDERS.OUTLOOK:
          return {
            image: 'outlook',
            label: 'Outlook',
          };
        case ESP_PROVIDERS.YAHOO:
          return {
            image: 'yahoo',
            label: 'Yahoo',
          };
        case ESP_PROVIDERS.ZOHO:
          return {
            image: 'zoho',
            label: 'Zoho',
          };
        default:
          return {
            image: 'other-smtp',
            label: 'Other SMTP',
          };
      }
    });

    return {
      // computed
      providerData,
    };
  },
});
</script>

<style lang="scss" scoped>
.esp-provider-container {
  display: flex;
  align-items: center;
  gap: 10px;

  .esp-label-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px; /* 114.286% */
  }
}
</style>
