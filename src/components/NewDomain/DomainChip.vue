<template>
  <q-item
    clickable
    v-ripple:primary

    class="domain-chip"

    :disable="!domainJson.available"
    :class="{ selected: domainJson.selected }"

    @click="onItemClick"
  >
    <!-- Tooltip -->
    <AppTooltip
      v-if="!domainJson.available"
      :content="'Domain Already Taken'"
      :offset="[10, 10]"
    />

    <p class="domain-chip-text">
      {{ domainJson.domain }}
    </p>
  </q-item>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// Components
import AppTooltip from 'components/General/AppTooltip.vue';

export default defineComponent({
  name: 'DomainChip',

  emits: ['click'],

  components: {
    AppTooltip,
  },

  props: {
    domainJson: {
      type: Object,
      required: true,
    },
  },

  setup(props, { emit }) {
    // methods
    const onItemClick = () => {
      if (props.domainJson.available) {
        emit('click');
      }
    };

    return {
      // methods
      onItemClick,
    };
  },
});
</script>

<style lang="scss" scoped>
.domain-chip {
    width: fit-content;
    padding: 8px 12px;

    border-radius: 8px;
    border: 1px solid $blue-grey;
    background: $white;

    min-height: unset;

  .domain-chip-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px;
  }

  &.selected {
    border: 1.2px solid $primary;
    background: rgba($color: var(--primary-rgb), $alpha: 0.05);

    .domain-chip-text {
      color: $primary;
      font-size: 14px;
      font-weight: 500;
      line-height: 16px;
    }
  }
}
</style>
