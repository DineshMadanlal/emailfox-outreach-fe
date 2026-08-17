<template>
  <q-input
    dense
    outlined
    readonly
    hide-bottom-space

    v-model="internalValue"

    mask="date"
    :rules="['date']"
    lazy-rules="ondemand"

    clear-icon="clear"

    :class="[
      'date-picker-input',
      moreClass,
    ]"

    @click="qDateProxyRef?.show()"
  >
    <!-- Prepend -->
    <template #prepend>
      <div class="cursor-pointer flex items-center">
        <LocalSvgIcon image="seq-schedule" />

        <q-popup-proxy
          ref="qDateProxyRef"
          transition-show="scale"
          transition-hide="scale"
        >
          <q-date
            v-model="internalValue"
            :options="optionsFn"
            @update:model-value="updateValue"
          />
        </q-popup-proxy>
      </div>
    </template>
  </q-input>
</template>

<script>
// vue
import { computed, defineComponent, ref } from 'vue';

// quasar
import { date } from 'quasar';

export default defineComponent({
  name: 'DatePicker',

  emits: ['update:modelValue'],

  props: {
    modelValue: {
      type: String,
      default: '',
    },
    sendTimestamp: {
      type: Boolean,
      default: false,
    },
    moreClass: {
      type: String,
      default: '',
    },
  },

  setup(props, { emit }) {
    // refs
    const qDateProxyRef = ref(null);

    // computed
    const internalValue = computed({
      get: () => {
        if (!props.modelValue) return '';
        const d = new Date(props.modelValue);
        if (Number.isNaN(d.getTime())) return props.modelValue;

        if (typeof props.modelValue === 'string' && (props.modelValue.includes('T') || props.modelValue.includes('Z'))) {
          const yyyy = d.getUTCFullYear();
          const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
          const dd = String(d.getUTCDate()).padStart(2, '0');
          return `${yyyy}/${mm}/${dd}`;
        }

        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}/${mm}/${dd}`;
      },
      set: (value) => {
        if (!value) {
          emit('update:modelValue', '');
          return;
        }

        if (props.sendTimestamp) {
          const parts = value.replaceAll('-', '/').split('/');
          if (parts.length === 3) {
            const [yyyy, mm, dd] = parts.map(Number);
            const isoString = new Date(Date.UTC(yyyy, mm - 1, dd)).toISOString();
            emit('update:modelValue', isoString);
            return;
          }
        }

        emit('update:modelValue', value);
      },
    });

    // methods (Strictly future dates only)
    const optionsFn = (d) => d > date.formatDate(Date.now(), 'YYYY/MM/DD');

    const updateValue = (value) => {
      internalValue.value = value;
      qDateProxyRef.value?.hide();
    };

    return {
      // refs
      qDateProxyRef,

      // computed
      internalValue,

      // methods
      optionsFn,
      updateValue,
    };
  },
});
</script>

<style lang="scss" scoped>
.date-picker-input {
  cursor: pointer;

  :deep(.q-field__prepend) {
    .q-icon,
    svg {
      color: $primary;
      font-size: 16px;
      cursor: pointer;
    }
  }

  &.dead-small {
    width: fit-content;
    max-width: 140px;

    :deep(.q-field__inner) {
      .q-field__control,
      .q-field__marginal {
        height: 28px;
        border-radius: 8px;
      }

      .search-icon {
        height: 12px;
        width: 12px;
      }
    }
  }
}
</style>
