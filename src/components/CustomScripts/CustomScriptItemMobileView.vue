<template>
  <q-item
    class="custom-script-item-mobile-view"
  >
    <!-- More Options -->
    <q-btn
      dense
      outlined
      unelevated
      @click.stop.prevent

      class="script-action-btn"
    >
      <!-- more -->
      <LocalSvgIcon
        image="more"
        classes="script-menu-icon"
      />

      <!-- Menu -->
      <CustomScriptsMoreOptions
        :scriptJson="scriptTableProps.row"

        @editScript="onEditScript"
        @deleteScript="onDeleteScript"
        @updateScriptStatus="onUpdateScriptStatus"

        v-model="showMenu"
      />
    </q-btn>

    <div class="table-grid-row">
      <div
        v-for="column in scriptTableProps.cols"
        :key="`custom-script-grid-${column.name}`"
        class="table-grid-each-data"
      >
        <p class="table-grid-label-text">
          {{ column.label }}
        </p>

        <!-- name -->
        <div
          v-if="column.name === 'name'"
          class="flex no-wrap items-center"
        >
          <LocalSvgIcon
            image="scripts"
            class="script-icon"
          />

          <p
            class="script-label-text"
            :class="scriptTableProps.row.status === SCRIPT_STATUS.INACTIVE
              ? 'inactive-script-text' : ''"
          >
            {{ scriptTableProps.row.name }}
          </p>
        </div>

        <!-- placement -->
        <p
          class="script-label-text"
          v-if="column.name === 'placement'"
          :class="scriptTableProps.row.status === SCRIPT_STATUS.INACTIVE
            ? 'inactive-script-text' : ''"
        >
          {{ scriptTableProps.row.placement }}
        </p>

        <!-- script -->
        <p
          class="script-text ellipsis"
          v-if="column.name === 'script'"
        >
          {{ scriptTableProps.row.script }}
        </p>

        <!-- status -->
        <p
          class="apptable-status-text"
          v-if="column.name === 'status'"
          :class="scriptTableProps.row.status === SCRIPT_STATUS.INACTIVE ? 'inactive' : 'active'"
        >
          {{ scriptTableProps.row.status }}
        </p>
      </div>
    </div>
  </q-item>
</template>
<script>
// vue
import { defineComponent } from 'vue';

// Components
import CustomScriptsMoreOptions from 'components/Menu/CustomScriptsMoreOptions.vue';

// constants
import { SCRIPT_STATUS } from 'boot/constants';

export default defineComponent({
  name: 'CustomScriptItemMobileView',

  emits: ['editScript', 'deleteScript', 'updateScriptStatus'],

  components: {
    CustomScriptsMoreOptions,
  },

  props: {
    scriptTableProps: {
      type: Object,
      required: true,
    },
  },

  setup(_, { emit }) {
    // methods
    const onEditScript = (scriptJson) => {
      emit('editScript', scriptJson);
    };

    const onDeleteScript = (scriptJson) => {
      emit('deleteScript', scriptJson);
    };

    const onUpdateScriptStatus = (scriptJson) => {
      emit('updateScriptStatus', scriptJson);
    };

    return {
      // methods
      onEditScript,
      onDeleteScript,
      onUpdateScriptStatus,

      // constants
      SCRIPT_STATUS,
    };
  },
});
</script>

<style lang="scss" scoped>
.custom-script-item-mobile-view {
  width: 100%;
  padding: 12px;
  min-height: unset;
  border: 1px solid $grey-50;

  .table-grid-row {
    display: grid;
    gap: 12px;
  }

  .script-action-btn {
    position: absolute;
    top: 2px;
    right: 8px;
    min-width: unset;
    padding: 0;
  }

  .table-grid-label-text {
    font-size: 12px;
    color: rgba($color: var(--black-rgb), $alpha: 0.54);
  }
}
</style>
