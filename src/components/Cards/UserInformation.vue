<template>
  <q-card flat class="user-info-card">
    <!-- User Info -->
    <div class="user-details">
      <!--  -->
      <p class="user-first-letter-text">
        {{ userNameFirstLetter }}
      </p>

      <!--  -->
      <div>
        <p class="user-name-text">
          {{ userName }}
        </p>

        <p class="user-email-text">
          {{ userEmail }}
        </p>
      </div>
    </div>

    <!-- Exit workspace -->
    <q-item
      clickable
      class="user-info-action-item negative-item"

      v-if="canExitWorkspace"
      @click="$emit('exitWorkspace')"
    >
      <div class="flex no-wrap items-center">
        <!-- logout icon -->
        <LocalSvgIcon
          image="logout"
          classes="info-action-icon"
        />

        <!--  -->
        <p class="info-action-item-text">
          Exit Workspace
        </p>
      </div>
    </q-item>

    <!-- Logout item -->
    <q-item
      clickable
      class="user-info-action-item negative-item"

      @click="$emit('logout')"

      v-else
    >
      <div class="flex no-wrap items-center">
        <!-- logout icon -->
        <LocalSvgIcon
          image="logout"
          classes="info-action-icon"
        />

        <!--  -->
        <p class="info-action-item-text">
          Sign Out
        </p>
      </div>
    </q-item>
  </q-card>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// stores
import { useAuthStore } from 'src/stores/auth';

export default defineComponent({
  name: 'UserInformation',

  emits: ['logout', 'exitWorkspace'],

  props: {
    userNameFirstLetter: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    canExitWorkspace: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    // store
    const authStorePinia = useAuthStore();

    // computed
    const isPrimaryPlatform = computed(() => authStorePinia.isPrimaryPlatform);

    return {
      // computed
      isPrimaryPlatform,
    };
  },
});
</script>

<style lang="scss" scoped>
.user-info-card {
  width: 100%;
  max-width: 228px;
  border: 1px solid $grey-50;

  .user-details {
    width: 100%;
    display: flex;

    padding: 10px 12px;
    background-color: $grey-50;

    .user-first-letter-text {
      margin-right: 8px;

      border-radius: 2px;
      background: $positive;
      border: 1.2px solid $positive;

      padding: 2px 4.5px;

      display: flex;
      align-items: center;
      justify-content: center;

      color: $white;
      font-size: 12px;
      font-weight: 400;
      line-height: 16px;

      width: 20px;
      height: 20px;
    }

    .user-name-text {
      color: rgba($color: var(--black-rgb), $alpha: 0.8);
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 16px;

      word-break: break-word;
    }

    .user-email-text {
      color: $grey;
      font-size: 13px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;

      margin-top: 2px;

      word-break: break-word;
    }
  }

  .user-info-action-item {
    min-height: unset;
    padding: 15px 12px;

    .info-action-item-text {
      margin-left: 8px;

      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }

    &:hover {
      :deep(.info-action-icon) {
        @include svg-icon-stroke('path, circle, rect', $primary);
      }

      .info-action-item-text {
        color: $primary;
      }

      &.negative-item {
        :deep(.info-action-icon) {
          @include svg-icon-stroke('path, circle, rect', $negative);
        }

        .info-action-item-text {
          color: $negative;
        }
      }
    }
  }
}
</style>
