<template>
  <div class="connected-mailboxes-grid">
    <!--  -->
    <div
      v-for="account in accounts"
      :key="`connected-account-${account.id}`"
      class="each-connected-account"
    >
      <!--  -->
      <div class="name-and-email-container">
        <div class="account-name-text">
          {{ account.connected_account_name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ConnectedLinkedInAccounts',

  props: {
    accounts: {
      type: Array,
      default: () => [],
    },
  },
});
</script>

<style lang="scss" scoped>
.connected-mailboxes-grid {
  width: 100%;

  .each-connected-account {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(var(--grey-50-rgb), 0.5);

    .name-and-email-container {
      display: flex;
      gap: 16px;

      .account-name-text {
        color: $black;
        font-size: 14px;
        font-weight: 500;
        line-height: 16px;
      }
    }

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }
  }
}
</style>
