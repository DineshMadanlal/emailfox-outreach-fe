<template>
  <q-menu
    auto-close
    v-model="computedShowMenu"
    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"
  >
    <!-- List -->
    <q-list style="min-width: 202px" class="folders-action-list">
      <!-- Edit -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-folder-action-item"
        @click="onEditFolder"
      >
        <LocalSvgIcon image="edit" classes="folder-menu-icon" />

        <p class="folder-action-text">
          Edit
        </p>
      </q-item>

      <!-- Apply to Existing Inbox -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-folder-action-item"
        @click="onApplytoExistingInbox"
      >
        <LocalSvgIcon image="rectangle-box" classes="folder-menu-icon" />

        <p class="folder-action-text">
          Apply to Existing Inbox
        </p>
      </q-item>

      <!-- Duplicate -->
      <!-- <q-item
        v-ripple
        clickable
        class="flex items-center each-folder-action-item"
        @click="onDuplicateFolder"
      >
        <LocalSvgIcon image="duplicate" classes="folder-menu-icon" />

        <p class="folder-action-text">
          Duplicate
        </p>
      </q-item> -->

      <!-- Mark as Inactive -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-folder-action-item"
        @click="onUpdateFolderStatus"
      >
        <LocalSvgIcon image="rectangle-box" classes="folder-menu-icon" />

        <p class="folder-action-text">
          {{ folderStatusUpdateText }}
        </p>
      </q-item>

      <!-- Delete -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-folder-action-item delete-folder-item"
        @click="onDeleteFolder"
      >
        <LocalSvgIcon image="delete" classes="folder-menu-icon delete-icon" />

        <p class="folder-action-text">
          Delete
        </p>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// vue router
import { useRouter } from 'vue-router';

// constants
import { FOLDER_STATUS } from 'boot/constants';

export default defineComponent({
  name: 'FoldersMoreOptions',

  emits: ['update:showMenu', 'deleteFolder', 'updateFolderStatus', 'applyToExistingInbox'],

  props: {
    // show menu
    showMenu: {
      type: Boolean,
      default: false,
    },
    folderJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // router
    const $router = useRouter();

    // computed
    const computedShowMenu = computed({
      get: () => props.showMenu,
      set: (value) => {
        emit('update:showMenu', value);
      },
    });

    const folderStatusUpdateText = computed(() => {
      const newStatus = props.folderJson.status === FOLDER_STATUS.ACTIVE ? 'Inactive' : 'Active';

      return `Mark as ${newStatus}`;
    });

    // methods
    const onEditFolder = () => {
      $router.push(`/unibox/preferences/folder/${props.folderJson.id}/edit`);
    };

    const onDeleteFolder = () => {
      emit('deleteFolder', props.folderJson);
    };

    // const onDuplicateFolder = () => {
    //   emit('duplicateFolder', props.folderJson);
    // };

    const onUpdateFolderStatus = () => {
      emit('updateFolderStatus', props.folderJson);
    };

    const onApplytoExistingInbox = () => {
      emit('applyToExistingInbox', props.folderJson);
    };

    return {
      // computed
      computedShowMenu,
      folderStatusUpdateText,

      // methods
      onEditFolder,
      onDeleteFolder,
      // onDuplicateFolder,
      onUpdateFolderStatus,
      onApplytoExistingInbox,
    };
  },
});
</script>

<style lang="scss" scoped>
.folders-action-list {

  .each-folder-action-item {
    padding: 10px 12px;
    min-height: unset;

    .folder-action-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-left: 8px;
    }

    :deep(.folder-menu-icon) {
      @include svg-icon-stroke('path, circle, rect', $grey);
    }

    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
    }

    &.delete-folder-item {
      &:hover {
        background-color: rgba($color: var(--negative-rgb), $alpha: 0.1);

        :deep(.folder-menu-icon) {
          @include svg-icon-stroke('path, circle, rect', $negative);
        }

        .folder-action-text {
          color: $negative;
        }
      }
    }
  }
}
</style>
