<template>
  <div
    v-if="hasData"
    class="warmup-tick-bars-container"
    :style="{ gap: `${gap}px`, height: `${height}px` }"
  >
    <div
      v-for="(bar, index) in bars"
      :key="`warmup-tick-${index}`"
      class="tick-bar"
      :class="{
        'tick-bar--active': bar.hasWarmup,
        'tick-bar--inactive': !bar.hasWarmup,
      }"
      :style="{
        width: `${barWidth}px`,
        height: `${height}px`,
        background: bar.background,
      }"
    >
      <AppTooltip
        v-if="showTooltip"
        anchor="top middle"
        self="bottom middle"
        :content="bar.tooltipContent"
      />
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// utils
import { formatDate1 } from 'src/utils/dates';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

export default defineComponent({
  name: 'WarmupTickBars',

  components: {
    AppTooltip,
  },

  props: {
    data: {
      type: [Object, Array],
      default: () => null,
    },
    barCount: {
      type: Number,
      default: 7,
    },
    height: {
      type: Number,
      default: 16,
    },
    barWidth: {
      type: Number,
      default: 4,
    },
    gap: {
      type: Number,
      default: 3,
    },
    showTooltip: {
      type: Boolean,
      default: true,
    },
    alwaysShow: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    // Normalizes input to an array of day records
    const normalizedTimeline = computed(() => {
      if (!props.data) return [];

      // 1. If already an array
      if (Array.isArray(props.data)) {
        return props.data;
      }

      // 2. If response format with warmup_growth_timeline or inbox_vs_spam_placement_timeline
      if (props.data && typeof props.data === 'object') {
        const placement = Array.isArray(props.data.inbox_vs_spam_placement_timeline)
          ? props.data.inbox_vs_spam_placement_timeline
          : [];
        const growth = Array.isArray(props.data.warmup_growth_timeline)
          ? props.data.warmup_growth_timeline
          : [];

        if (placement.length > 0) {
          return placement.map((p) => ({
            date: p.date,
            inbox: Number(p.inbox || 0),
            spam: Number(p.spam || 0),
          }));
        }

        if (growth.length > 0) {
          return growth.map((g) => ({
            date: g.date,
            inbox: Number(g.inbox || 0),
            spam: Number(g.spam || 0),
          }));
        }

        if (Array.isArray(props.data.timeline)) {
          return props.data.timeline;
        }
      }

      return [];
    });

    // Extract the latest N days (chronologically sorted)
    const latestDays = computed(() => {
      const list = normalizedTimeline.value;
      if (!list || list.length === 0) return [];

      const sorted = [...list].sort((a, b) => {
        if (a.date && b.date) {
          return new Date(a.date) - new Date(b.date);
        }
        return 0;
      });

      return sorted.slice(-props.barCount);
    });

    // Check if there are any real non-zero warmup values in this window
    // Hide if no values, unless alwaysShow is set to true
    const hasData = computed(() => {
      if (props.alwaysShow) return true;

      const items = latestDays.value;
      if (!items || items.length === 0) return false;

      return items.some((item) => {
        if (typeof item === 'number') return item > 0;
        const inbox = Number(item.inbox || 0);
        const spam = Number(item.spam || 0);
        return inbox > 0 || spam > 0;
      });
    });

    // Build exactly N bars (e.g. 7 bars)
    const bars = computed(() => {
      if (!hasData.value) return [];

      const items = latestDays.value || [];
      const count = props.barCount;
      const paddedItems = [];

      // If items is completely empty and alwaysShow is true
      if (items.length === 0) {
        const today = new Date();
        for (let i = 0; i < count; i += 1) {
          const d = new Date(today);
          d.setDate(today.getDate() - (count - 1 - i));
          paddedItems.push({
            isPadding: true,
            hasWarmup: false,
            date: d.toISOString().split('T')[0],
          });
        }
      } else {
        // If fewer than barCount days available, pad at the front with inactive days
        if (items.length < count) {
          const diff = count - items.length;
          const firstDate = items[0]?.date ? new Date(items[0].date) : new Date();
          for (let i = 0; i < diff; i += 1) {
            const d = new Date(firstDate);
            d.setDate(firstDate.getDate() - (diff - i));
            paddedItems.push({
              isPadding: true,
              hasWarmup: false,
              date: d.toISOString().split('T')[0],
            });
          }
        }
        paddedItems.push(...items);
      }

      return paddedItems.map((item, idx) => {
        if (item.isPadding) {
          const dateStr = item.date ? formatDate1(item.date) : `Day ${idx + 1}`;
          return {
            hasWarmup: false,
            background: 'var(--grey-50)',
            tooltipContent: `<div class="text-weight-medium">${dateStr}</div><div>No warmup activity</div>`,
          };
        }

        const inbox = Number(item.inbox || 0);
        const spam = Number(item.spam || 0);
        const hasWarmup = inbox > 0 || spam > 0;

        // Background determination:
        // If both inbox and spam exist, show micro
        // stacked bar (red on top for spam, primary on bottom for inbox)
        let background = 'var(--grey-50)';
        if (hasWarmup) {
          if (spam > 0 && inbox > 0) {
            const total = inbox + spam;
            const rawSpamPct = (spam / total) * 100;
            // Clamp between 20% and 80% so both colors remain visible in 13px height
            const spamPct = Math.min(80, Math.max(20, Math.round(rawSpamPct)));
            background = `linear-gradient(to bottom, var(--negative-color) 0%, var(--negative-color) ${spamPct}%, var(--primary-color) ${spamPct}%, var(--primary-color) 100%)`;
          } else if (spam > 0) {
            background = 'var(--negative-color)';
          } else {
            background = 'var(--primary-color)';
          }
        }

        const dateStr = item.date ? formatDate1(item.date) : `Day ${idx + 1}`;
        const placementStr = hasWarmup
          ? `<div>Inbox: ${inbox}</div><div>Spam: ${spam}</div>`
          : '<div>No warmup activity</div>';

        const tooltipContent = `<div class="text-weight-medium">${dateStr}</div>${placementStr}`;

        return {
          hasWarmup,
          background,
          tooltipContent,
        };
      });
    });

    return {
      // components
      bars,
      hasData,
    };
  },
});
</script>

<style lang="scss" scoped>
.warmup-tick-bars-container {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  vertical-align: middle;

  .tick-bar {
    border-radius: 0;
    cursor: default;
    transition: opacity 0.15s ease, transform 0.15s ease;

    &:hover {
      opacity: 0.85;
      transform: scaleY(1.15);
    }

    &.tick-bar--active {
      box-shadow: 0 0 1px rgba(0, 0, 0, 0.15);
    }
  }
}
</style>
