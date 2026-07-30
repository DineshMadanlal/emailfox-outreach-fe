<template>
  <div class="all-lists-llustration">
    <!-- container -->
    <div class="list-illustration-container">
      <!-- Illustration -->
      <div class="list-img-container">
        <LocalSvgIcon
          image="lists"
          classes="list-img"
        />
      </div>

      <!-- header -->
      <h4 class="list-header-text">
        <!-- Create/Add Your Lists -->
        Create your first list to start sending emails
      </h4>

      <!-- description -->
      <p class="list-description-text">
        <!-- list description -->
        Lists are used to organize your contacts and manage your email campaigns effectively.
        Create a list to start adding contacts and sending personalized emails.
      </p>

      <!-- Actions -->
      <div class="list-actions">
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="+ New List"

          @click="$emit('createList')"
        />
      </div>

      <!--  -->
      <TipCard
        tipText="Tip: Lists help you segment your contacts for targeted email campaigns.
        Create lists based on your audience's interests, demographics, or behavior to improve
        engagement and conversion rates."
      />
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// components
import TipCard from 'components/General/TipCard.vue';

export default defineComponent({
  name: 'AllLists',

  emits: ['createList'],

  components: {
    TipCard,
  },
});
</script>

<style lang="scss" scoped>
.all-lists-llustration {
  padding: 40px 20px;

  display: flex;
  justify-content: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 16px;
  }

  .list-illustration-container {
    width: 100%;
    max-width: 580px;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    :deep(.list-img-container) {
      height: 76px;
      width: 76px;
      background-color: $grey-50;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      .list-img {
        height: 24px;
        width: 24px;

        @include svg-icon-fill('circle', $grey-50);
        @include svg-icon-stroke('ellipse, path, rect', $grey);
      }
    }

    .list-header-text {
      margin-top: 24px;
      margin-bottom: 8px;

      color: $black;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
    }

    .list-description-text {
      margin-bottom: 20px;
      text-align: center;

      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }

    .list-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      margin-bottom: 40px;
    }
  }
}
</style>
