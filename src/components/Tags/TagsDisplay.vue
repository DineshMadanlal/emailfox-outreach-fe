<template>
  <div class="tags-display-container">
    <!-- Visible Tags -->
    <template v-if="visibleTags.length > 0">
      <div class="tags-flex-wrap">
        <PreviewTag
          v-for="tag in visibleTags"
          :key="`tag-preview-${tag.id}`"
          :name="tag.name"
          :color="tag.color"
          class="table-tag-item"
        />

        <!-- Overflow "+X more" Pill -->
        <div
          v-if="remainingTags.length > 0"
          class="overflow-tags-pill cursor-pointer"
        >
          {{ remainingTags.length }}+

          <!-- Custom White Popover with Vertical Tag Stack -->
          <q-tooltip
            anchor="top middle"
            self="bottom middle"
            :offset="[0, 8]"
            class="tags-overflow-tooltip"
          >
            <div class="tooltip-tags-column">
              <PreviewTag
                v-for="tag in remainingTags"
                :key="`tag-tooltip-${tag.id}`"
                :name="tag.name"
                :color="tag.color"
              />
            </div>
          </q-tooltip>
        </div>
      </div>
    </template>

    <!-- Empty State -->
    <span v-else class="text-grey-5">-</span>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// components
import PreviewTag from 'components/Tags/PreviewTag.vue';

// store
import { useTagsStore } from 'src/stores/tags';

export default defineComponent({
  name: 'TagsDisplay',

  components: {
    PreviewTag,
  },

  props: {
    tagIds: {
      type: Array,
      default: () => [],
    },
    maxVisible: {
      type: Number,
      default: 2,
    },
  },

  setup(props) {
    const tagsStorePinia = useTagsStore();

    // Map tag IDs array to tag objects from Pinia store
    const resolvedTags = computed(() => {
      if (!Array.isArray(props.tagIds) || props.tagIds.length === 0) {
        return [];
      }
      return tagsStorePinia.getTagsByIds(props.tagIds);
    });

    const visibleTags = computed(() => resolvedTags.value.slice(0, props.maxVisible));
    const remainingTags = computed(() => resolvedTags.value.slice(props.maxVisible));

    return {
      resolvedTags,
      visibleTags,
      remainingTags,
    };
  },
});
</script>

<style lang="scss">
.tags-overflow-tooltip {
  background-color: $white !important;
  color: $black !important;
  border: 1px solid $blue-grey !important;
  box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.12) !important;
  border-radius: 8px !important;
  padding: 8px 10px !important;

  .tooltip-tags-column {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    max-width: 260px;
    gap: 6px;
  }
}
</style>

<style lang="scss" scoped>
.tags-display-container {
  display: flex;
  align-items: center;

  .tags-flex-wrap {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    gap: 4px;
    max-width: 100%;

    .table-tag-item {
      max-width: 140px;
      overflow: hidden;

      :deep(.tag-preview-chip) {
        font-size: 12px;
        padding: 2px 8px;
        line-height: 16px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
    }

    .overflow-tags-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 2px 7px;
      border-radius: 50px;
      font-size: 11px;

      color: $black;
      border: 1px solid $grey-50;
      white-space: nowrap;

      transition: background-color 0.15s ease;
    }
  }
}
</style>
