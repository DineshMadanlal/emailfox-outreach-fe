<template>
  <div class="analytics-tabs-wrapper">
    <div class="analytics-tabs">
      <router-link
        v-for="tab in tabs"
        :key="`analytics-tab-${tab.label}`"
        :to="tab.path"
      >
        {{ tab.label }}
      </router-link>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'AnalyticsRouteHeader',

  props: {
    campaignId: {
      type: [String, Number],
      required: true,
    },
  },

  setup(props) {
    const tabs = computed(() => [
      {
        label: 'Overview',
        path: `/outreach/campaigns/${props.campaignId}/analytics/overview`,
      },
      {
        label: 'Email',
        path: `/outreach/campaigns/${props.campaignId}/analytics/email`,
      },
      {
        label: 'LinkedIn',
        path: `/outreach/campaigns/${props.campaignId}/analytics/linkedin`,
      },
    ]);

    return {
      tabs,
    };
  },
});
</script>

<style lang="scss" scoped>
.analytics-tabs-wrapper {
  padding: 16px 20px 0;
}

.analytics-tabs {
  display: inline-flex;
  align-items: center;
  border: 1px solid $blue-grey;
  border-radius: 100px;
  padding: 3px;

  a {
    position: relative;
    padding: 7px 18px;
    border-radius: 100px;

    font-size: 14px;
    font-weight: 500;

    color: $black;
    text-decoration: none;
    transition: background 0.2s ease, color 0.2s ease;

    &.router-link-exact-active {
      color: $primary;
      background: rgba(var(--primary-rgb), 0.1);
    }
  }

  // separator between tabs
  a + a {
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      height: 16px;
      width: 1px;
      background: $grey-50;
    }
  }

  // hide separator when adjacent to the active tab
  a.router-link-exact-active + a::before,
  a.router-link-exact-active::before {
    display: none;
  }
}
</style>
