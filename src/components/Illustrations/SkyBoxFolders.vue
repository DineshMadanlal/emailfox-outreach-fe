<template>
  <div class="folder-illustration">
    <!-- container -->
    <div class="folder-illustration-container">
      <!-- Illustration -->
      <LocalSvgIcon
        image="master-inbox"

        :isIconFolder="false"
        :isIllustrationFolder="true"
      />

      <!--  -->
      <h4 class="folder-header-text">
        SkyBox Folders
      </h4>

      <!--  -->
      <p class="folder-description-text">
        Create tailored inbox views using rules like sender, recipient, subject, or content -
        so you can streamline incoming emails and focus on what matters.
      </p>

      <!-- Add new domain -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="+ New Folder"
        to="/unibox/preferences/folder/add"
      >
      </q-btn>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'SkyBoxFoldersIllustration',
});
</script>

<style lang="scss" scoped>
.folder-illustration {
  padding: 130px 20px;

  display: flex;
  justify-content: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 16px;
  }

  .folder-illustration-container {
    width: 100%;
    max-width: 580px;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .folder-header-text {
      margin-top: 24px;
      margin-bottom: 8px;

      color: $black;
      font-size: 18px;
      font-weight: 600;
    }

    .folder-description-text {
      margin-bottom: 20px;
      text-align: center;

      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }

    .existing-folder-card {
      width: 100%;
      padding: 20px;
      margin-top: 36px;
      border-radius: 8px;
      border: 1px solid $grey-100;

      background: rgba($color: var(--grey-50-rgb), $alpha: 0.5);

      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      //xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 16px;
      }

    }
  }
}
</style>
