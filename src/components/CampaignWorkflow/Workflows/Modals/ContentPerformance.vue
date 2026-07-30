<template>
  <q-card flat class="app-modal-card content-performance-card">
    <!-- header -->
    <div class="app-modal-header">
      <h4 class="modal-header-text">
        Content Performance
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

    <!-- content -->
    <div class="app-modal-content">
      <!-- Word Count -->
      <div class="each-performance-section">
        <p class="content-performance-header-text">
          Word Count
        </p>

        <div class="word-analytics-grid">
          <div
            v-for="(analytics, index) in wordAnalytics"
            :key="`analytics.label-${index}`"
            class="each-word-analytic"
          >
            <p class="word-label-text">
              {{ analytics.label }}
            </p>

            <p class="number-label-text">
              {{ analytics.value }}
            </p>
          </div>
        </div>
      </div>

      <!-- Spam Score -->
      <div class="each-performance-section bordered-section">
        <p class="content-performance-header-text">
          Spam Score
        </p>

        <div class="spam-score-section">
          <SpamGuage
            :spamScore="spamScore"
            :spamWordCount="totalSpamCount"
            :spamLevelColor="spamLevelColor"
          />

          <div class="spam-detection">
            <div class="flex no-wrap items-center">
              <LocalSvgIcon
                image="spam-score"
                classes="spam-score-icon"
                :class="spamScoreClass"
              />

              <p
                class="detection-title-text"
                :style="{ color: spamLevelColor }"
              >
                {{ spamDetection.title }}
              </p>
            </div>

            <div class="detection-desc-text">
              {{ spamDetection.longDescription }}
            </div>
          </div>
        </div>
      </div>

      <!-- Spam words -->
      <div
        class="each-performance-section"
      >
        <p class="content-performance-header-text">
          Spam Words
        </p>

        <SpamWordList
          :spamWordDetails="spamWordDetails"
        />
      </div>
    </div>

    <!-- footer -->
    <div class="app-modal-footer">
      <q-btn
        no-caps
        unelevated
        v-close-popup

        color="primary"
        label="Done"
      />
    </div>
  </q-card>
</template>
<script>

// vue
import { computed, defineComponent } from 'vue';

// Components
import SpamGuage from 'components/CampaignWorkflow/Workflows/SpamGuage.vue';
import SpamWordList from 'components/CampaignWorkflow/Workflows/SpamWordList.vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers';

