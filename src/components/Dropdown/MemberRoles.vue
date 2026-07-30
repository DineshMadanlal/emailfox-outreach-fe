<template>
  <q-select
    v-bind="{ ...$attrs }"

    dense
    emit-value
    options-dense
    hide-bottom-space

    v-model="internalValue"
    :options="dropdownList"

    option-label="label"
    option-value="value"
    dropdown-icon="keyboard_arrow_down"

    @update:modelValue="onInputChange"
  >
    <!-- selected slot -->
    <template v-slot:selected-item="scope">
      <div
        v-if="scope.opt"
      >
        <p>
          {{ selectedItemLabel }}
        </p>
      </div>
    </template>

    <!-- dropdown slot option -->
    <template
      v-slot:option="{ itemProps, opt }"
    >
      <!-- each q item -->
      <q-item
        v-bind="itemProps"
        class="each-member-role-item"
      >
        <div>
          <p class="member-label">
            {{ opt.label }}
          </p>
          <p class="member-description">
            {{ opt.description }}.
          </p>
        </div>
      </q-item>
    </template>
  </q-select>
</template>

<script>
// lodash
import get from 'lodash/get';

// vue
import { defineComponent, computed } from 'vue';

// constants
import { TEAM_MEMBER_ROLES } from 'boot/workspace-constants';

export default defineComponent({
  name: 'MemberRoles',

  emits: ['update:modelValue'],

  // Prevent default attributes from being automatically applied to the root element
  inheritAttrs: false,

  props: {
    modelValue: {
      type: String,
      default: '',
    },
  },

  setup(props, { emit }) {
    // Local state to manage the selected options
    const internalValue = computed({
      get: () => props.modelValue,
      set: (value) => {
        emit('update:modelValue', value);
      },
    });

    // data
    const dropdownList = Object.entries(TEAM_MEMBER_ROLES)
      .filter(([key]) => key !== TEAM_MEMBER_ROLES.SUPER_ADMIN.value)
      .map(([key, value]) => ({
        label: value.label,
        value: key,
        description: value.description,
      }));

    // selected item
    const selectedItemLabel = computed(() => {
      if (internalValue.value) {
        return get(TEAM_MEMBER_ROLES, `${internalValue.value}.label`, '');
      }

      return '';
    });

    // methods
    const onInputChange = (value) => {
      emit('update:modelValue', value);
    };

    return {
      // data
      dropdownList,

      // computed
      internalValue,
      selectedItemLabel,

      // methods
      onInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.each-member-role-item {
  padding-top: 4px;

  .member-label {
    font-size: 14px;
  }

  .member-description {
    font-size: 12px;
    color: $grey;

    max-width: 400px;
  }
}
</style>
