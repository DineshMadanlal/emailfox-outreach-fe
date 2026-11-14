<template>
  <div
    id="contactByIdHeader"
    class="contact-by-id-header"
  >
    <!-- Top header: Breadcrumbs & Close -->
    <div class="contact-id-top-header">
      <!-- Breadcrumb Link to Contacts (Page Mode) -->
      <template v-if="!isModal">
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
      </template>

      <!-- Drawer Title (Modal Mode) -->
      <template v-else>
        <span class="contact-drawer-title-text">
          Contact Details
        </span>
      </template>

      <q-space />

      <!-- Open in full page button (Modal Mode) -->
      <q-btn
        v-if="isModal"
        flat
        round
        dense
        color="grey-7"
        class="drawer-open-page-btn q-mr-xs"
        :to="fullPageRoute"
        target="_blank"
      >
        <q-icon
          name="open_in_new"
          size="18px"
        />
        <AppTooltip content="Open in full page" />
      </q-btn>

      <!-- Close button -->
      <q-btn
        flat
        round
        dense
        color="negative"
        class="app-negative-button"
        @click="handleClose"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />
        <AppTooltip
          v-if="isModal"
          content="Close (Esc)"
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
              v-if="statusBadge"
              class="contact-badge-group"
            >
              <span
                class="contact-pill-badge"
                :class="statusBadge.badgeClass"
              >
                {{ statusBadge.label }}
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

    <!-- Navigation Tabs (Modal Mode: In-Memory Tabs) -->
    <q-tabs
      v-if="isModal"
      dense
      mobile-arrows
      narrow-indicator
      :breakpoint="0"
      align="left"
      class="app-tabs"
      active-color="primary"
      indicator-color="primary"
      :model-value="activeTab"
      @update:model-value="$emit('update:activeTab', $event)"
    >
      <q-tab
        no-caps
        v-for="page in modalTabs"
        :key="`modal-tab-${page.name}`"
        :name="page.name"
        :label="page.label"
        class="app-route-tab"
      />
    </q-tabs>

    <!-- Navigation Tabs (Page Mode: Router Tabs) -->
    <q-tabs
      v-else
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
import AppTooltip from 'components/General/AppTooltip.vue';

// constants
import { ENGAGEMENT_SCORE_STATUS } from 'boot/workspace-constants';
import { ESP_PROVIDERS } from 'boot/mailbox-constants';
import { CAMPAIGN_CONTACT_STATUS } from 'boot/campaign-constants';

// utils
import { formatLinkedinDisplayUrl, formatLinkedinHref } from 'src/utils/helperFunctions';

export default defineComponent({
  name: 'ContactByIdHeader',

  components: {
    ContactByIdMoreOptions,
    AppTooltip,
  },

  props: {
    contactJson: {
      type: Object,
      default: () => ({}),
    },
    contactId: {
      type: [String, Number],
      default: null,
    },
    isModal: {
      type: Boolean,
      default: false,
    },
    hideCampaignsTab: {
      type: Boolean,
      default: false,
    },
    activeTab: {
      type: String,
      default: 'overview',
    },
  },

  emits: ['editContact', 'deleteContact', 'closeModal', 'update:activeTab'],

  setup(props, { emit }) {
    // route
    const route = useRoute();
    const router = useRouter();

    // computed
    const effectiveContactId = computed(() => (
      props.contactId
      || route.params.contactId
      || props.contactJson?.contact?.id
      || props.contactJson?.id
      || null
    ));

    // Computed Contact Info
    const contactData = computed(() => {
      const c = props.contactJson?.contact || props.contactJson || {};

      return {
        firstName: c.first_name || '',
        lastName: c.last_name || '',
        email: c.email || c.contact_email || '',
        esp: c.esp_provider || '',
        linkedin: c.linkedin_url || '',
        engagementStatus: (
          props.contactJson?.engagement_score?.status
          || c.engagement_status
          || c.sentiment
          || ''
        ),
        status: props.contactJson?.status || c.status || '',
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

    const linkedinDisplayUrl = computed(() => formatLinkedinDisplayUrl(
      contactLinkedIn.value,
      '',
    ));

    const linkedinHref = computed(() => formatLinkedinHref(contactLinkedIn.value));

    const statusBadge = computed(() => {
      if (contactData.value.status) {
        const key = String(contactData.value.status).toUpperCase();
        const config = CAMPAIGN_CONTACT_STATUS[key];
        return {
          label: config?.label?.toUpperCase() || key,
          badgeClass: `badge-status-${key.toLowerCase()}`,
        };
      }

      const engStatus = (contactData.value.engagementStatus || '').toUpperCase();
      if (engStatus && ENGAGEMENT_SCORE_STATUS[engStatus]) {
        const config = ENGAGEMENT_SCORE_STATUS[engStatus];
        return {
          label: config.label.toUpperCase(),
          badgeClass: `badge-${config.color || 'information'}`,
        };
      }

      if (contactData.value.engagementStatus) {
        return {
          label: String(contactData.value.engagementStatus).toUpperCase(),
          badgeClass: 'badge-information',
        };
      }

      return null;
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

    const fullPageRoute = computed(() => {
      const tab = props.activeTab || 'overview';
      return `/outreach/contacts/${effectiveContactId.value}/${tab}`;
    });

    // Tab routes for page mode
    const contactTabs = computed(() => [
      {
        label: 'Overview',
        route: `/outreach/contacts/${effectiveContactId.value}/overview`,
      },
      {
        label: 'Inbox',
        route: `/outreach/contacts/${effectiveContactId.value}/inbox`,
      },
      {
        label: 'Campaigns',
        route: `/outreach/contacts/${effectiveContactId.value}/campaigns`,
      },
    ]);

    // Tab items for modal mode
    const modalTabs = computed(() => {
      const tabs = [
        { name: 'overview', label: 'Overview' },
        { name: 'inbox', label: 'Inbox' },
      ];
      if (!props.hideCampaignsTab) {
        tabs.push({ name: 'campaigns', label: 'Campaigns' });
      }
      return tabs;
    });

    const handleClose = () => {
      if (props.isModal) {
        emit('closeModal');
      } else {
        try {
          router.go(-1);
        } catch (e) {
          router.push('/outreach/contacts/all');
        }
      }
    };

    return {
      // computed
      effectiveContactId,
      contactDisplayName,
      contactInitial,
      contactEmail,
      contactLinkedIn,
      linkedinDisplayUrl,
      linkedinHref,
      contactTabs,
      modalTabs,
      fullPageRoute,
      espLogo,
      statusBadge,

      // methods
      handleClose,
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

    .contact-drawer-title-text {
      color: $black;
      font-size: 15px;
      font-weight: 600;
    }

    .drawer-open-page-btn {
      width: 32px;
      height: 32px;
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

              &.badge-positive,
              &.badge-status-replied,
              &.badge-status-active {
                background-color: rgba(var(--positive-rgb), 0.1);
                color: $positive;
              }

              &.badge-warning,
              &.badge-status-paused,
              &.badge-status-stopped {
                background-color: rgba(var(--warning-rgb), 0.1);
                color: $warning;
              }

              &.badge-information,
              &.badge-status-completed {
                background-color: rgba(var(--information-rgb), 0.1);
                color: $information;
              }

              &.badge-negative,
              &.badge-status-failed,
              &.badge-status-bounced,
              &.badge-status-unsubscribed {
                background-color: rgba(var(--negative-rgb), 0.1);
                color: $negative;
              }

              &.badge-status-not_started {
                background-color: $grey-50;
                color: $grey-7;
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
