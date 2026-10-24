<template>
  <div
    id="contactByIdHeader"
    class="contact-by-id-header"
  >
    <!-- Top header: Breadcrumbs & Close -->
    <div class="contact-id-top-header">
      <!-- Breadcrumb Link to Contacts -->
      <router-link
        to="/outreach/contacts/all"
        class="contact-route-link-text"
      >
        Contacts
      </router-link>

      <LocalSvgIcon
        image="plain-down-arrow"
        classes="plain-down-arrow-icon"
      />

      <p class="contact-current-name-text">
        {{ contactDisplayName }}
      </p>

      <q-space />

      <!-- Close button -->
      <q-btn
        flat
        round
        dense
        color="negative"
        class="app-negative-button"
        @click="closePage"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />
      </q-btn>
    </div>

    <!-- Bottom header: Profile info & Action buttons -->
    <div class="contact-id-bottom-header">
      <!-- Left: Avatar & Contact Meta -->
      <div class="contact-profile-section">
        <!-- Avatar Initial Box -->
        <div class="contact-avatar-box">
          <span class="avatar-initial">{{ contactInitial }}</span>
        </div>

        <div class="contact-info-col">
          <!-- Name & Status Badges -->
          <div class="contact-name-row">
            <h6
              :title="contactDisplayName"
              class="contact-name-text ellipsis"
            >
              {{ contactDisplayName }}
            </h6>

            <div
              v-if="engagementStatusLabel"
              class="contact-badge-group"
            >
              <span
                class="contact-pill-badge"
                :class="engagementBadgeClass"
              >
                {{ engagementStatusLabel }}
              </span>
            </div>
          </div>

          <!-- Email & LinkedIn Meta Row -->
          <div class="contact-meta-row">
            <!-- Email -->
            <div
              v-if="contactEmail"
              class="contact-meta-item"
            >
              <LocalSvgIcon
                :image="espLogo"
                classes="meta-icon esp-icon"
              />
              <span class="meta-text">{{ contactEmail }}</span>
            </div>

            <!-- Separator Dot -->
            <LocalSvgIcon
              v-if="contactEmail && contactLinkedIn"
              image="circle-dot"
              classes="dot-icon"
            />

            <!-- LinkedIn -->
            <a
              v-if="contactLinkedIn"
              :href="linkedinHref"
              target="_blank"
              rel="noopener noreferrer"
              :title="contactLinkedIn"
              class="contact-meta-item linkedin-meta-link"
            >
              <LocalSvgIcon
                image="linkedin"
                classes="meta-icon"
              />
              <span class="meta-text ellipsis">{{ linkedinDisplayUrl }}</span>
            </a>
          </div>
        </div>
      </div>

      <q-space />

      <!-- Right: Action Buttons -->
      <div class="contact-header-actions">
        <!-- More Options Menu Button -->
        <q-btn
          dense
          outlined
          unelevated
          class="contact-action-btn contact-more-btn"
        >
          <LocalSvgIcon
            image="more"
            classes="contact-more-icon"
          />

          <ContactByIdMoreOptions
            :contactJson="contactJson"
            @editContact="$emit('editContact')"
            @deleteContact="$emit('deleteContact')"
          />
        </q-btn>
      </div>
    </div>

    <!-- Navigation Tabs -->
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
        exact
        v-for="(page, index) in contactTabs"
        :key="`contact-tab-${index}-${page.label}`"
        :to="page.route"
        :label="page.label"
        class="app-route-tab"
      />
    </q-tabs>
  </div>
</template>

<script>
// vue
import {
  defineComponent, computed,
} from 'vue';

// vue router
import { useRoute, useRouter } from 'vue-router';

// components
import ContactByIdMoreOptions from 'components/Menu/ContactByIdMoreOptions.vue';

// constants
import { ENGAGEMENT_SCORE_STATUS } from 'boot/workspace-constants';
import { ESP_PROVIDERS } from 'boot/mailbox-constants';

// utils
import { formatLinkedinDisplayUrl, formatLinkedinHref } from 'src/utils/helperFunctions';

