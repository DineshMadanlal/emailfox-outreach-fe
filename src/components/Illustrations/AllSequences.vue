<template>
  <div class="all-campaigns-illustration">
    <!-- container -->
    <div class="illustration-container">
      <!-- Illustration -->
      <LocalSvgIcon
        image="sequences"

        :isIconFolder="false"
        :isIllustrationFolder="true"
      />

      <p class="illustration-header-text">
        Launch your first outreach sequence
      </p>
      <p class="illustration-body-text">
        Automate your cold emails, follow-ups and engagement in just a few steps.
      </p>

      <!-- Create Campaign button -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Create Campaign"

        @click="$emit('createNewCampaign')"
      />

      <!-- Ability for the user to either add contact or add mailbox -->
      <div class="contacts-mailboxes-redirect-wrapper">
        <!-- Add/buy mailboxes -->
        <q-item
          clickable
          class="each-redirect-item"
          to="/outreach/mailboxes/new"
        >
          <div>
            <LocalSvgIcon
              image="mailboxes"

              :isIconFolder="false"
              :isIllustrationFolder="true"
            />

            <p class="redirect-header-text">
              Set up sending mailbox
            </p>

            <p class="redirect-body-text">
              Purchase or connect your mailbox to send email sequence.
            </p>
          </div>
        </q-item>

        <!-- Add contacts -->
        <q-item
          clickable
          class="each-redirect-item"
          to="/outreach/contacts/upload"
        >
          <div>
            <LocalSvgIcon
              image="contacts"

              classes="contacts-icon"

              :isIconFolder="false"
              :isIllustrationFolder="true"
            />

            <p class="redirect-header-text">
              Add contacts to start
            </p>

            <p class="redirect-body-text">
              Import or add contacts to link with your sequence and begin outreach.
            </p>
          </div>
        </q-item>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// quasar
import { useMeta } from 'quasar';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

export default defineComponent({
  name: 'AllSequencesIllustration',

  emits: ['createNewCampaign'],

  setup() {
    // composition API
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('All Campaigns'));

    return {
      // computed
      isMobileDevice,
    };
  },
});
</script>

<style lang="scss" scoped>
.all-campaigns-illustration {
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
    }

    .illustration-body-text {
      margin-top: 8px;
      margin-bottom: 24px;

      color: rgba($color: var(--black-rgb), $alpha: 0.8);
      font-size: 14px;
      font-weight: 400;
    }

    .contacts-mailboxes-redirect-wrapper {
      width: 100%;
      display: flex;
      gap: 20px;
      margin-top: 40px;

      // sm max
      @media (max-width: $breakpoint-sm-max) {
        flex-direction: column;
        width: 100%;
        align-items: center;
        justify-content: center;
      }

      :deep(.contacts-icon) {
        width: 40px;
        height: 40px;

        circle {
          stroke: $primary;

          &:first-child {
            stroke: unset;
            fill: rgba($color: var(--primary-rgb), $alpha: 0.1);
          }
        }

        path {
          stroke: $primary;
        }
      }

      .each-redirect-item {
        width: 100%;
        padding: 12px;
        min-height: unset;

        border-radius: 6px;
        background: $white;
        border: 1px solid $grey-50;

        .redirect-header-text {
          margin-top: 12px;
          margin-bottom: 8px;

          color: $black;
          font-size: 16px;
          font-weight: 600;
        }

        .redirect-body-text {
          color: rgba($color: var(--black-rgb), $alpha: 0.8);
          font-size: 14px;
          font-weight: 400;
          line-height: 20px; /* 142.857% */
        }
      }
    }
  }
}
</style>
