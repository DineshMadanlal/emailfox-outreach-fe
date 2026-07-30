<template>
  <div class="suppression-list--illustration">
    <!-- container -->
    <div class="suppression-list--illustration-container">
      <!-- Illustration -->
      <div class="suppression-list--illustration">
        <LocalSvgIcon
          image="seq-schedule"
          classes="illustration-icon"
        />
      </div>

      <!--  -->
      <h4 class="suppression-list--header-text">
        No blocked contacts yet
      </h4>

      <!--  -->
      <p class="suppression-list--description-text">
        Blocked email addresses and domains will appear here. Use blocking
        to permanently stop sending emails.
      </p>

      <div class="flex items-center q-gutter-md">
        <!-- Add Entry -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="Add Entry"
          :style="{ minWidth: '120px' }"

          @click="$emit('addEntry')"
        ></q-btn>

        <!-- Import CSV -->
        <q-btn
          flat
          no-caps
          unelevated

          color="primary"
          label="Import CSV"
          class="light-primary-btn"

          @click="$emit('importCsv')"
        ></q-btn>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SuppressionListIllustration',

  emits: ['addEntry', 'importCsv'],
});
</script>

<style lang="scss" scoped>
.suppression-list--illustration {
  padding: 40px 20px;

  display: flex;
  justify-content: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 16px;
  }

  .suppression-list--illustration-container {
    width: 100%;
    max-width: 580px;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .suppression-list--illustration {
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

    .suppression-list--header-text {
      margin-top: 24px;
      margin-bottom: 8px;

      color: $black;
      font-size: 18px;
      font-weight: 600;
    }

    .suppression-list--description-text {
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
