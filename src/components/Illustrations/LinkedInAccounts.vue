<template>
  <div class="linkedin-accounts-illustration">
    <!-- container -->
    <div class="linkedin-illustration-container">
      <!-- Illustration -->
      <div class="linkedin-img">
        <LocalSvgIcon
          image="linkedin-1"
          classes="linkedin-icon"
        />
      </div>

      <!-- header -->
      <h4 class="linkedin-header-text">
        <!-- Create/Add Your Domains -->
        Connect your first LinkedIn account
      </h4>

      <!-- description -->
      <p class="linkedin-description-text">
        Add a LinkedIn account to automate visit profiles,
        send connection requests, send messages to your prospects,
        and other LinkedIn outreach activities.
      </p>

      <!-- Actions -->
      <div class="linkedin-actions">
        <!-- Connect LinkedIn button -->
        <q-btn
          no-caps
          unelevated

          :loading="loading"

          color="primary"
          label="Connect LinkedIn"

          @click="$emit('connectAccount')"
        />
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LinkedInAccountsIllustration',

  emits: ['connectAccount'],

  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
});
</script>

<style lang="scss" scoped>
.linkedin-accounts-illustration {
  padding: 40px 20px;

  display: flex;
  justify-content: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 16px;
  }

  .linkedin-illustration-container {
    width: 100%;
    max-width: 580px;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    :deep(.linkedin-img) {
      height: 76px;
      width: 76px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: $grey-50;

      .linkedin-icon {
        width: 36px;
        height: 100%;
      }
    }

    .linkedin-header-text {
      margin-top: 24px;
      margin-bottom: 8px;

      color: $black;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
    }

    .linkedin-description-text {
      margin-bottom: 20px;
      text-align: center;

      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }

    .linkedin-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      margin-bottom: 40px;
    }
  }
}
</style>
