<template>
  <q-menu
    ref="menuRef"

    :target="target"
    v-model="computedShowVariableMenu"

    square
    no-parent-event

    tabindex="0"
    self="top left"
    anchor="bottom left"
    class="variable-picker-menu custom-scrollbar"

    @keydown.up.prevent="navigateUp"
    @keydown.down.prevent="navigateDown"
    @keydown.left.prevent="handleLeftArrow"
    @keydown.enter.prevent="selectCurrentItem"
    @keydown.right.prevent="handleRightArrow"
  >
    <!--  -->
    <q-list style="min-width: 290px" class="editor-menu-list">
      <!-- Menu Items -->
      <template
        v-for="(field, index) in allOptions"
        :key="`menu-item-${index}`"
      >
        <!-- Spintax Option -->
        <q-item
          v-if="!isLinkedInWorkflow && field.type === MENU_ITEM_TYPES.SPINTAX"
          clickable
          class="editor-variable-option"
          :class="{ 'is-focused': activeIndex === index }"
          @click="executeAction(field)"
          @mousedown.prevent
        >
          <p class="variable-label-text">Add Spintax</p>
        </q-item>

        <!-- Sender Variables Sub-menu -->
        <q-item
          v-else-if="!isLinkedInWorkflow && field.type === MENU_ITEM_TYPES.SENDER_VARIABLES"
          clickable
          class="editor-variable-option"
          :class="{
            'active': showSenderVariablesMenu,
            'is-focused': activeIndex === index
          }"

          @mousedown.prevent
          @mouseenter="openSubMenu('sender')"
          @mouseleave="closeSubMenu"
        >
          <div class="full-width flex no-wrap items-center">
            <p class="variable-label-text">
              Sender Variables
            </p>
            <q-space />
            <LocalSvgIcon image="plain-down-arrow" classes="plain-down-arrow-icon" />
          </div>

          <!-- Sender Variables Sub-menu -->
          <q-menu
            :offset="[10, 0]"
            no-parent-event
            v-model="showSenderVariablesMenu"

            anchor="top end"
            self="top start"

            class="variable-picker-menu custom-scrollbar"

            @mouseleave="closeSubMenu"
            @mouseenter="openSubMenu('sender')"

            @keydown.up.prevent="navigateUp"
            @keydown.down.prevent="navigateDown"
            @keydown.left.prevent="handleLeftArrow"
            @keydown.enter.prevent="selectCurrentItem"
            @keydown.right.prevent="handleRightArrow"
          >
            <q-list style="min-width: 290px" class="editor-menu-list">
              <q-item
                v-for="(sub, subIndex) in senderVariables"
                :key="`sender-${sub.value}`"
                clickable
                v-close-popup

                class="editor-variable-option"
                :class="{
                  'is-focused': subActiveIndex === subIndex && showSenderVariablesMenu
                }"

                @mousedown.prevent
                @click="$emit('insertVariable', sub.value)"
              >
                <p class="variable-label-text">{{ sub.label }}</p>
                <q-space />
                <p class="variable-value-text">{{ sub.value }}</p>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>

        <!-- Context Variables Sub-menu -->
        <q-item
          v-else-if="field.type === MENU_ITEM_TYPES.CONTEXT_VARIABLES"
          clickable
          class="editor-variable-option"
          :class="{
            'active': showContextVariablesMenu,
            'is-focused': activeIndex === index
          }"
          @mousedown.prevent
          @mouseleave="closeSubMenu"
          @mouseenter="openSubMenu('context')"
        >
          <div class="full-width flex no-wrap items-center">
            <p class="variable-label-text">Context Variables</p>
            <q-space />
            <LocalSvgIcon image="plain-down-arrow" classes="plain-down-arrow-icon" />
          </div>

          <q-menu
            v-model="showContextVariablesMenu"
            anchor="top end"
            self="top start"
            :offset="[10, 0]"

            class="variable-picker-menu custom-scrollbar"

            @mouseleave="closeSubMenu"
            @mouseenter="openSubMenu('context')"

            @keydown.up.prevent="navigateUp"
            @keydown.down.prevent="navigateDown"
            @keydown.left.prevent="handleLeftArrow"
            @keydown.enter.prevent="selectCurrentItem"
            @keydown.right.prevent="handleRightArrow"
          >
            <q-list style="min-width: 290px" class="editor-menu-list">
              <q-item
                v-for="(sub, subIndex) in contextVariables"
                :key="`context-${sub.value}`"
                clickable
                v-close-popup
                class="editor-variable-option"
                :class="{
                  'is-focused': subActiveIndex === subIndex && showContextVariablesMenu
                }"

                @mousedown.prevent
                @click="$emit('insertVariable', sub.value)"
              >
                <p class="variable-label-text">{{ sub.label }}</p>
                <q-space />
                <p class="variable-value-text">{{ sub.example }}</p>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>

        <!-- Lead Variables Sub-menu -->
        <template
          v-else-if="field.type === MENU_ITEM_TYPES.LEAD_VARIABLE"
        >
          <div v-if="index === 3" class="full-width">
            <div class="list-separator" />
            <div class="lead-fields-text">
              Lead Fields
            </div>
          </div>

          <!-- Lead Variable Item -->
          <q-item
            clickable
            v-close-popup
            class="editor-variable-option"
            :class="{ 'is-focused': activeIndex === index }"
            @click="$emit('insertVariable', field.value)"
            @mousedown.prevent
          >
            <p class="variable-label-text">{{ field.label }}</p>
            <q-space />
            <p class="variable-value-text">{{ field.value }}</p>
          </q-item>
        </template>

        <!-- Custom Fields Sub-menu -->
        <template
          v-else-if="field.type === MENU_ITEM_TYPES.CUSTOM_FIELD"
        >
          <div
            v-if="index === customFieldsIndexCount"
            class="full-width"
          >
            <div class="list-separator" />
            <div class="lead-fields-text">
              Custom Fields
            </div>
          </div>

          <!-- Custom Fields Item -->
          <q-item
            clickable
            v-close-popup
            class="editor-variable-option"
            :class="{ 'is-focused': activeIndex === index }"
            @click="$emit('insertVariable', field.value)"
            @mousedown.prevent
          >
            <p class="variable-label-text">{{ field.label }}</p>
            <q-space />
            <p class="variable-value-text">{{ field.value }}</p>
          </q-item>
        </template>

      </template>
    </q-list>
  </q-menu>
