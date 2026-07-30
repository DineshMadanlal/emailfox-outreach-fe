<template>
  <q-card
    flat
    class="integration-illustration-card"
  >
    <!-- header -->
    <p class="get-started-text">
      Get started with {{ integrationName }}
    </p>

    <!-- description -->
    <p class="illustration-desc-text">
      Single click to move the email accounts to {{ integrationName }}
    </p>

    <!-- Add API -->
    <q-btn
      no-caps
      unelevated

      color="primary"

      @click="$emit('onAddApiKey')"
    >
      <p class="add-api-text">
        + Add API
      </p>
    </q-btn>
  </q-card>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'IntegrationsIllustration',

  emits: ['onAddApiKey'],

  props: {
    integrationName: {
      type: String,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.integration-illustration-card {
  padding: 20px;
  border-radius: 8px;
  border: 1px solid $blue-grey;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 16px;
  }

  .get-started-text {
    color: $black;
    font-size: 14px;
    font-weight: 500;
  }

  .illustration-desc-text {
    margin-top: 4px;
    margin-bottom: 12px;

    color: $black;
    font-size: 12px;
    font-weight: 400;
    line-height: 18px; /* 150% */
  }

  .add-api-text {
    font-weight: 500;
  }
}
</style>
