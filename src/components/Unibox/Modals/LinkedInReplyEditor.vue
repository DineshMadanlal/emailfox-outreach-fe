<template>
  <q-card
    flat
    class="app-modal-card linkedin-reply-editor-card"
    :class="{ maximized: maximized }"
  >
    <!-- Header -->
    <div class="app-modal-header">
      <div class="header-title-column">
        <h4 class="modal-header-text">
          {{ contactDisplayName }}
        </h4>
        <div class="header-subtitle-row">
          <span
            v-if="seqName"
            class="subtitle-item"
          >
            <LocalSvgIcon
              image="campaign"
              class="subtitle-icon"
            />
            {{ seqName }}
          </span>
          <span
            v-if="seqName && linkedinDisplayUrl"
            class="subtitle-separator"
          >
            •
          </span>
          <a
            v-if="linkedinDisplayUrl"
            :href="linkedinUrl"
            target="_blank"
            class="subtitle-link"
          >
            <LocalSvgIcon
              image="linkedin-1"
              class="subtitle-icon"
            />
            {{ linkedinDisplayUrl }}
          </a>
        </div>
      </div>

      <q-space />

      <!-- Maximize / Restore Icon -->
      <q-btn
        flat
        round
        dense
        color="primary"
        class="app-primary-button"
        @click="$emit('onMaximize')"
      >
        <LocalSvgIcon
          image="maximize"
          classes="app-primary-icon"
        />
      </q-btn>

      <!-- Close Icon -->
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

    <!-- Content Dummy Placeholder -->
    <div class="linkedin-reply-editor-content">
      <div class="dummy-placeholder-box q-pa-md">
        <p class="text-weight-bold text-subtitle1">
          LinkedIn Chat Reply (Placeholder)
        </p>
        <p class="text-caption text-grey-7">
          Contact: {{ contactDisplayName }} | Sequence: {{ seqName || 'N/A' }}
        </p>
        <p class="text-caption text-grey-7">
          Active Message ID: {{ messageJson?.id || messageJson?.message_id || 'N/A' }}
        </p>
        <p class="text-caption text-grey-7">
          LinkedIn Profile: {{ linkedinUrl || 'N/A' }}
        </p>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'LinkedInReplyEditor',

  emits: ['onMaximize', 'updatePersistentStatus', 'onSuccessReply'],

  props: {
    maximized: {
      type: Boolean,
      default: false,
    },
    messageJson: {
      type: Object,
      default: () => ({}),
    },
    threadJson: {
      type: Object,
      default: () => ({}),
    },
    contactData: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props) {
    // Computed display name of contact
    const contactDisplayName = computed(() => {
      const data = props.contactData || {};
      const thread = props.threadJson || {};
      const msg = props.messageJson || {};

      if (data.first_name || data.last_name) {
        return `${data.first_name || ''} ${data.last_name || ''}`.trim();
      }
      return thread.contact_name
        || thread.name
        || msg.sender
        || 'LinkedIn Contact';
    });

    // Sequence / Campaign name
    const seqName = computed(() => (
      props.contactData?.seq_name
      || props.threadJson?.seq_name
      || ''
    ));

    // Full LinkedIn Profile URL
    const linkedinUrl = computed(() => (
      props.contactData?.linkedin_url
      || props.threadJson?.linkedin_url
      || ''
    ));

    // Formatted/Shortened LinkedIn URL display text
    const linkedinDisplayUrl = computed(() => {
      const url = linkedinUrl.value;
      if (!url) return '';
      const match = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
      return match ? `.../${match[1]}` : url;
    });

    return {
      contactDisplayName,
      seqName,
      linkedinUrl,
      linkedinDisplayUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
.linkedin-reply-editor-card {
  width: 580px;
  max-width: 95vw;
  height: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  border-radius: 8px 8px 0 0;

  &.maximized {
    width: 100vw;
    max-width: 100vw;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  .app-modal-header {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid $grey-50;

    .header-title-column {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .modal-header-text {
        font-size: 16px;
        font-weight: 600;
        color: $black;
        margin: 0;
        line-height: 20px;
      }

      .header-subtitle-row {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: $grey;

        .subtitle-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .subtitle-icon {
          width: 12px;
          height: 12px;
        }

        .subtitle-separator {
          color: $grey-400;
        }

        .subtitle-link {
          display: flex;
          align-items: center;
          gap: 4px;
          color: $grey;
          text-decoration: none;

          &:hover {
            color: $primary;
            text-decoration: underline;
          }
        }
      }
    }
  }

  .linkedin-reply-editor-content {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;

    .dummy-placeholder-box {
      border: 1px dashed $grey-300;
      border-radius: 6px;
      margin: 16px;
      background: $grey-50;
    }
  }
}
</style>
