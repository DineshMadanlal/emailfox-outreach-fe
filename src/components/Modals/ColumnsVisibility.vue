<template>
  <q-card flat class="column-visibility-card app-modal-card">
    <!-- Header -->
    <div class="app-modal-header">
      <!-- header text -->
      <h4 class="modal-header-text">
        Column Customizations
      </h4>

      <q-space />

      <!-- Close -->
      <q-btn
        flat
        round
        dense
        v-close-popup

        color="negative"
        class="app-negative-button"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />
      </q-btn>
    </div>

    <!-- Content -->
    <div class="app-modal-content hide-scrollbar">
      <AppSearchInput
        v-model="searchText"

        placeholder="Search column"
      />

      <p class="selection-info-text">
        Select the columns you want to see in the {{ sourceType }} table.
      </p>

      <!-- Select All Checkbox -->
      <q-checkbox
        dense

        :model-value="areAllColumnsSelected"

        color="primary"
        label="Select All"
        class="app-checkbox"

        :disable="filteredDynamicColumns?.length === 0"

        @update:model-value="toggleSelectAll"
      />

      <div
        class="contacts-columns-grid"
      >
        <!-- Base Columns -->
        <q-checkbox
          dense
          disable

          color="primary"
          class="app-checkbox"

          :val="col.name"
          :label="col.label"
          :model-value="true"

          v-for="col in baseColumns"
          :key="`base-col-${col.name}`"
        />

        <!-- Dynamic Columns -->
        <q-checkbox
          dense

          color="primary"
          class="app-checkbox"

          :val="col.name"
          :label="col.label"
          v-model="computedVisibleColumns"

          v-for="col in filteredDynamicColumns"
          :key="`dynamic-col-${col.name}`"
        />
      </div>
    </div>

    <!-- Footer -->
    <div class="app-modal-footer">
      <!-- Done -->
      <q-btn
        no-caps
        unelevated
        v-close-popup

        label="Done"
        color="primary"
      />
    </div>
  </q-card>
</template>

<script>
// lodash
import size from 'lodash/size';
import debounce from 'lodash/debounce';

// vue
import {
  defineComponent, computed, reactive, toRefs, watch, onUnmounted,
} from 'vue';

// components
import AppSearchInput from 'components/Input/AppSearchInput.vue';

export default defineComponent({
  name: 'ColumnsVisibility',

  emits: ['update:visibleColumns'],

  components: {
    AppSearchInput,
  },

  props: {
    visibleColumns: {
      type: Array,
      default: () => [],
    },
    baseColumns: {
      type: Array,
      default: () => [],
    },
    dynamicColumns: {
      type: Array,
      default: () => [],
    },
    sourceType: {
      type: String,
      default: 'contact',
    },
    debounceDelay: {
      type: Number,
      default: 300,
    },
  },

  setup(props, { emit }) {
    // state
    const state = reactive({
      searchText: '',
      localVisibleColumns: props.visibleColumns,
    });

    // debounced emit logic
    let debouncedEmit = debounce((value) => {
      emit('update:visibleColumns', value);
    }, props.debounceDelay);

    watch(
      () => props.debounceDelay,
      (newDelay) => {
        debouncedEmit.flush();
        debouncedEmit = debounce((value) => {
          emit('update:visibleColumns', value);
        }, newDelay);
      },
    );

    watch(
      () => props.visibleColumns,
      (newVal) => {
        state.localVisibleColumns = newVal;
      },
      { deep: true },
    );

    onUnmounted(() => {
      debouncedEmit.flush();
    });

    const updateVisibleColumns = (value) => {
      state.localVisibleColumns = value;

      if (props.debounceDelay > 0) {
        debouncedEmit(value);
      } else {
        emit('update:visibleColumns', value);
      }
    };

    // computed
    const computedVisibleColumns = computed({
      get: () => state.localVisibleColumns,
      set: (value) => {
        updateVisibleColumns(value);
      },
    });

    const filteredDynamicColumns = computed(() => {
      if (!state.searchText) {
        return props.dynamicColumns;
      }

      return props.dynamicColumns.filter((col) => col.label
        .toLowerCase()
        .includes(state.searchText.toLowerCase()));
    });

    const areAllColumnsSelected = computed(() => {
      const visibleColumnsLength = size(state.localVisibleColumns);

      if (visibleColumnsLength > 0) {
        return visibleColumnsLength === size(filteredDynamicColumns.value);
      }

      return false;
    });

    // methods
    const toggleSelectAll = () => {
      if (areAllColumnsSelected.value) {
        updateVisibleColumns([]);
      } else {
        const updatedVisibleColumns = filteredDynamicColumns.value.map(
          (objectParam) => objectParam.name,
        );

        updateVisibleColumns(updatedVisibleColumns);
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed
      areAllColumnsSelected,
      computedVisibleColumns,
      filteredDynamicColumns,

      // methods
      toggleSelectAll,
    };
  },
});
</script>

<style lang="scss" scoped>
.column-visibility-card {
  $modalHeaderHeight: 54px;

  max-width: 600px;
  position: relative;

  // sm min
  @media (min-width: $breakpoint-sm-min) {
    width: 600px;
    min-height: 100%;
    border-radius: unset !important;

    display: flex;
    flex-direction: column;
  }

  .app-modal-header {
    background: $grey-50;
    height: $modalHeaderHeight;
  }

  .app-modal-content {
    @media (min-width: $breakpoint-sm-min) {
      flex: 1;
    }

    .selection-info-text {
      margin-top: 20px;
      margin-bottom: 20px;

      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }

    .contacts-columns-grid {
      margin-top: 16px;
      padding-top: 16px;
      width: 100%;
      border-top: 1px solid $grey-50;

      display: flex;
      flex-direction: column;
      gap: 16px;
    }
  }
}
</style>