</template>

<script>
// vue
import {
  computed, defineComponent, reactive, toRefs, watch, nextTick,
} from 'vue';

// pinia
import { useUserPreferencesStore } from 'stores/userPreferences';

// constants
import { CONTEXT_VARIABLES, SENDER_VARIABLES, DEFAULT_SYSTEM_FIELDS } from 'src/boot/campaign-constants';

// constants
const MENU_ITEM_TYPES = {
  SPINTAX: 'spintax',
  SENDER_VARIABLES: 'sender',
  CONTEXT_VARIABLES: 'context',
  LEAD_VARIABLE: 'lead',
  CUSTOM_FIELD: 'custom_field',
};

export default defineComponent({
  name: 'EditorMenuOptions',

  emits: ['update:modelValue', 'insertVariable', 'addSpintax'],

  props: {
    target: {
      type: [String, Object, HTMLElement],
      default: null,
    },
    modelValue: {
      type: Boolean,
      default: false,
    },
    isLinkedInWorkflow: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    // access the store
    const userPreferencesStore = useUserPreferencesStore();

    // state
    const state = reactive({
      // sub-menu states
      showSenderVariablesMenu: false,
      showContextVariablesMenu: false,

      // keyboard navigation
      activeIndex: -1,
      subActiveIndex: -1,

      // to prevent immediate submenu close when moving mouse from parent item to submenu
      closeTimer: null,

      // menu reference
      menuRef: null,
    });

    // computed
    const computedShowVariableMenu = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val),
    });

    const variableMenuOptions = computed(() => DEFAULT_SYSTEM_FIELDS.map((field) => ({
      label: field.label,
      value: `{{${field.value}}}`,
      type: MENU_ITEM_TYPES.LEAD_VARIABLE,
    })));

    const customFieldsIndexCount = computed(() => variableMenuOptions.value.length + 3);

    const customFieldOptions = computed(() => {
      const options = [];

      if (userPreferencesStore.workspaceCustomFields?.length > 0) {
        userPreferencesStore.workspaceCustomFields.forEach((field) => {
          options.push({
            label: field.label,
            value: `{{${field.value}}}`,
            type: MENU_ITEM_TYPES.CUSTOM_FIELD,
          });
        });
      }

      return options;
    });

    const allOptions = computed(() => {
      const options = [
        { type: MENU_ITEM_TYPES.SPINTAX },
        { type: MENU_ITEM_TYPES.SENDER_VARIABLES },
        { type: MENU_ITEM_TYPES.CONTEXT_VARIABLES },
        ...variableMenuOptions.value,
        ...customFieldOptions.value,
      ];

      return options;
    });

    const senderVariables = computed(() => SENDER_VARIABLES.map((f) => ({ label: f.label, value: `{{${f.value}}}` })));
    const contextVariables = computed(() => CONTEXT_VARIABLES.map((f) => ({ label: f.label, value: `{{${f.value}}}`, example: f.example })));

    // methods
    // Helper to get the current active sub-list
    const currentSubList = computed(() => {
      if (state.showSenderVariablesMenu) return senderVariables.value;
      if (state.showContextVariablesMenu) return contextVariables.value;
      return [];
    });

    const openSubMenu = (type) => {
      clearTimeout(state.closeTimer);
      state.showSenderVariablesMenu = type === 'sender';
      state.showContextVariablesMenu = type === 'context';
      // When opening via mouse, reset sub-index
      state.subActiveIndex = -1;
    };

    const closeSubMenu = () => {
      // Use a timeout to allow for mouseenter on the submenu when moving from the parent item
      // This prevents the submenu from closing immediately when trying to hover over it
      state.closeTimer = setTimeout(() => {
        state.showSenderVariablesMenu = false;
        state.showContextVariablesMenu = false;
      }, 150);
    };

    const scrollActiveItemIntoView = () => {
      nextTick(() => {
        const el = document.querySelector('.editor-variable-option.is-focused');
        el?.scrollIntoView({ block: 'nearest' });
      });
    };

    const handleRightArrow = () => {
      const current = allOptions.value[state.activeIndex];
      if (current?.type === MENU_ITEM_TYPES.SENDER_VARIABLES
        || current?.type === MENU_ITEM_TYPES.CONTEXT_VARIABLES) {
        openSubMenu(current.type);
        // Highlight the first option immediately on right arrow
        state.subActiveIndex = 0;
      }
    };

    const handleLeftArrow = () => {
      if (currentSubList.value.length > 0) {
        state.showSenderVariablesMenu = false;
        state.showContextVariablesMenu = false;
        state.subActiveIndex = -1;
      }
    };

    const navigateDown = () => {
      if (currentSubList.value.length > 0) {
      // Navigate inside sub-menu
        state.subActiveIndex = (state.subActiveIndex + 1) % currentSubList.value.length;
      } else {
      // Navigate parent menu
        state.activeIndex = (state.activeIndex + 1) % allOptions.value.length;
      }
      scrollActiveItemIntoView();
    };

    const navigateUp = () => {
      if (currentSubList.value.length > 0) {
      // Navigate inside sub-menu
        state.subActiveIndex = state.subActiveIndex <= 0
          ? currentSubList.value.length - 1 : state.subActiveIndex - 1;
      } else {
      // Navigate parent menu
        state.activeIndex = state.activeIndex <= 0
          ? allOptions.value.length - 1 : state.activeIndex - 1;
      }
      scrollActiveItemIntoView();
    };

    const executeAction = (item) => {
      /** Execute the selected action based on its type
       * - For spintax, emit addSpintax event
       * - For sender and context variables, open respective sub-menus
       * - For lead variables, emit insertVariable event with the variable value
       * After executing the action, close the main menu unless it's a sub-menu trigger
       */
      if (item.type === MENU_ITEM_TYPES.SPINTAX) emit('addSpintax');
      else if (item.type === MENU_ITEM_TYPES.SENDER_VARIABLES) openSubMenu('sender');
      else if (item.type === MENU_ITEM_TYPES.CONTEXT_VARIABLES) openSubMenu('context');
      else emit('insertVariable', item.value);

      if (item.type !== 'sender' && item.type !== 'context') {
        // close the menu after action execution, except when opening sub-menu
        computedShowVariableMenu.value = false;
      }
    };

    const selectCurrentItem = () => {
    // If sub-menu is being navigated, select the sub-item
      if (currentSubList.value.length > 0 && state.subActiveIndex >= 0) {
        const selectedSub = currentSubList.value[state.subActiveIndex];
        emit('insertVariable', selectedSub.value);
        computedShowVariableMenu.value = false;
        return;
      }

      // Otherwise select parent item
      if (state.activeIndex >= 0) {
        executeAction(allOptions.value[state.activeIndex]);
      }
    };

    // lifecycle hooks
    watch(() => props.modelValue, (val) => {
      if (val) {
        state.activeIndex = -1;
        state.subActiveIndex = -1;
        nextTick(() => {
          state.menuRef?.focus();
        });
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      allOptions,
      senderVariables,
      contextVariables,
      customFieldsIndexCount,
      computedShowVariableMenu,

      // hardcoded types
      MENU_ITEM_TYPES,

      // methods
      openSubMenu,
      closeSubMenu,
      navigateDown,
      navigateUp,
      handleRightArrow,
      handleLeftArrow,
      executeAction,
      selectCurrentItem,
    };
  },
});
</script>

