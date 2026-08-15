<template>
  <div class="reply-categorization-settings">
    <!-- Dialog -->
    <q-dialog
      v-model="modals.showSaveReplyCategoryModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <SaveReplyCategory
        @newReplyCategoryCreated="onNewReplyCategoryCreated"
      />
    </q-dialog>

    <!-- Header -->
    <div class="settings-section-header">
      <!-- left side -->
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          Reply Categorization
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          Categories help organize your inbox, trigger automations,
          and measure campaign performance.
        </p>
      </div>

      <!-- right side -->
      <div class="settings-header-right-side">
        <!-- Create new category -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="Create New Category"

          @click="onAddNewCategory"
        />
      </div>
    </div>

    <!-- Content -->
    <div class="settings-section-content">
      <ReplyCategoriesTable
        :key="`reply-categories-table-${categorizationTableKey}`"
      />
    </div>
  </div>
</template>

<script>
// vue
import {
  defineComponent, toRefs, reactive,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import SaveReplyCategory from 'components/ReplyCategorization/Modals/SaveReplyCategory.vue';
import ReplyCategoriesTable from 'components/ReplyCategorization/ReplyCategoriesTable.vue';

export default defineComponent({
  name: 'ReplyCategorizationSettings',

  components: {
    SaveReplyCategory,
    ReplyCategoriesTable,
  },

  setup() {
    // composables
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Reply Categorization'));

    // state
    const state = reactive({
      modals: {
        showSaveReplyCategoryModal: false,
      },

      loaders: {
        isFetchApi: false,
      },

      categorizationTableKey: 0,
      categorizationTableRef: null,
    });

    // methods
    const onAddNewCategory = () => {
      state.modals.showSaveReplyCategoryModal = true;
    };

    const onNewReplyCategoryCreated = () => {
      state.modals.showSaveReplyCategoryModal = false;

      // refresh table
      state.categorizationTableKey += 1;
    };

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,

      // methods
      onAddNewCategory,
      onNewReplyCategoryCreated,
    };
  },
});
</script>

<style lang="scss" scoped>
.reply-categorization-settings {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;

  .settings-section-header {
    border-bottom: 0px;
    padding-bottom: 0px;
  }

  .settings-section-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
}
</style>
