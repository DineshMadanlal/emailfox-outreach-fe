<template>
  <div class="mailbox-sequence-illustration">
    <!-- container -->
    <div class="illustration-container">
      <!-- Illustration -->
      <LocalSvgIcon
        image="sequences"

        :isIconFolder="false"
        :isIllustrationFolder="true"
      />

      <p class="illustration-header-text">
        No sequences linked to this mailbox
      </p>

      <p class="illustration-body-text">
        This mailbox hasn’t been assigned to any campaigns yet. Once
        connected to a sequence, all related campaigns will appear here.
      </p>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'MailboxSequenceIllustration',
});
</script>

<style lang="scss" scoped>
.mailbox-sequence-illustration {
  padding: 40px 20px;

  display: flex;
  justify-content: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 16px;
  }

  .illustration-container {
    width: 100%;
    max-width: 630px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    .illustration-header-text {
      color: $black;
      text-align: center;
      font-size: 18px;
      font-weight: 600;

      margin-top: 24px;
      text-align: center;
    }

    .illustration-body-text {
      margin-top: 8px;

      color: rgba($color: var(--black-rgb), $alpha: 0.8);
      font-size: 14px;
      font-weight: 400;
      text-align: center;

      max-width: 430px;
    }
  }
}
</style>
