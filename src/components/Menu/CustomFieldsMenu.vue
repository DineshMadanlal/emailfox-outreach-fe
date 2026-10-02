<template>
  <div
    class="custom-fields-menu custom-scrollbar"
  >
    <!-- Search Input -->
    <div class="search-container">
      <AppSearchInput
        v-model="searchFilterInput"

        :debounce="300"
        :outlined="false"

        borderless
        hide-bottom-space

        class="search-custom-field"
        placeholder="Search field"
      />
    </div>

    <!-- Fields List -->
    <q-list
      dense
      class="custom-fields-menu-list"
    >
      <div
        v-for="field in availableCustomFields"
        :key="`custom-field-view-${field.value}`"

        class="custom-field-item"
        @click="$emit('addCustomField', field)"
      >
        <div class="custom-field-text">
          {{ field.label }}
        </div>
      </div>

      <q-item
        v-if="availableCustomFields.length === 0 && searchFilterInput"
        disabled
      >
        <q-item-section class="text-grey">
          No matching fields
        </q-item-section>
      </q-item>

      <div
        class="vertical-spacer"
        v-if="availableCustomFields.length === 0"
      />

      <!-- Create New Fields (only shown when no results found) -->
      <div
        v-if="availableCustomFields.length === 0"

        clickable

        class="create-new-item-btn"
        @click="$emit('onCreateNewField', searchFilterInput)"
      >
        <!--  -->
        <div
          v-if="searchFilterInput"
        >
          Create
          "<span class="text-primary text-weight-medium">{{ searchFilterInput }}</span>" Field
        </div>

        <!-- Create new field -->
        <div
          v-else
        >
          + Create New Fields
        </div>
      </div>
    </q-list>
  </div>
</template>

<script>
// vue
import {
  defineComponent, ref, computed, onMounted,
} from 'vue';

// components
import AppSearchInput from 'components/Input/AppSearchInput.vue';

// stores
import { useUserPreferencesStore } from 'src/stores/userPreferences';

// composables
import { useWorkspace } from 'src/composables/useWorkspace';

export default defineComponent({
  name: 'CustomFieldsMenu',

  emits: ['addCustomField', 'onCreateNewField'],

  components: {
    AppSearchInput,
  },

  props: {
    activeCustomFields: {
      type: Array,
      default: () => [],
    },
  },

  setup(props) {
    const userStore = useUserPreferencesStore();
    const { getWorkspaceCustomFields } = useWorkspace();

    const searchFilterInput = ref('');

    const workspaceCustomFields = computed(() => userStore.workspaceCustomFields || []);

    const availableCustomFields = computed(() => {
      const activeValues = props.activeCustomFields.map((f) => (typeof f === 'string' ? f : f.value));
      let fields = workspaceCustomFields.value.filter((f) => !activeValues.includes(f.value));

      if (searchFilterInput.value) {
        const query = searchFilterInput.value.toLowerCase();
        fields = fields.filter((f) => f.label.toLowerCase().includes(query));
      }

      return fields;
    });

    onMounted(() => {
      if (!userStore.workspaceCustomFields || userStore.workspaceCustomFields.length === 0) {
        getWorkspaceCustomFields();
      }
    });

    return {
      searchFilterInput,
      workspaceCustomFields,
      availableCustomFields,
    };
  },
});
</script>

<style lang="scss" scoped>
.custom-fields-menu {
  min-width: calc(100% - 32px);
  max-width: 366px;
  background: $white;

  // min
  @media (min-width: 400px) {
    min-width: 366px;
  }

  .search-container {
    padding: 0px 8px;
    border-bottom: 1px solid $grey-50;
  }

  .custom-fields-menu-list {
    max-height: 250px;
    overflow-y: auto;
    padding: 6px 4px;

    .custom-field-item {
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 4px;

      .custom-field-text {
        font-size: 14px;
        color: $black;
      }

      &:hover {
        background-color: rgba(var(--primary-rgb), 0.1);
      }
    }

    .vertical-spacer {
      width: 100%;
      height: 1px;
      border-top: 1px solid $grey-50;

      margin-bottom: 8px;
    }

    .create-new-item-btn {
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 4px;

      &:hover {
        background-color: rgba(var(--primary-rgb), 0.1);
      }
    }
  }
}
</style>