export default defineComponent({
  name: 'ContentPerformanc',

  components: {
    SpamGuage,
    SpamWordList,
  },

  props: {
    spamResultJson: {
      type: Object,
      default: () => {},
    },
    spamAnalysis: {
      type: Object,
      default: () => {},
    },
  },

  setup(props) {
    // computed
    const totalWordCount = computed(() => props.spamResultJson?.wordCount?.value || 0);
    const totalSpamCount = computed(() => props.spamAnalysis?.totalSpamWords || 0);
    const totalSeverityScore = computed(() => props.spamAnalysis?.totalSeverityScore || 0);

    const wordAnalytics = computed(() => {
      const analytics = [
        {
          label: 'Total Count',
          value: getNumeralAmount(totalWordCount.value),
        },
        {
          label: 'Reading Time',
          value: props.spamResultJson.readingTime?.value || '0 sec',
        },
        {
          label: 'Characters',
          value: getNumeralAmount(props.spamResultJson.characterCount?.value || 0),
        },
      ];

      return analytics;
    });

    const spamScore = computed(() => {
      if (totalWordCount.value === 0) return 0;

      // 2. Define Threshold
      // 0.15 means if 15% of the email's "value" is spam, the score is 100.
      // Lower this number (e.g., 0.10) to make the scorer STRICTER.
      // Increase this number (e.g., 0.20) to make the scorer MORE LENIENT.
      const THRESHOLD = 0.15;

      // 3. Calculate Density Ratio
      const density = totalSeverityScore.value / totalWordCount.value;

      // 4. Normalize to 0-100
      const score = (density / THRESHOLD) * 100;

      // 5. Cap at 100 (and round it)
      return Math.min(Math.round(score), 100);
    });

    const spamDetection = computed(() => {
      if (spamScore.value > 60) {
        return {
          label: 'high',
          minScore: 61,
          maxScore: 100,
          title: 'High Spam Risk',
          shortDescription: 'Very likely to be flagged by spam filters. Not safe to send.',
          longDescription: 'This email contains multiple spam-triggering patterns such as aggressive sales language, excessive links, promotional wording, or poor formatting. Sending this may severely hurt your deliverability and domain reputation.',
        };
      }

      if (spamScore.value > 30) {
        return {
          label: 'medium',
          minScore: 31,
          maxScore: 60,
          title: 'Medium Spam Risk',
          shortDescription: 'May face deliverability issues. Needs improvement.',
          longDescription: 'This email has some elements that spam filters may flag, such as sales-heavy phrasing, too many links, or unnatural formatting. It may land in promotions or spam depending on sender reputation and volume.',
        };
      }

      return {
        label: 'low',
        minScore: 0,
        maxScore: 30,
        title: 'Low Spam Risk',
        shortDescription: 'Low chance of being flagged by spam filters. Safe to send.',
        longDescription: 'This email has minimal spam-triggering patterns and follows good cold email practices. It is unlikely to be flagged by spam filters and is optimized for inbox placement.',
      };
    });

    const spamLevelColor = spamScore.value >= 75
      ? 'var(--negative-color)' // Red for high spam score
      : spamScore.value >= 40
        ? 'var(--warning-color)' // Orange for medium spam score
        : 'var(--positive-color)'; // Green for low spam score

    const spamScoreClass = computed(() => {
      if (spamScore.value >= 75) {
        return 'spam-negative';
      } if (spamScore.value >= 40) {
        return 'spam-warning';
      }
      return 'spam-positive';
    });

    const spamWordDetails = computed(() => props.spamAnalysis?.details || []);

    return {
      // computed
      wordAnalytics,
      spamScore,
      totalSpamCount,
      spamDetection,
      spamLevelColor,
      spamScoreClass,
      spamWordDetails,
    };
  },
});
</script>

<style lang="scss" scoped>
.content-performance-card {
  max-width: 600px;

  .app-modal-content {
    padding: 0px;

    .content-performance-header-text {
      color: $black;
      font-size: 16px;
      font-weight: 600;
    }

    .each-performance-section {
      width: 100%;
      padding: 24px 20px;

      // xs max
      @media (max-width: 599px) {
        padding: 16px 12px;
      }

      &.bordered-section {
        border-top: 1px solid $grey-50;
        border-bottom: 1px solid $grey-50;
      }

      .word-analytics-grid {
        width: 100%;
        max-width: 390px;
        margin-top: 12px;

        display: flex;
        flex-wrap: wrap;
        gap: 24px;

        .each-word-analytic {
          display: flex;
          gap: 20px;

          .word-label-text {
            color: $black;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            min-width: 90px;
          }

          .number-label-text {
            color: $primary;
            font-size: 14px;
            font-weight: 500;
            line-height: 20px; /* 142.857% */
            letter-spacing: 0.42px;
          }
        }
      }

      .spam-score-section {
        margin-top: 16px;
        width: 100%;

        display: flex;
        flex-wrap: wrap;
        gap: 24px;

        // lg min
        @media (min-width: $breakpoint-lg-min) {
          gap: 40px;
        }

        .spam-detection {
          width: 100%;
          max-width: 336px;

          :deep(.spam-score-icon) {
            &.spam-negative {
              @include svg-icon-fill('rect', $negative);
            }
            &.spam-warning {
              @include svg-icon-fill('rect', $warning);
            }
            &.spam-positive {
              @include svg-icon-fill('rect', $positive);
            }
          }

          .detection-title-text {
            font-size: 14px;
            font-weight: 500;
            line-height: 20px; /* 142.857% */

            margin-left: 9px;
          }

          .detection-desc-text {
            margin-top: 8px;

            color: $black;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px; /* 142.857% */
          }
        }
      }
    }
  }
}
</style>
