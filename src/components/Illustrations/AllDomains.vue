<template>
  <div class="all-domains-illustration">
    <!-- container -->
    <div class="domain-illustration-container">
      <!-- Illustration -->
      <LocalSvgIcon
        image="mailboxes"

        :isIconFolder="false"
        :isIllustrationFolder="true"

        classes="domains-img"
      />

      <!-- header -->
      <h4 class="domain-header-text">
        <!-- Create/Add Your Domains -->
        Connect a mailbox to get started
      </h4>

      <!-- description -->
      <p class="domain-description-text">
        <!-- Add your domain, mailbox slot or simply create mailboxes by adding domains. -->
        Every connected mailbox is grouped under its domain automatically.
        Add a mailbox to see your domains, track mailbox activity, and manage your sending accounts.
      </p>

      <!-- Actions -->
      <div class="domain-actions">
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
        tipText="Tip: We recommend setting up SPF, DKIM, and DMARC
        before launching campaigns to help improve deliverability."
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
  name: 'AllDomains',

  components: {
    TipCard,
  },
});
</script>

<style lang="scss" scoped>
.all-domains-illustration {
  padding: 40px 20px;

  display: flex;
  justify-content: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 16px;
  }

  .domain-illustration-container {
    width: 100%;
    max-width: 580px;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    :deep(.domains-img) {
      height: 76px;
      width: 76px;

      @include svg-icon-fill('circle', $grey-50);
      @include svg-icon-stroke('path, rect', $grey);
    }

    .domain-header-text {
      margin-top: 24px;
      margin-bottom: 8px;

      color: $black;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
    }

    .domain-description-text {
      margin-bottom: 20px;
      text-align: center;

      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }

    .domain-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      margin-bottom: 40px;
    }
  }
}
</style>
