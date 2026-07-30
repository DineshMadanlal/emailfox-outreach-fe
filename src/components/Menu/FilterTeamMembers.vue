<template>
  <q-menu
    auto-close
    :offset="[0, 10]"
    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark custom-scrollbar"
  >
    <!-- list -->
    <q-list
      style="max-width: 289px"
      class="filter-team-members-list"
    >
      <!-- Section -->
      <div class="filter-team-members-content">
        <p class="filter-type-text">
          Role
        </p>

        <div class="filter-options-grid">
          <q-checkbox
            v-for="role in roleOptions"
            :key="role.value"

            v-model="localSelectedRoles"
            :val="role.value"
            dense
            class="filter-checkbox app-checkbox"
          >
            {{ role.label }}
          </q-checkbox>
        </div>
      </div>

      <div class="filter-team-members-content">
        <p class="filter-type-text">
          Status
        </p>

        <div class="filter-options-grid">
          <q-checkbox
            v-for="status in statusOptions"
            :key="status.value"

            v-model="localSelectedStatuses"
            :val="status.value"
            dense
            class="filter-checkbox app-checkbox"
          >
            {{ status.label }}
          </q-checkbox>
        </div>
      </div>
    </q-list>
  </q-menu>
</template>

<script>
// lodash
import size from 'lodash/size';

// vue
import {
  computed, defineComponent,
} from 'vue';

// constants
import { TEAM_MEMBER_ROLES, TEAM_MEMBER_STATUS } from 'boot/workspace-constants';

export default defineComponent({
  name: 'FilterTeamMembers',

  props: {
    selectedRoles: {
      type: Array,
      default: () => [],
    },
    selectedStatuses: {
      type: Array,
      default: () => [],
    },
  },

  setup(props, { emit }) {
    // computed
    const localSelectedRoles = computed({
      // setter/getter
      get: () => props.selectedRoles,
      set: (value) => {
        emit('update:selectedRoles', value);
      },
    });

    const localSelectedStatuses = computed({
      // setter/getter
      get: () => props.selectedStatuses,
      set: (value) => {
        emit('update:selectedStatuses', value);
      },
    });

    const roleOptions = computed(() => (
      Object.values(TEAM_MEMBER_ROLES)
        .filter((role) => role.value !== TEAM_MEMBER_ROLES.SUPER_ADMIN.value)
        .map((role) => ({
          label: role.label,
          value: role.value,
          description: role.description,
        }))
    ));

    const statusOptions = computed(() => Object.values(TEAM_MEMBER_STATUS).map((status) => ({
      label: status.label,
      value: status.value,
      description: status.description,
      color: status.color,
    })));

    const hasActiveFilters = computed(() => {
      if (size(props.selectedRoles) || size(props.selectedStatuses)) {
        return true;
      }

      return false;
    });

    // methods
    const resetFilters = () => {
      localSelectedRoles.value = [];
      localSelectedStatuses.value = [];
    };

    return {
      // computed
      roleOptions,
      statusOptions,
      hasActiveFilters,

      localSelectedRoles,
      localSelectedStatuses,

      // methods
      resetFilters,
    };
  },
});
</script>

<style lang="scss" scoped>
.filter-team-members-list {
  width: 100%;
  min-width: 289px;

  // content
  .filter-team-members-content {
    width: 100%;
    padding-bottom: 3px;
    border-bottom: 1px solid rgba(var(--grey-50-rgb), 0.5);

    &:last-child {
      border-bottom: none;
    }

    .filter-options-grid {
      width: 100%;
      display: flex;
      flex-direction: column;
    }

    .filter-type-text {
      color: $grey-300;
      font-size: 12px;
      font-weight: 600;
      line-height: 16px;
      letter-spacing: 0.72px;
      text-transform: uppercase;

      margin-top: 16px;
      margin-left: 15px;
      margin-bottom: 6px;
    }

    .filter-checkbox {
      padding: 10px;
      border-radius: 4px;
      height: 36px;

      &:hover {
        background-color: rgba(var(--primary-rgb), 0.1);
      }
    }
  }
}
</style>
