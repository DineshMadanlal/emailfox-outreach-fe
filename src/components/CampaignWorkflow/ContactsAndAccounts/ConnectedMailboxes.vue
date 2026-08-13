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
        <div>
          <!-- name -->
          <div class="account-name-text">
            {{ account.mailbox_name }}
          </div>

          <!-- email -->
          <div class="account-email-text">
            {{ account.mailbox_email }}
          </div>
        </div>
      </div>

      <!-- mailbox ESP -->
      <div class="mailbox-esp">
        <EspProvider
          :provider="account.provider"
        />
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// Components
import EspProvider from 'components/Mailboxes/EspProvider.vue';

export default defineComponent({
  name: 'ConnectedMailboxes',

  components: {
    EspProvider,
  },

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

    display: flex;
    gap: 16px;
    align-items: center;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      flex-wrap: wrap;
    }

    //
    .name-and-email-container {
      display: flex;
      gap: 16px;
      width: 100%;

      .account-name-text {
        color: $black;
        font-size: 14px;
        font-weight: 500;
        line-height: 16px;
      }

      .account-email-text {
        color: $grey;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;

        margin-top: 4px;
      }
    }

    //
    .mailbox-esp {
      width: 100%;
    }

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 12px;
    }
  }
}
</style>
