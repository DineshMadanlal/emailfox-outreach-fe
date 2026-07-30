<template>
  <div
    id="sequenceByIdHeader"
    class="sequence-by-id-header"
  >
    <!-- top header -->
    <div class="sequence-id-top-header">
      <!-- Campaigns route -->
      <router-link
        :to="`/outreach/campaigns-all`"
        class="sequence-route-link-text"
      >
        Campaign
      </router-link>

      <LocalSvgIcon
        image="plain-down-arrow"
        classes="plain-down-arrow-icon"
      />

      <p class="overview-text">
        Overview
      </p>
    </div>

    <!-- bottom header -->
    <div class="sequence-id-bottom-header">
      <!-- left -->
      <div>
        <h6 class="sequence-name-text ellipsis">
          Outreach campaign
        </h6>

        <div class="sequence-details-grid">
          <!-- Status -->
          <CampaignProgress
            status="INPROGRESS"
          />

          <!-- Dot -->
          <LocalSvgIcon
            image="circle-dot"
            classes="dot-icon"
          />

          <!-- Number of campaigns -->
          <div class="flex item-center no-wrap">
            <LocalSvgIcon
              image="seq-sent"
            />

            <p class="seq-value-text">
              {{ numberOfCampaigns }}
            </p>
          </div>

          <!-- Dot -->
          <LocalSvgIcon
            image="circle-dot"
            classes="dot-icon"
          />

          <!-- Number of contacts -->
          <div class="flex item-center no-wrap">
            <LocalSvgIcon
              image="contacts"
              classes="seq-contact-icon"
            />

            <p class="seq-value-text">
              {{ numberOfContacts }}
            </p>
          </div>
        </div>
      </div>

      <q-space />

      <!-- right -->
      <div class="sequence-by-id-actions">
        <!-- More -->
        <q-btn
          dense
          outlined
          unelevated
          @click.stop.prevent

          class="sequence-more-btn"
        >
          <!-- more -->
          <LocalSvgIcon
            image="more"
            classes="sequence-more-icon"
          />
        </q-btn>

        <!-- Edit Button -->
        <q-btn
          flat
          no-caps
          unelevated

          color="black"
          class="edit-sequence-btn"
        >
          <LocalSvgIcon
            image="edit"
            classes="edit-icon"
          />

          <p class="q-ml-xs">
            Edit
          </p>
        </q-btn>

        <!-- Add Contacts Button -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          class="add-contacts-btn"
        >
          <div class="flex no-wrap items-center">
            <LocalSvgIcon
              image="contacts"
              classes="contacts-icon"
            />
            <p class="text-weight-medium q-ml-xs">
              Add Contacts
            </p>
          </div>
        </q-btn>
      </div>
    </div>

    <!-- Tabs -->
    <!-- Tab components -->
    <q-tabs
      dense
      mobile-arrows
      narrow-indicator
      :breakpoint="0"

      align="left"
      class="app-tabs"
      active-color="primary"
      indicator-color="primary"
    >
      <q-route-tab
        no-caps

        v-for="(page, index) in sequenceByIdRoutes"

        :key="`sequence-id-${index}-${page.name}`"
        :to="page.path"
      >
        <!-- page label -->
        <p class="route-label-text">
          {{ page.name }}
        </p>
      </q-route-tab>
    </q-tabs>
  </div>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// components
import CampaignProgress from 'components/Campaigns/CampaignProgress.vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers.js';

export default defineComponent({
  name: 'SequenceByIdHeader',

  components: {
    CampaignProgress,
  },

  props: {
    campaignByIdJson: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    // computed
    const numberOfCampaigns = computed(() => 4);
    const numberOfContacts = computed(() => getNumeralAmount(12345));

    const sequenceByIdRoutes = computed(() => {
      const sequenceId = props.campaignByIdJson.id;

      return [
        {
          name: 'Overview',
          path: `/outreach/campaigns/${sequenceId}/overview`,
        },
        {
          name: 'Analytics',
          path: `/outreach/campaigns/${sequenceId}/analytics`,
        },
        // {
        //   name: 'Inbox',
        //   path: `/outreach/campaigns/${sequenceId}/inbox`,
        // },
        {
          name: 'Contacts',
          path: `/outreach/campaigns/${sequenceId}/contacts`,
        },
        {
          name: 'Sender Mailboxes',
          path: `/outreach/campaigns/${sequenceId}/sender-mailboxes`,
        },
        // {
        //   name: 'Activity',
        //   path: `/outreach/campaigns/${sequenceId}/activity`,
        // },
      ];
    });

    return {
      // computed
      numberOfContacts,
      sequenceByIdRoutes,
      numberOfCampaigns,
    };
  },
});
</script>

<style lang="scss" scoped>
.sequence-by-id-header {
  width: 100%;

  top: 0px;
  z-index: 2;
  position: sticky;

  background: $white;

  border-radius: 8px 8px 0px 0px;

  border-bottom: 1px solid $grey-50;

  // top header
  .sequence-id-top-header {
    width: 100%;

    padding: 24px 20px 4px 20px;

    display: flex;
    align-items: center;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 16px 4px 16px;
    }

    .sequence-route-link-text {
      color: $grey;
      font-size: 14px;
      font-weight: 400;

      text-decoration: unset;

      &:hover {
        color: $primary;
        text-decoration: underline;
      }
    }

    :deep(.plain-down-arrow-icon) {
      height: 8px;
      width: 8px;
      margin: 0px 12px;

      transform: rotate(-90deg);
    }

    .overview-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
    }
  }

  // bottom header
  .sequence-id-bottom-header {
    width: 100%;
    row-gap: 6px;
    padding: 16px 20px;

    display: flex;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px;
      flex-direction: column;
    }

    .sequence-details-grid {
      display: flex;
      align-items: center;
      gap: 12px;

      :deep(.seq-contact-icon) {
        @include svg-icon-stroke('path, circle, rect', $grey);
      }

      .seq-value-text {
        color: $black;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;

        margin-left: 6px;
      }

      :deep(.dot-icon) {
        max-height: 4px;
        max-width: 4px;

        circle {
          fill: $grey-300;
          stroke-width: 2px;
        }
      }

      :deep(.sequence-progress) {
        border: 0px;
        padding: 0px;
        background: unset;

        .status-text {
          font-size: 14px;
        }
      }
    }

    .sequence-name-text {
      color: $black;
      font-size: 18px;
      font-weight: 600;
      max-width: 380px;
      margin-bottom: 8px;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        max-width: 90vw;
      }
    }

    .sequence-by-id-actions {
      display: flex;
      gap: 12px;

      .sequence-more-btn {
        width: 36px;
        height: 36px;
        border: 1px solid $blue-grey;
      }

      .edit-sequence-btn {
        height: fit-content;
        border: 1px solid $blue-grey;
      }

      .add-contacts-btn {
        height: fit-content;

        :deep(.contacts-icon) {
          @include svg-icon-stroke('path, circle, rect', $white);
        }
      }
    }
  }
}
</style>
