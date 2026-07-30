<template>
  <div class="custom-scriptsillustration">
    <!-- container -->
    <div class="custom-script-illustration-container">
      <!-- Illustration -->
      <LocalSvgIcon
        image="scripts"

        :isIconFolder="false"
        :isIllustrationFolder="true"
      />

      <!--  -->
      <h4 class="custom-script-header-text">
        No Custom Scripts Added
      </h4>

      <!--  -->
      <p class="custom-script-description-text">
        You haven’t added any tracking or third-party scripts yet.
      </p>

      <!-- Add new domain -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Add Script"

        @click="$emit('onAddNewScript')"
      ></q-btn>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CustomScriptsIllustration',

  emits: ['onAddNewScript'],
});
</script>

<style lang="scss" scoped>
.custom-scriptsillustration {
  padding: 40px 20px;

  display: flex;
  justify-content: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 12px;
  }

  .custom-script-illustration-container {
    width: 100%;
    max-width: 580px;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .custom-script-header-text {
      margin-top: 24px;
      margin-bottom: 8px;

      color: $black;
      font-size: 18px;
      font-weight: 600;
    }

    .custom-script-description-text {
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
