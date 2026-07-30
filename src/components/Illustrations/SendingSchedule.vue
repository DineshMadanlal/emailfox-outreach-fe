<template>
  <div class="sending-schedule-illustration">
    <!-- container -->
    <div class="sending-schedule-illustration-container">
      <!-- Illustration -->
      <div class="sending-schedule-illustration">
        <LocalSvgIcon
          image="seq-schedule"
          classes="illustration-icon"
        />
      </div>

      <!--  -->
      <h4 class="sending-schedule-header-text">
        No sending schedule set yet
      </h4>

      <!--  -->
      <p class="sending-schedule-description-text">
        Create a sending schedule to control when your campaigns send emails.
      </p>

      <!-- Add new domain -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Create Sending Schedule"

        @click="$emit('create')"
      ></q-btn>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SendingScheduleIllustration',

  emits: ['create'],
});
</script>

<style lang="scss" scoped>
.sending-schedule-illustration {
  padding: 40px 20px;

  display: flex;
  justify-content: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 16px;
  }

  .sending-schedule-illustration-container {
    width: 100%;
    max-width: 580px;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .sending-schedule-illustration {
      padding: 20px;
      min-height: 34px;
      min-width: 34px;
      border-radius: 50%;
      background: $grey-50;

      :deep(.illustration-icon) {
        height: 34px;
        width: 34px;
      }
    }

    .sending-schedule-header-text {
      margin-top: 24px;
      margin-bottom: 8px;

      color: $black;
      font-size: 18px;
      font-weight: 600;
    }

    .sending-schedule-description-text {
      margin-bottom: 20px;
      text-align: center;

      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }
  }
}
</style>