export default defineComponent({
  name: 'ContactByIdHeader',

  emits: ['editContact', 'deleteContact'],

  components: {
    ContactByIdMoreOptions,
  },

  props: {
    contactJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    // route
    const route = useRoute();
    const router = useRouter();

    // computed
    const contactId = computed(() => route.params.contactId);

    // Computed Contact Info
    const contactData = computed(() => {
      const c = props.contactJson?.contact || props.contactJson || {};

      return {
        firstName: c.first_name || '',
        lastName: c.last_name || '',
        email: c.email || '',
        esp: c.esp_provider || '',
        linkedin: c.linkedin_url || '',
        engagementStatus: props.contactJson?.engagement_score?.status || c.engagement_status || c.sentiment || '',
      };
    });

    const contactDisplayName = computed(() => {
      const full = `${contactData.value.firstName} ${contactData.value.lastName}`.trim();

      return full || contactData.value.email || '-';
    });

    const contactInitial = computed(() => {
      if (contactData.value.firstName) {
        return contactData.value.firstName.charAt(0).toUpperCase();
      }
      if (contactData.value.email) {
        return contactData.value.email.charAt(0).toUpperCase();
      }
      return '-';
    });

    const contactEmail = computed(() => contactData.value.email);
    const contactLinkedIn = computed(() => contactData.value.linkedin);

    const linkedinDisplayUrl = computed(() => formatLinkedinDisplayUrl(contactLinkedIn.value, ''));

    const linkedinHref = computed(() => formatLinkedinHref(contactLinkedIn.value));

    const engagementScoreStatus = computed(() => {
      const status = (contactData.value.engagementStatus || '').toUpperCase();
      return ENGAGEMENT_SCORE_STATUS[status] || null;
    });

    const engagementStatusLabel = computed(() => (
      engagementScoreStatus.value?.label?.toUpperCase() || contactData.value.engagementStatus
    ));

    const engagementBadgeClass = computed(() => {
      const color = engagementScoreStatus.value?.color || 'information';
      return `badge-${color}`;
    });

    const espLogo = computed(() => {
      const esp = (contactData.value.esp || '').toUpperCase();
      switch (esp) {
        case ESP_PROVIDERS.GMAIL:
          return 'gmail';
        case ESP_PROVIDERS.OUTLOOK:
          return 'outlook';
        case ESP_PROVIDERS.YAHOO:
          return 'yahoo';
        case ESP_PROVIDERS.ZOHO:
          return 'zoho';
        case ESP_PROVIDERS.AZURE:
          return 'azure';
        case ESP_PROVIDERS.CUSTOM_SMTP:
          return 'other-smtp';
        default:
          return 'mail';
      }
    });

    // Tab routes
    const contactTabs = computed(() => [
      {
        label: 'Overview',
        route: `/outreach/contacts/${contactId.value}/overview`,
      },
      // {
      //   label: 'Inbox',
      //   route: `/outreach/contacts/${contactId.value}/inbox`,
      // },
      {
        label: 'Campaigns',
        route: `/outreach/contacts/${contactId.value}/campaigns`,
      },
    ]);

    const closePage = () => {
      try {
        router.go(-1);
      } catch (e) {
        router.push('/outreach/contacts/all');
      }
    };

    return {
      // computed
      contactId,
      contactDisplayName,
      contactInitial,
      contactEmail,
      contactLinkedIn,
      linkedinDisplayUrl,
      linkedinHref,
      contactTabs,
      espLogo,
      engagementStatusLabel,
      engagementBadgeClass,

      // methods
      closePage,
    };
  },
});
</script>

