<template>
  <div
    class="unibox-empty-state-wrapper"
  >
    <div class="unibox-empty-state">
      <!-- Illustration -->
      <LocalSvgIcon
        image="master-inbox"
        :isIconFolder="false"
        :isIllustrationFolder="true"
        class="empty-state-illustration"
      />

      <h4 class="empty-state-title">
        {{ threadTypeConfig.emptyState.title }}
      </h4>

      <p class="empty-state-body">
        {{ threadTypeConfig.emptyState.body }}
      </p>

      <q-btn
        no-caps
        unelevated
        color="primary"
        class="empty-state-cta-btn"
        :label="threadTypeConfig.emptyState.cta"
        :to="threadTypeConfig.emptyState.ctaRoute"
        v-if="threadTypeConfig.emptyState.cta"
      />
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'UniboxEmptyState',

  props: {
    threadTypeConfig: {
      type: Object,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.unibox-empty-state-wrapper {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;

  .unibox-empty-state {
    padding: 80px 20px;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    text-align: center;

    @media (max-width: $breakpoint-xs-max) {
      padding: 40px 16px;
    }

    :deep(.empty-state-illustration) {
      width: 76px;
      height: auto;
    }

    .empty-state-title {
      margin-top: 20px;
      margin-bottom: 8px;
      color: $black;
      font-size: 18px;
      font-weight: 600;
    }

    .empty-state-body {
      color: $grey;
      font-size: 14px;
      line-height: 20px;
      max-width: 440px;
      margin: 0 auto;
    }

    .empty-state-cta-btn {
      margin-top: 16px;
    }
  }
}
</style>
