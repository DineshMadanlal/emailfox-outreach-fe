<template>
  <div class="all-contacts-illustration">
    <!-- container -->
    <div class="contacts-illustration-container">
      <!-- Illustration -->
      <LocalSvgIcon
        image="contacts"

        :isIconFolder="false"
        :isIllustrationFolder="true"
      />

      <!--  -->
      <h4 class="contacts-header-text">
        Let’s bring your contacts in
      </h4>

      <!--  -->
      <p class="contacts-description-text">
        Upload your list and manage all your outreach contacts from one place.
      </p>

      <!-- Add new domain -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Upload Contacts"

        :to="toRoute"
      ></q-btn>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'AllContacts',

  props: {
    listId: {
      type: [String, Number],
      default: null,
    },
    campaignId: {
      type: [String, Number],
      default: null,
    },
  },

  setup(props) {
    const toRoute = computed(() => {
      if (props.listId) {
        return `/outreach/contacts/${props.listId}/upload`;
      } if (props.campaignId) {
        return `/outreach/campaigns/${props.campaignId}/edit/contacts`;
      }

      return '/outreach/contacts/upload';
    });

    return {
      // computed
      toRoute,
    };
  },
});
</script>

<style lang="scss" scoped>
.all-contacts-illustration {
  padding: 60px 20px;

  display: flex;
  justify-content: center;

  // sm max
  @media (max-width: $breakpoint-sm-max) {
    padding: 40px 20px;
  }

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 16px;
  }

  .contacts-illustration-container {
    width: 100%;
    max-width: 580px;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .contacts-header-text {
      margin-top: 24px;
      margin-bottom: 8px;

      color: $black;
      font-size: 18px;
      font-weight: 600;
    }

    .contacts-description-text {
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
