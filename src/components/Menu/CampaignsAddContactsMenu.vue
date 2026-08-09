<template>
  <!-- LIST -->
  <q-menu
    auto-close

    :offset="[0, 10]"

    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"
  >
    <q-list
      style="min-width: 196px"
      class="more-action-list"
    >
      <q-item
        clickable
        :class="`${action.class || ''} more-action-item`"

        v-for="action in moreActions"
        :key="`each-more-action-${action.emitValue}`"

        @click="$emit(action.emitValue)"
      >
        <div class="flex no-wrap items-center">
          <LocalSvgIcon
            :image="action.icon"
          />

          <div class="more-action-text">
            {{ action.label }}
          </div>
        </div>
      </q-item>
    </q-list>
  </q-menu>
</template>
<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'CampaignsAddContactsMenu',

  emits: [
    'onUploadContacts',
    'onMapListsToCampaign',
  ],

  setup() {
    const moreActions = computed(() => {
      const actions = [
        {
          icon: 'folder',
          label: 'Map List',
          emitValue: 'onMapListsToCampaign',
        },
        {
          icon: 'download',
          label: 'Upload New CSV',
          emitValue: 'onUploadContacts',
        },
      ];

      return actions;
    });

    return {
      moreActions,
    };
  },
});
</script>

<style lang="scss" scoped>
.more-action-list {
  display: flex;
  flex-direction: column;
  gap: 0.5px;

  border-radius: 6px;

  .more-action-item {
    padding: 8px 12px;
    min-height: unset !important;

    .more-action-text {
      font-size: 14px;
      color: $black;

      margin-left: 8px;
    }

    &:hover {
      background: rgba(var(--primary-rgb), 0.1);
    }

    &.negative-action {
      .more-action-text {
        color: $negative;
      }

      &:hover {
        background: rgba(var(--negative-rgb), 0.1);
      }
    }
  }
}
</style>
