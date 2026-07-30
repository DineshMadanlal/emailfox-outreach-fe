<template>
  <q-card
    class="app-modal-card update-nameservers-help-article-card"
  >
    <!-- header -->
    <div class="app-modal-header sticky-top">
      <h4 class="modal-header-text">
        Learn Steps to Update Domain Name Server
      </h4>

      <q-space />

      <!-- Close -->
      <q-btn
        flat
        round
        dense
        v-close-popup

        color="negative"
        class="app-negative-button"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />
      </q-btn>
    </div>

    <div class="app-modal-content">
      <ol class="help-article-steps-list">
        <li
          v-for="(step, index) in helpArticleList"
          :key="`help-article-step-${index}`"
          class="each-help-article-step"
        >
          {{ step }}
        </li>
      </ol>
    </div>
  </q-card>
</template>
<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'UpdateNameServersHelpArticle',

  setup() {
    const helpArticleList = [
      'Sign in to your domain registrar account (the website where you purchased your domain).',
      "Go to the domain management section - this may appear as 'Domain List,' 'My Domains,' or 'Domain Portfolio.'",
      "Click on the domain you want to update, then open the 'Manage' or 'Settings' option.",
      "Find the 'DNS,' 'DNS Management,' or 'Nameservers' section to view and edit current nameserver settings.",
      "Select 'Change' or 'Edit Nameservers.' You will usually see two choices: keep registrar default nameservers or set custom nameservers.",
      'If using custom nameservers, enter the new nameserver values (e.g., ns1.example.com, ns2.example.com).',
      'Save your changes, and complete any verification steps such as email confirmation or two-factor authentication if required.',
      'Allow time for DNS propagation. Updates can take anywhere from a few minutes to 48 hours to reflect worldwide.',
    ];

    return {
      // constants
      helpArticleList,
    };
  },
});
</script>

<style lang="scss" scoped>
.update-nameservers-help-article-card {
  width: 500px;
  background-color: $white;
  border-radius: 0 8px 8px 0;
  box-shadow: -3px 4px 12px 12px rgba(4, 26, 68, 0.03);

  max-height: 100vh;
  min-height: calc(100vh - 12px);
  border-radius: 0px 8px 8px 0px !important;

  position: relative;
  right: 6px;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    width: 100%;
  }

  .app-modal-content {
    .help-article-steps-list {
      counter-reset: step;
      list-style: none;
      padding-left: 0;

      .each-help-article-step {
        position: relative;
        padding-left: 44px;
        margin-bottom: 24px;
        background: none;

        color: $black;
        font-size: 14px;
        font-weight: 400;

        &::before {
          counter-increment: step;
          content: counter(step);
          position: absolute;

          left: 0;
          top: -1px;
          width: 32px;
          height: 32px;
          line-height: 32px;

          border-radius: 50%;
          background: rgba($color: var(--primary-rgb), $alpha: 0.1);

          color: $black;
          text-align: center;
          font-size: 16px;
          font-weight: 500;
          z-index: 1;
        }

        &:not(:last-child) {
          &::after {
            content: "";
            position: absolute;
            left: 16px; /* Align center under the circle */
            top: 32px; /* Just below the circle */
            width: 1.2px;
            height: calc(100% - 12px);
            background-color: $grey-50;
            z-index: 0;
          }
        }
      }
    }
  }
}
</style>
