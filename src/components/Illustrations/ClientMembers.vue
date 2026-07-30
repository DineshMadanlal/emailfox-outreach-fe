<template>
  <div class="team-members-illustration">
    <!-- container -->
    <div class="team-members-illustration-container">
      <!-- Illustration -->
      <LocalSvgIcon
        image="contacts"

        :isIconFolder="false"
        :isIllustrationFolder="true"
      />

      <!--  -->
      <h4 class="team-members-header-text">
        Add your clients to the workspace
      </h4>

      <!--  -->
      <p class="team-members-description-text">
        Create client accounts to give external access to campaigns, inboxes and reports.
        Client invitations are shared manually, making it ideal for whitelabel
        setups where your clients should not see the EmailFox platform.
      </p>

      <!-- Add new domain -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Create Client Member"

        @click="$emit('create')"
      ></q-btn>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ClientMembersIllustration',

  emits: ['create'],
});
</script>

<style lang="scss" scoped>
.team-members-illustration {
  padding: 40px 20px;

  display: flex;
  justify-content: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 16px;
  }

  .team-members-illustration-container {
    width: 100%;
    max-width: 580px;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .team-members-header-text {
      margin-top: 24px;
      margin-bottom: 8px;

      color: $black;
      font-size: 18px;
      font-weight: 600;
    }

    .team-members-description-text {
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