<style lang="scss" scoped>
.editor-menu-list {
  width: 100%;
  max-width: 290px;

  overflow-y: auto;
  max-height: 330px;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    max-height: inherit;
  }

  .lead-fields-text {
    color: $grey-300;
    font-size: 12px;
    font-weight: 600;
    line-height: 16px;
    letter-spacing: 0.72px;
    text-transform: uppercase;

    margin-bottom: 3px;
    padding-left: 12px;
  }

  .list-separator {
    width: 100%;
    border-top: 1px solid rgba(var(--grey-50-rgb), 0.5);

    margin-top: 3px;
    margin-bottom: 16px;
  }

  .editor-variable-option {
    min-height: unset;
    padding-left: 12px;
    transition: background 0.2s;

    // This is the keyboard selection highlight
    &.is-focused {
      background-color: rgba(var(--primary-rgb), 0.12) !important;
    }

    &.active, &:hover {
      background-color: rgba(var(--primary-rgb), 0.08) !important;
    }

    .plain-down-arrow-icon {
      transform: rotate(-90deg);
      width: 12px;
    }

    .variable-label-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }
    .variable-value-text {
      color: $grey-300;
      font-size: 13px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px; /* 123.077% */
    }
  }
}
</style>

<style lang="scss">
.variable-picker-menu {
  border-radius: 6px;
  border: 1px solid $grey-50;
  background: $white;
  box-shadow: 0 1px 12px 2px rgba(0, 0, 0, 0.12);
}
</style>