<style lang="scss" scoped>
.contact-by-id-header {
  width: 100%;

  top: 0px;
  z-index: 2;
  position: sticky;
  background: $white;
  border-bottom: 1px solid $grey-50;

  // Top header: Breadcrumbs & Close
  .contact-id-top-header {
    width: 100%;
    padding: 12px 20px 4px 20px;
    display: flex;
    align-items: center;

    @media (max-width: $breakpoint-xs-max) {
      padding: 12px 16px 4px 16px;
    }

    .contact-route-link-text {
      color: $grey;
      font-size: 14px;
      font-weight: 400;
      text-decoration: none;

      &:hover {
        color: $primary;
        text-decoration: underline;
      }
    }

    .plain-down-arrow-icon {
      height: 8px;
      width: 8px;
      margin: 0px 12px;
      transform: rotate(-90deg);
    }

    .contact-current-name-text {
      color: $black;
      font-size: 14px;
    }
  }

  // Bottom header: Profile info & Actions
  .contact-id-bottom-header {
    width: 100%;
    padding: 12px 20px 12px 20px;
    display: flex;
    align-items: center;
    gap: 16px;

    @media (max-width: $breakpoint-xs-max) {
      padding: 12px 16px 12px 16px;
      flex-direction: column;
      align-items: flex-start;
    }

    .contact-profile-section {
      display: flex;
      align-items: center;
      gap: 14px;

      .contact-avatar-box {
        width: 44px;
        height: 44px;
        border-radius: 8px;
        border: 1px solid rgba(var(--primary-rgb), 0.2);
        background-color: rgba(var(--primary-rgb), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        .avatar-initial {
          color: $primary;
          font-size: 20px;
          font-weight: 600;
          line-height: 1;
          font-size: 20px;
        }
      }

      .contact-info-col {
        display: flex;
        flex-direction: column;
        gap: 4px;

        .contact-name-row {
          display: flex;
          align-items: center;
          gap: 10px;

          .contact-name-text {
            color: $black;
            font-size: 18px;
            font-weight: 600;
            line-height: 24px;
            max-width: 340px;

            @media (max-width: $breakpoint-xs-max) {
              max-width: 220px;
            }
          }

          .contact-badge-group {
            display: flex;
            align-items: center;
            gap: 6px;

            .contact-pill-badge {
              font-size: 11px;
              font-weight: 600;
              letter-spacing: 0.3px;
              padding: 2px 8px;
              border-radius: 4px;
              line-height: 16px;
              display: inline-flex;
              align-items: center;

              &.badge-positive {
                background-color: rgba(var(--positive-rgb), 0.1);
                color: $positive;
              }

              &.badge-warning {
                background-color: rgba(var(--warning-rgb), 0.1);
                color: $warning;
              }

              &.badge-information {
                background-color: rgba(var(--information-rgb), 0.1);
                color: $information;
              }

              &.badge-negative {
                background-color: rgba(var(--negative-rgb), 0.1);
                color: $negative;
              }

              &.badge-grey {
                background-color: rgba(var(--grey-rgb), 0.1);
                color: $grey;
              }

              &.badge-primary {
                background-color: rgba(var(--primary-rgb), 0.1);
                color: $primary;
              }
            }
          }
        }

        .contact-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;

          .contact-meta-item {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            text-decoration: none;

            .meta-icon {
              width: 14px;
              height: 14px;
            }

            .meta-text {
              color: rgba(var(--grey-rgb), 0.7);
              font-size: 13px;
              font-weight: 400;
              line-height: 16px;
            }

            &.linkedin-meta-link {
              cursor: pointer;
              max-width: 240px;

              .meta-text {
                transition: color 0.15s ease;
              }

              &:hover {
                .meta-text {
                  color: $primary;
                  text-decoration: underline;
                }
              }
            }
          }

          :deep(.dot-icon) {
            max-height: 3px;
            max-width: 3px;

            circle {
              fill: $grey;
              stroke-width: 1px;
            }
          }
        }
      }
    }

    // Action buttons on right
    .contact-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;

      @media (max-width: $breakpoint-xs-max) {
        width: 100%;
        justify-content: flex-start;
      }

      .contact-action-btn {
        height: 36px;
        background: $white;
        border: 1px solid $blue-grey;

        &.contact-more-btn {
          width: 36px;
          padding: 0;

          :deep(.contact-more-icon) {
            width: 16px;
            height: 16px;
            @include svg-icon-stroke('path, rect', $grey);
          }
        }
      }
    }
  }
}
</style>
