<template>
  <div
    @click="$emit('click')"
    class="cursor-pointer"
  >
    <!-- Icon -->
    <LocalSvgIcon
      :image="isPasswordInput ? 'show' : 'hide'"
    />

    <!-- Tooltip -->
    <AppTooltip
      :offset="[10, 10]"
      :content="`${isPasswordInput ? 'Show' : 'Hide'}  Password`"
    />
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// Component
import AppTooltip from 'components/General/AppTooltip.vue';

export default defineComponent({
  name: 'PasswordIconToggle',

  emits: ['click'],

  components: {
    AppTooltip,
  },

  props: {
    isPasswordInput: {
      type: Boolean,
      default: false,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>

</style>
