<template>
  <!-- Email List Item Component -->
  <div
    class="unibox-email-list-item"

    @click="$emit('click', emailJson)"
  >
    <!-- Left Active Selection Bar (for Compact Mode) -->
    <div
      class="active-indicator-bar"
      :class="{
        active: compactView && isActive
      }"
    />

    <!-- Container -->
    <div
      class="unibox-email-list-container"
      :class="{
        'is-active': isActive,
        'is-compact': compactView,
      }"
    >
      <!-- Selection Checkbox (Full-width mode only) -->
      <div class="item-checkbox-wrapper">
        <q-checkbox
          dense
          color="primary"
          class="app-checkbox"
          :model-value="isSelected"
          @update:model-value="$emit('toggle-select', emailJson)"

          @click.stop.prevent
        />
      </div>

      <!-- Star / Important Button (Full-width mode only) -->
      <div
        v-if="!compactView"
        class="item-star-wrapper"
      >
        <q-btn
          flat
          round
          dense

          size="sm"
          class="star-action-btn"
          :class="{ 'is-starred': isStarred }"

          @click.stop.prevent="$emit('toggle-star', emailJson)"
        >
          <LocalSvgIcon
            image="star"
            class="star-icon"
          />
          <AppTooltip :content="isStarred ? 'Unstar' : 'Star as important'" />
        </q-btn>
      </div>

      <!-- Contact Avatar / Initial Badge -->
      <div
        class="item-avatar-box"
        :style="avatarPaletteStyle"
      >
        <q-img
          v-if="profilePicUrl"
          no-spinner
          :src="profilePicUrl"
          class="avatar-image"
        >
          <template v-slot:error>
            <span class="avatar-initial-text">{{ contactInitial }}</span>
          </template>
        </q-img>

        <span
          v-else
          class="avatar-initial-text"
        >
          {{ contactInitial }}
        </span>
      </div>

      <!-- ========================================================== -->
      <!-- COMPACT CONTENT LAYOUT (compactView)                       -->
      <!-- ========================================================== -->
      <div
        v-if="compactView"
        class="item-compact-content-body ellipsis"
      >
        <!-- Row 1: Channel Icon + Email + Time -->
        <div class="compact-header-row">
          <div class="compact-email-wrapper">
            <!-- Email -->
            <LocalSvgIcon
              v-if="hasEmailChannel"

              image="mail"
              class="channel-icon"
            />

            <!-- LinkedIn -->
            <LocalSvgIcon
              v-if="hasLinkedinChannel"
              image="linkedin"
              class="channel-icon"
            />

            <!-- Contact Email -->
            <span
              class="contact-name-text ellipsis"
              :class="{ 'text-unread': isUnread }"
            >
              {{ contactEmail }}
            </span>
          </div>

          <span class="timestamp-text">
            {{ formattedTimestamp }}
          </span>
        </div>

        <!-- Row 2: Message Preview with unread dot -->
        <div class="subject-snippet-line flex items-center no-wrap">
          <span
            v-if="isUnread"
            class="unread-blue-dot"
          />
          <p
            class="subject-snippet-text ellipsis"
            :class="{ 'text-unread': isUnread }"
          >
            {{ messagePreview }}
          </p>
        </div>

        <!-- Row 3: Badges (Category + Campaign) -->
        <div
          v-if="replyCategoryName || campaignName"
          class="compact-badges-row"
        >
          <!-- Category pill -->
          <div
            v-if="replyCategoryName"
            class="pill-reply-category flex items-center no-wrap"
          >
            <span
              class="category-status-dot"
              :style="{ backgroundColor: replyCategoryDotColor }"
            />
            <span class="category-text ellipsis">{{ replyCategoryName }}</span>
          </div>

          <!-- Campaign pill -->
          <div
            v-if="campaignName"
            class="pill-campaign-badge flex items-center no-wrap"
          >
            <LocalSvgIcon
              image="sequence"
              class="campaign-icon"
            />
            <span class="campaign-text ellipsis">{{ campaignName }}</span>
          </div>
        </div>
      </div>

      <!-- ========================================================== -->
      <!-- FULL-WIDTH CONTENT LAYOUT (!compactView)                   -->
      <!-- ========================================================== -->
      <div
        v-else
        class="item-full-content-body"
      >
        <div class="full-content-row">
          <!-- Left details: Contact Email & Latest Message Preview -->
          <div class="sender-subject-column">
            <!-- Line 1: Channel Icon(s) + Contact Email -->
            <div class="contact-header-line">
              <!-- Email channel icon -->
              <LocalSvgIcon
                v-if="hasEmailChannel"

                image="mail"
                class="channel-icon"
              />

              <!-- LinkedIn channel icon -->
              <LocalSvgIcon
                v-if="hasLinkedinChannel"

                image="linkedin"
                class="channel-icon"
              />

              <!-- Contact Email -->
              <span
                class="contact-name-text ellipsis"
                :class="{ 'text-unread': isUnread }"
              >
                {{ contactEmail }}
              </span>
            </div>

            <!-- Line 2: Blue dot (if unread) + Latest Message Preview -->
            <div class="subject-snippet-line">
              <span
                v-if="isUnread"
                class="unread-blue-dot"
              />

              <div
                class="subject-snippet-text ellipsis"
                :class="{ 'text-unread': isUnread }"

                :title="messagePreview"
              >
                {{ messagePreview }}
              </div>

            </div>
          </div>

          <!-- Right metadata: AI Pill + Reply Category + Campaign + Time -->
          <div class="item-metadata-pills-row">
            <!-- AI Categorized Pill -->
            <div
              v-if="isAiCategorized"
              class="pill-ai-categorized flex items-center no-wrap"
            >
              <LocalSvgIcon
                image="stars"
                class="ai-stars-icon"
              />
              <span class="ai-text">AI Categorized</span>
            </div>

            <!-- Reply Category Sentiment Pill -->
            <div
              v-if="replyCategoryName"
              class="pill-reply-category flex items-center no-wrap"
            >
              <span
                class="category-status-dot"
                :style="{ backgroundColor: replyCategoryDotColor }"
              />
              <span class="category-text ellipsis">{{ replyCategoryName }}</span>
            </div>

            <!-- Campaign Badge -->
            <div
              v-if="campaignName"
              class="pill-campaign-badge flex items-center no-wrap"
            >
              <LocalSvgIcon
                image="sequence"
                class="campaign-icon"
              />
              <span class="campaign-text ellipsis">{{ campaignName }}</span>
            </div>

            <!-- Timestamp -->
            <span class="timestamp-text">
              {{ formattedTimestamp }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

// utils
import { formateDateInAgo } from 'src/utils/dates';
import { getGravatarUrl } from 'src/utils/skyboxApi';

// stores
import { useUniboxStore } from 'src/stores/unibox';

// Brand Colors
import { getBrandColorByName } from 'src/utils/quasarHelpers';

// constants
import { REPLY_SENTIMENT } from 'boot/campaign-constants';
import { UNIBOX_CHANNEL_TYPE } from 'boot/unibox-constants';

// Deterministic pastel color palettes for avatar boxes
const AVATAR_COLOR_PALETTES = [
  { bg: '#EBF5FF', color: '#2563EB' }, // Blue
  { bg: '#FFF4E6', color: '#D97706' }, // Amber / Peach
  { bg: '#E8F8F0', color: '#059669' }, // Emerald / Mint
  { bg: '#F3E8FF', color: '#7C3AED' }, // Purple
  { bg: '#FFE4E6', color: '#E11D48' }, // Rose
];

export default defineComponent({
  name: 'UniboxEmailListItem',

  components: {
    AppTooltip,
  },

  emits: ['click', 'toggle-star', 'toggle-select'],

  props: {
    emailJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    compactView: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const uniboxPinia = useUniboxStore();

    // Unread state
    const isUnread = computed(() => {
      const e = props.emailJson;

      return !e.is_read;
    });

    // Starred / Important state
    const isStarred = computed(() => !!props.emailJson.is_important);

    // AI Categorized state
    const isAiCategorized = computed(() => {
      const e = props.emailJson;
      return !!(e.is_ai_categorized || e.ai_categorized);
    });

    // Contact Email (Primary identifier)
    const contactEmail = computed(() => {
      const e = props.emailJson;
      return e.contact_email
        || e.sender
        || 'Unknown';
    });

    // Contact initial letter (Derived from contact_email)
    const contactInitial = computed(() => {
      const em = contactEmail.value.trim();
      return em ? em.charAt(0).toUpperCase() : 'U';
    });

    // Deterministic avatar style palette based on contactEmail
    const avatarPaletteStyle = computed(() => {
      const str = contactEmail.value || 'A';
      let charCodeSum = 0;
      for (let i = 0; i < str.length; i += 1) {
        charCodeSum += str.charCodeAt(i);
      }
      const palette = AVATAR_COLOR_PALETTES[charCodeSum % AVATAR_COLOR_PALETTES.length];
      return {
        backgroundColor: palette.bg,
        color: palette.color,
      };
    });

    // Profile picture URL (Gravatar fallback)
    const profilePicUrl = computed(() => {
      if (contactEmail.value) {
        return getGravatarUrl(contactEmail.value);
      }
      return null;
    });

    // Channel types
    const hasEmailChannel = computed(() => {
      const e = props.emailJson;
      if (e.channels && Array.isArray(e.channels)) {
        return e.channels.includes(UNIBOX_CHANNEL_TYPE.EMAIL);
      }

      // Email Channel
      return e.channel === UNIBOX_CHANNEL_TYPE.EMAIL
      || e.channel === UNIBOX_CHANNEL_TYPE.MULTI_CHANNEL;
    });

    const hasLinkedinChannel = computed(() => {
      const e = props.emailJson;
      if (e.channels && Array.isArray(e.channels)) {
        return e.channels.includes(UNIBOX_CHANNEL_TYPE.LINKEDIN);
      }

      // has linkedin channel
      return (
        e.channel === UNIBOX_CHANNEL_TYPE.LINKEDIN
        || e.channel === UNIBOX_CHANNEL_TYPE.MULTI_CHANNEL
      );
    });

    // Latest Message Preview (preferred over subject)
    const messagePreview = computed(() => {
      const e = props.emailJson;
      return e.latest_message_preview
        || e.latest_subject;
    });

    // Sequence / Campaign mapped by seq_id from store
    const campaign = computed(() => {
      const seqId = props.emailJson.seq_id;

      if (!seqId) return null;
      return uniboxPinia.getCampaignsList.find(
        (camp) => camp.id === seqId,
      ) || null;
    });

    const campaignName = computed(() => {
      if (campaign.value) {
        return campaign.value.name || '';
      }

      return '';
    });

    // Reply Category mapped by reply_category_id from store
    const replyCategory = computed(() => {
      //
      const categoryId = props.emailJson.reply_category_id;

      if (!categoryId) return null;
      return uniboxPinia.getReplyCategoriesList.find(
        (cat) => cat.id === categoryId,
      ) || null;
    });

    const replyCategoryName = computed(() => {
      if (replyCategory.value) {
        return replyCategory.value.name || '';
      }

      return '';
    });

    // Dot color for reply category
    const replyCategoryDotColor = computed(() => {
      if (replyCategory.value?.sentiment === REPLY_SENTIMENT.Positive.value) {
        return getBrandColorByName('positive');
      }
      if (replyCategory.value?.sentiment === REPLY_SENTIMENT.Neutral.value) {
        return getBrandColorByName('warning');
      }
      if (replyCategory.value?.sentiment === REPLY_SENTIMENT.Negative.value) {
        return getBrandColorByName('negative');
      }

      return getBrandColorByName('primary');
    });

    // Formatted timestamp
    const formattedTimestamp = computed(() => {
      const e = props.emailJson;
      const rawDate = e.latest_time;
      if (!rawDate) return '';

      return formateDateInAgo(rawDate);
    });

    return {
      // computed
      isUnread,
      isStarred,
      contactEmail,
      campaignName,
      contactInitial,
      profilePicUrl,
      messagePreview,
      hasEmailChannel,
      isAiCategorized,
      replyCategoryName,
      avatarPaletteStyle,
      formattedTimestamp,
      hasLinkedinChannel,
      replyCategoryDotColor,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-email-list-item {
  width: 100%;
  max-width: 100%;
  padding: 4px;

  position: relative;
  background-color: $white;
  border-bottom: 1px solid $grey-50;
  transition: background-color 0.15s ease;

  display: flex;

  cursor: pointer;
  align-items: center;

  // sm max
  @media (max-width: $breakpoint-sm-max) {
    .item-checkbox-wrapper,
    .item-star-wrapper {
      margin-right: 2px;
    }

    .item-avatar-box {
      margin-right: 10px;
    }
  }

  // Active indicator bar
  .active-indicator-bar {
    display: none;
    width: 4px;
    height: 52px;
    background-color: $primary;
    border-radius: 0 8px 8px 0;

    position: absolute;
    left: 4px;

    transition: display 0.15s ease;

    &.active {
      display: unset;
    }
  }

  .unibox-email-list-container {
    width: 100%;
    display: flex;
    border-radius: 6px;
    padding: 8px 12px;

    //
    &.is-active {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
    }

    //
    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.05);
    }

    // Compact mode layout overrides
    &.is-compact {
      min-height: 90px;
      align-items: flex-start;

      .item-avatar-box {
        margin-right: 10px;
        margin-top: 2px;
      }

      .item-compact-content-body {
        width: 100%;
      }

      .compact-header-row {
        width: 100%;
        margin-bottom: 2px;
        min-width: 0;

        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .compact-email-wrapper {
        min-width: 0;
        display: flex;
        align-items: center;

        gap: 6px;
      }

      .contact-name-text {
        font-size: 13px;
        font-weight: 500;
        color: $grey;

        max-width: 140px;
      }

      .subject-snippet-line {
        margin-top: 3px;
        gap: 6px;
        min-width: 0;

        .unread-blue-dot {
          width: 6px;
          height: 6px;
          min-width: 6px;
          min-height: 6px;
          border-radius: 50%;
          background-color: $primary;
          flex-shrink: 0;
        }

        .subject-snippet-text {
          font-size: 12px;
          line-height: 16px;
          width: 270px;
        }
      }

      .compact-badges-row {
        gap: 8px;
        margin-top: 12px;
        flex-wrap: wrap;
        display: flex;
        align-items: center;

        .pill-reply-category,
        .pill-campaign-badge {
          .category-text,
          .campaign-text {
            max-width: 120px;
            font-size: 11px;
          }
        }
      }
    }

    // Full content body (visible when not in compact view)
    .item-full-content-body {
      width: 100%;

      .full-content-row {
        width: 100%;
        gap: 12px;

        display: flex;
        align-items: center;
        justify-content: space-between;

        .sender-subject-column {
          overflow: hidden;

          .contact-header-line {
            display: flex;
            gap: 6px;
            align-items: center;

            .contact-name-text {
              font-size: 14px;
              font-weight: 500;
              color: $grey;

              &.text-unread {
                color: $primary;
              }
            }
          }
        }

        .subject-snippet-line {
          margin-top: 4px;
          gap: 6px;
          display: flex;
          flex-wrap: nowrap;
          align-items: center;

          .unread-blue-dot {
            width: 6px;
            height: 6px;
            min-width: 6px;
            min-height: 6px;
            border-radius: 50%;
            background-color: $primary;
            flex-shrink: 0;
          }

          .subject-snippet-text {
            font-size: 13px;
            color: $grey;
            width: 600px;

            &.text-unread {
              color: $black;
              font-weight: 500;
            }
          }
        }

        .item-metadata-pills-row {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 8px;

          .timestamp-text {
            margin-left: auto;
            font-size: 13px;
            color: $grey;
          }

          @media (max-width: $breakpoint-md-max) {
            width: 100%;
            flex-wrap: wrap;
            gap: 6px;
            margin-top: 2px;
          }
        }

        @media (max-width: $breakpoint-md-max) {
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
        }
      }
    }
  }

  // checkbox
  .item-checkbox-wrapper {
    margin-right: 4px;
    flex-shrink: 0;

    position: relative;
    top: 2px;
  }

  // star important
  .item-star-wrapper {
    margin-right: 4px;
    flex-shrink: 0;

    .star-action-btn {
      :deep(.star-icon) {
        width: 16px;
        height: 16px;
        @include svg-icon-stroke('path, circle, rect', $grey-200);
      }

      &.is-starred {
        :deep(.star-icon) {
          @include svg-icon-fill('path', #F59E0B);
          @include svg-icon-stroke('path, circle, rect', #F59E0B);
        }
      }
    }
  }

  // avatar
  .item-avatar-box {
    width: 32px;
    height: 32px;
    min-width: 32px;
    min-height: 32px;

    border-radius: 6px;
    margin-right: 14px;
    flex-shrink: 0;

    :deep(.q-img__content) {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 6px;
    }

    .avatar-initial-text {
      font-size: 14px;
    }
  }

  // Metadata pills
  .pill-ai-categorized {
    padding: 4px 10px;
    border-radius: 50px;
    background: #EFF6FF;
    border: 1px solid #DBEAFE;
    gap: 5px;
    flex-shrink: 0;

    .ai-stars-icon {
      width: 13px;
      height: 13px;
      @include svg-icon-fill('path', #3B82F6);
    }

    .ai-text {
      font-size: 12px;
      font-weight: 500;
      color: #1D4ED8;
      white-space: nowrap;
    }
  }

  .pill-reply-category {
    padding: 2px 8px;
    border-radius: 34px;
    background: $white;
    border: 1px solid $grey-50;
    gap: 6px;
    flex-shrink: 0;

    .category-status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .category-text {
      font-size: 13px;
      color: $black;
      max-width: 140px;
      white-space: nowrap;
    }
  }

  .pill-campaign-badge {
    padding: 2px 8px;
    border-radius: 34px;
    background: $white;
    border: 1px solid $grey-50;
    gap: 6px;
    flex-shrink: 0;

    :deep(.campaign-icon) {
      width: 13px;
      height: 13px;
      @include svg-icon-stroke('path, circle, rect', $grey);
    }

    .campaign-text {
      font-size: 13px;
      font-weight: 400;
      color: $grey;
      max-width: 160px;
      white-space: nowrap;
    }
  }

  .timestamp-text {
    font-size: 13px;
    margin-left: 8px;
    white-space: nowrap;
    color: $grey;
  }
}
</style>
