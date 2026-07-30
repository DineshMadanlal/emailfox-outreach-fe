<template>
  <q-menu
    auto-close
    v-model="computedShowMenu"
    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"
  >
    <!-- List -->
    <q-list style="min-width: 202px" class="scripts-action-list">
      <!-- Edit -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-script-action-item"
        @click="onEditScript"
      >
        <LocalSvgIcon image="edit" classes="script-menu-icon" />

        <p class="script-action-text">
          Edit
        </p>
      </q-item>

      <!-- Mark as Inactive -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-script-action-item"
        @click="onUpdateScriptStatus"
      >
        <LocalSvgIcon image="rectangle-box" classes="script-menu-icon" />

        <p class="script-action-text">
          {{ scriptStatusUpdateText }}
        </p>
      </q-item>

      <!-- Delete -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-script-action-item delete-script-item"
        @click="onDeleteScript"
      >
        <LocalSvgIcon image="delete" classes="script-menu-icon delete-icon" />

        <p class="script-action-text">
          Delete
        </p>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
// vue
import {
  computed, defineComponent,
} from 'vue';

// constants
import { SCRIPT_STATUS } from 'boot/constants';

export default defineComponent({
  name: 'CustomScriptsMoreOptions',

  emits: ['update:showMenu', 'editScript', 'deleteScript', 'updateScriptStatus'],

  props: {
    // show menu
    showMenu: {
      type: Boolean,
      default: false,
    },
    scriptJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // computed
    const computedShowMenu = computed({
      get: () => props.showMenu,
      set: (value) => {
        emit('update:showMenu', value);
      },
    });

    const scriptStatusUpdateText = computed(() => {
      const newStatus = props.scriptJson.status === SCRIPT_STATUS.ACTIVE ? 'Inactive' : 'Active';

      return `Mark as ${newStatus}`;
    });

    // methods
    const onEditScript = () => {
      emit('editScript', props.scriptJson);
    };

    const onDeleteScript = () => {
      emit('deleteScript', props.scriptJson);
    };

    const onUpdateScriptStatus = () => {
      emit('updateScriptStatus', props.scriptJson);
    };

    return {
      // computed
      computedShowMenu,
      scriptStatusUpdateText,

      // methods
      onEditScript,
      onDeleteScript,
      onUpdateScriptStatus,
    };
  },
});
</script>

<style lang="scss" scoped>
.scripts-action-list {

  .each-script-action-item {
    padding: 10px 12px;
    min-height: unset;

    .script-action-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-left: 8px;
    }

    :deep(.script-menu-icon) {
      @include svg-icon-stroke('path, circle, rect', $grey);
    }

    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
    }

    &.delete-script-item {
      &:hover {
        background-color: rgba($color: var(--negative-rgb), $alpha: 0.1);

        :deep(.script-menu-icon) {
          @include svg-icon-stroke('path, circle, rect', $negative);
        }

        .script-action-text {
          color: $negative;
        }
      }
    }
  }
}
</style>
