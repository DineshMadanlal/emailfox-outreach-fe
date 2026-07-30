<template>
  <div class="master-inbox-illustration">
    <!-- container -->
    <div class="master-inbox-illustration-container">
      <!-- Illustration -->
      <LocalSvgIcon
        image="master-inbox"

        :isIconFolder="false"
        :isIllustrationFolder="true"
      />

      <!--  -->
      <h4 class="master-inbox-header-text">
        {{ emptyStateJson.title }}
      </h4>

      <!--  -->
      <p class="master-inbox-description-text">
        {{ emptyStateJson.body }}
      </p>

      <!-- Show CTA when available -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        :label="emptyStateJson.cta"
        :to="emptyStateJson.ctaRoute"

        v-if="emptyStateJson.cta"
      ></q-btn>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SkyBoxIllustration',

  props: {
    emptyStateJson: {
      type: Object,
      default: () => ({}),
    },
  },
});
</script>

<style lang="scss" scoped>
.master-inbox-illustration {
  padding: 130px 20px;

  display: flex;
  justify-content: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 16px;
  }

  .master-inbox-illustration-container {
    width: 100%;
    max-width: 580px;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .master-inbox-header-text {
      margin-top: 24px;
      margin-bottom: 8px;

      color: $black;
      font-size: 18px;
      font-weight: 600;
    }

    .master-inbox-description-text {
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
