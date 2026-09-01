<template>
  <!-- card -->
  <q-card flat class="table-multi-select-card">
    <!-- form -->
    <q-form
      class="table-multi-select-form"
      ref="tableMultiSelectFormRef"

      @submit.prevent.stop="onSubmitCustomLimitForm"
    >
      <!-- Select current list -->
      <q-item
        clickable

        class="multi-select-item"
        @click="onApplySelection(TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST)"
      >
        <p class="multi-select-text">
          Select current list ({{ totalCurrentList }})
        </p>
      </q-item>

      <!-- Select all -->
      <q-item
        clickable

        class="multi-select-item"

        @click="onApplySelection(TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL)"

        v-if="showSelectAllOption"
      >
        <p class="multi-select-text">
          Select All ({{ totalList }})
        </p>
      </q-item>

      <!-- footer action -->
      <div
        v-if="selectedOption === TABLE_MULTI_SELECT_OPTIONS.SELECT_SPECIFIC_LIMIT"

        class="multi-select-footer"
      >
        <q-space />

        <!-- Apply Selection -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="Apply Selection"

          :disable="!selectedOption"

          type="submit"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, onMounted, reactive, toRefs,
} from 'vue';

// uits
import { convertStringToNumber } from 'src/utils/numbers';

// constants
import { TABLE_MULTI_SELECT_OPTIONS } from 'boot/constants';

export default defineComponent({
  name: 'TableMultiSelect',

  emits: ['updateMultiSelect'],

  props: {
    showSelectAllOption: {
      type: Boolean,
      default: true,
    },
    totalCurrentList: {
      type: Number,
      default: null,
    },
    totalList: {
      type: Number,
      default: null,
    },

    multiSelectOptionJson: {
      type: Object,
      default: () => {},
    },
  },

  setup(props, { emit }) {
    // state
    const state = reactive({
      selectedOption: null,
      limitNumber: null,

      tableMultiSelectFormRef: null,
    });

    // methods
    const onApplySelection = (selectedItem) => {
      let limit;

      if (selectedItem === TABLE_MULTI_SELECT_OPTIONS.SELECT_CURRENT_LIST) {
        limit = props.totalCurrentList;
      } else if (selectedItem === TABLE_MULTI_SELECT_OPTIONS.SELECT_ALL) {
        limit = props.totalList;
      }

      emit('updateMultiSelect', {
        limit,
        limitNumber: null,
        selectedOption: selectedItem,
      });
    };

    const onNumberInputChange = () => {
      state.selectedOption = TABLE_MULTI_SELECT_OPTIONS.SELECT_SPECIFIC_LIMIT;

      state.tableMultiSelectFormRef.resetValidation();
    };

    const onSelectOption = (option) => {
      state.selectedOption = option;

      if (option !== TABLE_MULTI_SELECT_OPTIONS.SELECT_SPECIFIC_LIMIT) {
        state.limitNumber = null;
      }
    };

    const limitNumberRules = [
      (v) => !!v || 'Limit is required', // Check if the value exists (truthy)
      (v) => v > 0 || 'Limit must be greater than 0', // Ensure the value is greater than 0
      (v) => v <= props.totalList || `Limit must be less than or equal to ${props.totalList}`, // Ensure value is within the allowed limit
    ];

    const onSubmitCustomLimitForm = () => {
      emit('updateMultiSelect', {
        limit: null,
        limitNumber: convertStringToNumber(state.limitNumber),
        selectedOption: state.selectedOption,
      });
    };

    onMounted(() => {
      if (props.multiSelectOptionJson?.selectedOption) {
        state.selectedOption = props.multiSelectOptionJson.selectedOption;
        state.limitNumber = props.multiSelectOptionJson.limitNumber;
      }
    });

    return {
      // state
      ...toRefs(state),

      // methods
      onSelectOption,
      onApplySelection,
      onNumberInputChange,
      onSubmitCustomLimitForm,

      // input element rules
      limitNumberRules,

      // constants
      TABLE_MULTI_SELECT_OPTIONS,
    };
  },
});
</script>

<style lang="scss" scoped>
.table-multi-select-card {
  width: 280px;
  border-radius: 4px;
  background: $white;
  box-shadow: 0px 0px 14px 0px rgba(141, 143, 169, 0.40);

  .multi-select-item {
    flex-direction: column;

    padding: 18px 20px;
    min-height: unset;

    border-bottom: 1px solid $grey-50;

    .multi-select-text {
      color: $black;
    }

    .limit-number-input {
      margin-top: 12px;
      margin-bottom: 6px;
    }
  }

  .multi-select-footer {
    width: 100%;
    padding: 12px;
    display: flex;
    align-items: center;
  }
}
</style>
