<template>
  <div class="contact-details-card">
    <!-- 1. Basic Details Section -->
    <div class="details-section basic-details">
      <h6 class="section-title">
        Basic Details
      </h6>

      <div class="detail-rows-container">
        <!-- First Name -->
        <div class="detail-item-row">
          <span class="detail-label">First Name</span>
          <span class="detail-value">{{ firstName }}</span>
        </div>

        <!-- Last Name -->
        <div class="detail-item-row">
          <span class="detail-label">Last Name</span>
          <span class="detail-value">{{ lastName }}</span>
        </div>

        <!-- Email -->
        <div class="detail-item-row">
          <span class="detail-label">Email</span>
          <span
            :title="email"
            class="detail-value ellipsis"
          >
            {{ email }}
          </span>
        </div>

        <!-- Phone (if available) -->
        <div
          v-if="phone && phone !== '-'"
          class="detail-item-row"
        >
          <span class="detail-label">Phone</span>
          <span class="detail-value">{{ phone }}</span>
        </div>

        <!-- ESP -->
        <div class="detail-item-row">
          <span class="detail-label">ESP</span>
          <div class="detail-value esp-value">
            <MailboxEsp :esp="espProvider" />
          </div>
        </div>

        <!-- LinkedIn URL -->
        <div class="detail-item-row">
          <span class="detail-label">LinkedIn URL</span>
          <a
            v-if="linkedinUrl && linkedinUrl !== '-'"
            :href="linkedinHref"
            target="_blank"
            rel="noopener noreferrer"
            :title="linkedinUrl"
            class="detail-value linkedin-link ellipsis"
          >
            {{ linkedinDisplayUrl }}
          </a>
          <span
            v-else
            class="detail-value"
          >
            -
          </span>
        </div>

        <!-- Source -->
        <div class="detail-item-row">
          <span class="detail-label">Source</span>
          <div class="detail-value source-value">
            <LocalSvgIcon
              image="csv"
              classes="source-icon"
            />
            <span class="source-text">{{ sourceText }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Other Details Section -->
    <div class="details-section other-details">
      <h6 class="section-title">
        Other Details
      </h6>

      <div class="detail-rows-container">
        <!-- Location -->
        <div class="detail-item-row">
          <span class="detail-label">Location</span>
          <span
            :title="location"
            class="detail-value ellipsis"
          >
            {{ location }}
          </span>
        </div>

        <!-- Job Title -->
        <div class="detail-item-row">
          <span class="detail-label">Job Title</span>
          <span
            :title="jobTitle"
            class="detail-value ellipsis"
          >
            {{ jobTitle }}
          </span>
        </div>

        <!-- Company -->
        <div class="detail-item-row">
          <span class="detail-label">Company</span>
          <span
            :title="companyName"
            class="detail-value ellipsis"
          >
            {{ companyName }}
          </span>
        </div>

        <!-- Industry -->
        <div class="detail-item-row">
          <span class="detail-label">Industry</span>
          <span
            :title="industry"
            class="detail-value ellipsis"
          >
            {{ industry }}
          </span>
        </div>

        <!-- Website -->
        <div class="detail-item-row">
          <span class="detail-label">Website</span>
          <a
            v-if="website && website !== '-'"
            :href="websiteHref"
            target="_blank"
            rel="noopener noreferrer"
            :title="website"
            class="detail-value website-link ellipsis"
          >
            {{ website }}
          </a>
          <span
            v-else
            class="detail-value"
          >
            -
          </span>
        </div>

        <!-- Dynamic Custom Fields (non-system fields) -->
        <div
          v-for="field in customFieldRows"
          :key="field.key"
          class="detail-item-row"
        >
          <span class="detail-label">{{ field.label }}</span>
          <span
            :title="field.value"
            class="detail-value ellipsis"
          >
            {{ field.value }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// components
import MailboxEsp from 'components/Contacts/MailboxEsp.vue';

// constants
import { DEFAULT_SYSTEM_FIELDS } from 'boot/campaign-constants';

export default defineComponent({
  name: 'ContactDetails',

  components: {
    MailboxEsp,
  },

  props: {
    contactJson: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    const contact = computed(() => props.contactJson || {});

    // Basic Details Computed
    const firstName = computed(() => contact.value.first_name || '-');
    const lastName = computed(() => contact.value.last_name || '-');
    const email = computed(() => contact.value.email || '-');
    const phone = computed(() => contact.value.phone || '-');

    const espProvider = computed(() => {
      const p = contact.value.esp_provider || contact.value.provider;
      return (p && typeof p === 'string') ? p.toLowerCase() : 'other-smtp';
    });

    const linkedinUrl = computed(() => contact.value.linkedin_url || '-');

    const linkedinDisplayUrl = computed(() => {
      const url = linkedinUrl.value;
      if (!url || url === '-') return '-';
      const inMatch = url.match(/linkedin\.com\/in\/([^/?#]+)/i) || url.match(/^in\/([^/?#]+)/i);
      if (inMatch) {
        return `in/${inMatch[1]}`;
      }
      const companyMatch = url.match(/linkedin\.com\/company\/([^/?#]+)/i);
      if (companyMatch) {
        return `company/${companyMatch[1]}`;
      }
      return url.split('?')[0].split('#')[0].replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    });

    const linkedinHref = computed(() => {
      const url = linkedinUrl.value;
      if (!url || url === '-') return '#';
      return url.startsWith('http') ? url : `https://${url}`;
    });

    const sourceText = computed(() => {
      const c = contact.value;
      return c.source || c.metadata?.source || '-';
    });

    // Other Details Computed
    const location = computed(() => {
      const c = contact.value;
      const parts = [c.city, c.state, c.country].filter(Boolean);
      if (parts.length > 0) {
        return parts.join(', ');
      }
      return '-';
    });

    const jobTitle = computed(() => contact.value.job_title || '-');
    const companyName = computed(() => contact.value.company_name || '-');

    const industry = computed(() => {
      const c = contact.value;
      return c.industry || c.metadata?.industry || c.custom_fields?.industry || '-';
    });

    const website = computed(() => {
      const c = contact.value;
      return c.website || c.metadata?.website || c.custom_fields?.website || '-';
    });

    const websiteHref = computed(() => {
      const w = website.value;
      if (!w || w === '-') return '#';
      return w.startsWith('http') ? w : `https://${w}`;
    });

    // Custom fields excluding DEFAULT_SYSTEM_FIELDS
    const customFieldRows = computed(() => {
      const custom = contact.value.custom_fields || {};
      const systemKeys = new Set(DEFAULT_SYSTEM_FIELDS.map((f) => f.value));

      // Extra system attributes we already show
      systemKeys.add('industry');
      systemKeys.add('website');
      systemKeys.add('source');

      return Object.keys(custom)
        .filter((key) => !systemKeys.has(key) && custom[key])
        .map((key) => ({
          key,
          label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          value: String(custom[key]),
        }));
    });

    return {
      firstName,
      lastName,
      email,
      phone,
      espProvider,
      linkedinUrl,
      linkedinDisplayUrl,
      linkedinHref,
      sourceText,
      location,
      jobTitle,
      companyName,
      industry,
      website,
      websiteHref,
      customFieldRows,
    };
  },
});
</script>

<style lang="scss" scoped>
.contact-details-card {
  width: 100%;
  background-color: $white;
  border: 1px solid $grey-50;
  border-radius: 8px;
  display: flex;
  flex-direction: column;

  .details-section {
    padding: 16px 20px;

    &.basic-details {
      border-bottom: 1px solid $grey-50;
    }

    .section-title {
      color: $black;
      font-size: 16px;
      font-weight: 600;
      line-height: 20px;
      margin: 0 0 16px 0;
    }

    .detail-rows-container {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .detail-item-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;

        .detail-label {
          color: $grey;
          font-size: 13px;
          font-weight: 400;
          line-height: 18px;
          flex-shrink: 0;
        }

        .detail-value {
          color: $black;
          font-size: 13px;
          font-weight: 400;
          line-height: 18px;
          text-align: right;
          max-width: 170px;

          &.linkedin-link,
          &.website-link {
            color: $primary;
            text-decoration: none;

            &:hover {
              text-decoration: underline;
            }
          }
        }

        .esp-value {
          display: inline-flex;
          align-items: center;

          :deep(.mailbox-esp) {
            .esp-icon {
              width: 16px;
              height: 16px;
            }

            .esp-text {
              color: $black;
              font-size: 13px;
              font-weight: 400;
              margin-left: 6px;
            }
          }
        }

        .source-value {
          display: inline-flex;
          align-items: center;
          gap: 6px;

          :deep(.source-icon) {
            width: 16px;
            height: 16px;
          }

          .source-text {
            color: $black;
            font-size: 13px;
            font-weight: 400;
            line-height: 16px;
          }
        }
      }
    }
  }
}
</style>
