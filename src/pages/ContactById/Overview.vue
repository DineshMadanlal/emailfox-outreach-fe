<template>
  <div class="contact-by-id-overview-page">
    <div class="contact-overview-content-wrapper">
      <!-- Grid Container: Left main column & Right sidebar -->
      <div class="contact-overview-grid">
        <!-- Left Section (Engagement Score, Current Outreach, Overall Engagement) -->
        <div class="contact-overview-left-section">
          <!-- Row 1: (Engagement Score + Contact Lists) & Current Outreach -->
          <div class="contact-overview-top-row">
            <div class="contact-overview-score-lists-col">
              <EngagementScore
                :engagementScoreJson="overviewData.engagement_score"
              />

              <ContactLists
                :lists="overviewData.lists"
              />
            </div>

            <CurrentOutreach
              :currentOutreachJson="overviewData.current_outreach"
            />
          </div>

          <!-- Row 2: Overall Engagement Summary -->
          <OverallEngagement
            :overallEngagementJson="overviewData.overall_engagement"
          />
        </div>

        <!-- Right Section: Basic & Other Details (Sidebar) -->
        <div class="contact-overview-right-section">
          <ContactDetails
            :contactJson="overviewData.contact"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, computed, inject,
} from 'vue';

// components
import EngagementScore from 'components/ContactById/EngagementScore.vue';
import ContactLists from 'components/ContactById/ContactLists.vue';
import CurrentOutreach from 'components/ContactById/CurrentOutreach.vue';
import OverallEngagement from 'components/ContactById/OverallEngagement.vue';
import ContactDetails from 'components/ContactById/ContactDetails.vue';

export default defineComponent({
  name: 'ContactOverview',

  components: {
    EngagementScore,
    ContactLists,
    CurrentOutreach,
    OverallEngagement,
    ContactDetails,
  },

  props: {
    contactOverviewData: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    const injectedOverviewData = inject('contactOverviewData', null);

    const overviewData = computed(() => {
      if (props.contactOverviewData && Object.keys(props.contactOverviewData).length > 0) {
        return props.contactOverviewData;
      }
      return injectedOverviewData?.value || {};
    });

    return {
      overviewData,
    };
  },
});
</script>

<style lang="scss" scoped>
.contact-by-id-overview-page {
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: $white;

  .contact-overview-content-wrapper {
    width: 100%;
    padding: 20px 24px;

    @media (max-width: $breakpoint-xs-max) {
      padding: 16px;
    }

    .contact-overview-grid {
      display: flex;
      gap: 20px;
      align-items: flex-start;

      @media (max-width: $breakpoint-md-max) {
        flex-direction: column;
      }

      .contact-overview-left-section {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 20px;
        min-width: 0;
        width: 100%;

        .contact-overview-top-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;

          @media (max-width: $breakpoint-sm-max) {
            grid-template-columns: 1fr;
          }

          .contact-overview-score-lists-col {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
        }
      }

      .contact-overview-right-section {
        width: 320px;
        flex-shrink: 0;

        @media (max-width: $breakpoint-md-max) {
          width: 100%;
        }
      }
    }
  }
}
</style>
