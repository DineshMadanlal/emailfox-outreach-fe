<template>
  <div class="password-criteria-block">
    <div
      v-for="(rule, index) in passwordCriteria"
      :key="`password-${rule.label}-${index}`"
      class="each-password-criteria"
    >
      <LocalSvgIcon
        image="circle-dot"
        :class="{
          'grey-circle-icon': !rule.isSuccess,
        }"
      />

      <p
        :class="{
          'password-criteria-text': true,
          'success-text': rule.isSuccess,
        }"
      >
        {{ rule.label }}
      </p>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'PasswordCriteria',

  props: {
    password: {
      type: String,
      required: true,
    },
  },

  setup(props) {
    // computed
    const passwordCriteria = computed(() => {
      const rules = [
        {
          label: '8 characters minimum',
          isSuccess: props.password.length >= 8,
        },
        {
          label: '1 uppercase',
          isSuccess: /[A-Z]/.test(props.password),
        },
        {
          label: '1 lowercase',
          isSuccess: /[a-z]/.test(props.password),
        },
      ];

      return rules;
    });

    return {
      // computed
      passwordCriteria,
    };
  },
});
</script>

<style lang="scss" scoped>
.password-criteria-block {
  margin-top: 12px;

  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  .each-password-criteria {
    display: flex;
    align-items: center;

    :deep(.grey-circle-icon) {
      @include svg-icon-fill('circle, fill', rgba(var(--grey-rgb), 0.2));
    }

    .password-criteria-text {
      margin-left: 6px;

      color: rgba(var(--grey-rgb), 0.5);
      font-size: 14px;
      font-weight: 400;

      &.success-text {
        color: $positive;
      }
    }
  }
}
</style>
