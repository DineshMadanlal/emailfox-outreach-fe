<template>
  <div class="activity-logs-illustration">
    <!-- container -->
    <div class="activity-logs-illustration-container">
      <!-- Illustration -->
      <LocalSvgIcon
        image="activity-logs"

        :isIconFolder="false"
        :isIllustrationFolder="true"
      />

      <!--  -->
      <h4 class="activity-header-text">
        You don’t have activities yet
      </h4>

      <!--  -->
      <p class="activity-description-text">
        All your activities related to domain purchase and setup process status will be listed here.
      </p>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ActivityLogsIllustration',
});
</script>

<style lang="scss" scoped>
.activity-logs-illustration {
  width: 100%;
  padding: 40px 20px;

  display: flex;
  justify-content: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 12px;
  }

  .activity-logs-illustration-container {
    width: 100%;
    max-width: 592px;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .activity-header-text {
      margin-top: 24px;
      margin-bottom: 8px;

      color: $black;
      font-size: 18px;
      font-weight: 600;
    }

    .activity-description-text {
      color: rgba($color: var(--black-rgb), $alpha: 0.8);

      text-align: center;
      font-size: 14px;

      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }
  }
}
</style>
