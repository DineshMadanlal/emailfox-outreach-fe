<template lang="">
  <div
    v-if="campaignName"
    class="unibox-campaign-pill"
  >
    <LocalSvgIcon
      image="sequence"
      class="campaign-icon"
    />

    <span
      class="campaign-text ellipsis"
      :title="campaignName"
    >
      {{ campaignName }}
    </span>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// stores
import { useUniboxStore } from 'src/stores/unibox';

export default defineComponent({
  name: 'CampaignPill',

  props: {
    seqId: {
      type: [String, Number],
      required: true,
    },
  },

  setup(props) {
    // store
    const uniboxPinia = useUniboxStore();

    // Sequence / Campaign mapped by seq_id from store
    const campaign = computed(() => {
      const { seqId } = props;

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
    return {
      // computed
      campaignName,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-campaign-pill {
  display: flex;
  align-items: center;

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
    white-space: nowrap;
    max-width: 260px;
  }
}
</style>
