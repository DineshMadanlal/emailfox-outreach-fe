<template>
  <div class="all-mailboxes-illustration">
    <!-- container -->
    <div class="mailbox-illustration-container">
      <!-- Illustration -->
      <LocalSvgIcon
        image="mailboxes"

        :isIconFolder="false"
        :isIllustrationFolder="true"

        classes="mailboxes-img"
      />

      <!-- header -->
      <h4 class="mailbox-header-text">
        <!-- Create/Add Your Domains -->
        Set up your first mailbox to start sending emails
      </h4>

      <!-- description -->
      <p class="mailbox-description-text">
        <!-- Add your domain, mailbox slot or simply create mailboxes by adding domains. -->
        Connect or purchase a mailbox to send emails,
        track replies, and protect your deliverability.
      </p>

      <!-- Actions -->
      <div class="mailbox-actions">
        <!-- Connect Mailbox button -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="Connect Mailbox"

          to="/outreach/mailboxes/new"
        />
      </div>

      <!--  -->
      <TipCard
        tipText="Tips: We recommend warming up new mailboxes before sending sequences."
      />
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// components
import TipCard from 'components/General/TipCard.vue';

export default defineComponent({
  name: 'AllMailboxes',

  components: {
    TipCard,
  },
});
</script>

<style lang="scss" scoped>
.all-mailboxes-illustration {
  padding: 40px 20px;

  display: flex;
  justify-content: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 16px;
  }

  .mailbox-illustration-container {
    width: 100%;
    max-width: 580px;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    :deep(.mailboxes-img) {
      height: 76px;
      width: 76px;

      @include svg-icon-fill('circle', $grey-50);
      @include svg-icon-stroke('path, rect', $grey);
    }

    .mailbox-header-text {
      margin-top: 24px;
      margin-bottom: 8px;

      color: $black;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
    }

    .mailbox-description-text {
      margin-bottom: 20px;
      text-align: center;

      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }

    .mailbox-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      margin-bottom: 40px;
    }
  }
}
</style>
