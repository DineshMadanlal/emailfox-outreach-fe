<template>
  <q-item
    :to="`/unibox/preferences/folder/${folderTableProps.row.id}/edit`"
    class="folder-item-mobile-view"
  >
    <!-- More Options -->
    <q-btn
      dense
      outlined
      unelevated
      @click.stop.prevent

      class="folder-action-btn"
    >
      <!-- more -->
      <LocalSvgIcon
        image="more"
      />

      <!-- Menu -->
      <FoldersMoreOptions
        :folderJson="folderTableProps.row"

        @deleteFolder="onDeleteFolder"
        @updateFolderStatus="onUpdateFolderStatus"
        @applyToExistingInbox="onApplyToExistingInbox"

        v-model="showMenu"
      />
    </q-btn>

    <div class="table-grid-row">
      <div
        v-for="column in folderTableProps.cols"
        :key="`folder-grid-${column.name}`"
        class="table-grid-each-data"
      >
        <p class="table-grid-label-text">
          {{ column.label }}
        </p>

        <!-- name -->
        <p
          class="table-grid-value-text"
          v-if="column.name === 'name'"
        >
          {{ column.value }}
        </p>

        <!-- Rule -->
        <p
          class="table-grid-value-text"
          v-if="column.name === 'rules'"
        >
          {{ rulesLength }}
          {{ $pluralize('Rule', rulesLength) }}
        </p>

        <!-- Status -->
        <p
          class="apptable-status-text"

          :class="{
            'active': folderTableProps.row.status === FOLDER_STATUS.ACTIVE,
            'inactive': folderTableProps.row.status === FOLDER_STATUS.INACTIVE,
          }"
          v-if="column.name === 'status'"
        >
          {{ folderTableProps.row.status }}
        </p>
      </div>
    </div>
  </q-item>
</template>

<script>
// lodash
import size from 'lodash/size';

// vue
import {
  defineComponent, reactive, toRefs, computed,
} from 'vue';

// Components
import FoldersMoreOptions from 'components/Menu/FoldersMoreOptions.vue';

// constants
import { FOLDER_STATUS } from 'boot/constants';

export default defineComponent({
  name: 'DomainItemMobileView',

  emits: ['deleteFolder', 'updateFolderStatus', 'applyToExistingInbox'],

  components: {
    FoldersMoreOptions,
  },

  props: {
    folderTableProps: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // state
    const state = reactive({
      showMenu: false,
    });

    // computed
    const rulesLength = computed(() => size(props.folderTableProps.row?.rules || []));

    // methods
    const onDeleteFolder = (folderJson) => {
      emit('deleteFolder', folderJson);
    };

    const onUpdateFolderStatus = (folderJson) => {
      emit('updateFolderStatus', folderJson);
    };

    const onApplyToExistingInbox = (folderJson) => {
      emit('applyToExistingInbox', folderJson);
    };

    return {
      // state
      ...toRefs(state),

      // computed
      rulesLength,

      // methods
      onDeleteFolder,
      onUpdateFolderStatus,
      onApplyToExistingInbox,

      // constants
      FOLDER_STATUS,
    };
  },
});
</script>

<style lang="scss" scoped>
.folder-item-mobile-view {
  width: 100%;
  padding: 12px;
  min-height: unset;
  border: 1px solid $grey-50;

  position: relative;

  .folder-action-btn {
    position: absolute;
    top: 2px;
    right: 8px;
    min-width: unset;
    padding: 0;
  }

  .table-grid-row {
    display: grid;
    grid-row-gap: 4px;

    .table-grid-each-data {
      display: grid;
      grid-row-gap: 2px;

      .table-grid-label-text {
        font-size: 12px;
        color: rgba($color: var(--black-rgb), $alpha: 0.54);
      }

      .table-grid-value-text {
        font-size: 13px;
        color: $black;
      }
    }
  }
}
</style>
