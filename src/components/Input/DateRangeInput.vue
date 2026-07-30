<template>
  <!-- date range filter -->
  <q-input
    dense
    outlined

    :model-value="dateRangeInputLabel"

    @click="qDateProxyRef.show()"
    class="date-range-input"
  >
    <!-- Append -->
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy
          cover
          transition-show="scale"
          transition-hide="scale"

          ref="qDateProxyRef"
        >
          <q-date
            range
            v-model="internalValue"

            mask="YYYY-MM-DD"
          >
            <div class="row items-center justify-end">
              <q-btn
                flat
                no-caps
                unelevated
                v-close-popup

                label="Close"
                color="primary"
                class="light-primary-btn"
              />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>
<script>
// vue
import {
  defineComponent, computed, reactive, toRefs,
} from 'vue';

// quasar
import { useQuasar } from 'quasar';

// utils
import {
  yearMonthDateFilterFormat, differenceBetweenDays, isSameMonth, isSameWeek, getOrdinalSuffix,
} from 'src/utils/dates';

export default defineComponent({
  name: 'DateRangeInput',

  emits: ['update:modelValue'],

  props: {
    modelValue: {
      type: Object,
      default: () => { },
      required: true,
    },

    maxNumberOfDays: {
      type: Number,
      default: 30,
    },
  },

  setup(props, { emit }) {
    // quasar
    const $q = useQuasar();

    // state
    const state = reactive({
      qDateProxyRef: null,
    });

    // Local state to manage the selected options
    const internalValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        if (!value || !value?.from || !value?.to) {
          emit('update:modelValue', {});

          return;
        }

        const startDate = yearMonthDateFilterFormat(value?.from);
        const endDate = yearMonthDateFilterFormat(value?.to);

        const diffInDays = differenceBetweenDays({
          startDate, endDate,
        });

        /** There's a max limit for the user to select the date range. */
        if (diffInDays <= props.maxNumberOfDays) {
          emit('update:modelValue', value);

          state.qDateProxyRef.hide();
        } else {
          $q.dialog({
            title: 'Alert',
            message: `The date range limit was exceeded. The maximum number of days allowed is ${props.maxNumberOfDays}.`,
          });
        }
      },
    });

    const dateRangeInputLabel = computed(() => {
      if (!props.modelValue || !props.modelValue.from || !props.modelValue.to) {
        return '';
      }

      const fromDate = props.modelValue.from instanceof Date
        ? props.modelValue.from : new Date(props.modelValue.from);
      const toDate = props.modelValue.to instanceof Date
        ? props.modelValue.to : new Date(props.modelValue.to);
      const today = new Date();

      if (isSameWeek(today, fromDate) && isSameWeek(today, toDate)) {
        return 'This week';
      }
      if (isSameMonth(today, fromDate) && isSameMonth(today, toDate)) {
        return 'This month';
      }

      return `${getOrdinalSuffix(fromDate.getDate())} ${fromDate.toLocaleString('default', { month: 'short' })} to ${getOrdinalSuffix(toDate.getDate())} ${toDate.toLocaleString('default', { month: 'short' })}`;
    });

    // methods

    return {
      // state
      ...toRefs(state),

      // computed
      internalValue,
      dateRangeInputLabel,
    };
  },
});
</script>

<style lang="scss" scoped>
.date-range-input {
  min-width: 220px;
}
</style>
