<template>
  <div class="webhook-accounts-illustration">
    <!-- container -->
    <div class="webhook-illustration-container">
      <!-- Illustration -->
      <div class="webhook-img">
        <LocalSvgIcon
          image="webhooks"
          classes="webhook-icon"
        />
      </div>

      <!-- header -->
      <h4 class="webhook-header-text">
        <!-- Create/Add Your Domains -->
        Connect your apps with webhooks
      </h4>

      <!-- description -->
      <p class="webhook-description-text">
        Add a webhook to automate your workflow and integrate with other apps.
        You can use webhooks to send real-time data from one app to another
        whenever a given event occurs.
      </p>

      <!-- Actions -->
      <div class="webhook-actions">
        <!-- Connect LinkedIn button -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="Add Webhook"

          @click="$emit('onAddNewWebhook')"
        />
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AllWebhooksIllustration',

  emits: ['onAddNewWebhook'],
});
</script>

<style lang="scss" scoped>
.webhook-accounts-illustration {
  padding: 40px 20px;

  display: flex;
  justify-content: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 16px;
  }

  .webhook-illustration-container {
    width: 100%;
    max-width: 600px;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    :deep(.webhook-img) {
      height: 76px;
      width: 76px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: $grey-50;

      .webhook-icon {
        width: 36px;
        height: 100%;
      }
    }

    .webhook-header-text {
      margin-top: 24px;
      margin-bottom: 8px;

      color: $black;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
    }

    .webhook-description-text {
      margin-bottom: 20px;
      text-align: center;

      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }

    .webhook-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      margin-bottom: 40px;
    }
  }
}
</style>
