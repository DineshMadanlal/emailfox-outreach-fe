<template>
  <q-item
    clickable
    class="logged-in-user-card"
  >
    <!-- Name First Letter -->
    <p class="name-letter-text">
      {{ userNameFirstLetter }}
    </p>

    <div
      class="user-info-block"
      :class="{ 'hide-info-block': drawerMiniState }"
    >
      <!-- Email -->
      <p class="user-name-text">
        {{ userName }}
      </p>

      <q-space />

      <!-- Down arrow -->
      <LocalSvgIcon
        image="plain-down-arrow"
        classes="down-arrow-icon"
        :class="{ 'rotate-down-arrow': showUserMenu }"
      />
    </div>

    <!-- Menu -->
    <q-menu
      auto-close
      v-model="showUserMenu"

      :offset="[-10, 5]"

      transition-show="jump-up"
      transition-hide="jump-down"
    >
      <q-list style="min-width: 228px">
        <UserInformation
          :userName="userName"
          :userEmail="userEmail"
          :userNameFirstLetter="userNameFirstLetter"

          :canExitWorkspace="canExitWorkspace"

          @logout="logoutUser"
          @exitWorkspace="onExitWorkspace"
        />
      </q-list>
    </q-menu>
  </q-item>
</template>

<script>
import {
  computed, defineComponent, reactive, toRefs,
} from 'vue';

// store
import { useAuthStore } from 'src/stores/auth';

// Components
import UserInformation from 'components/Cards/UserInformation.vue';

export default defineComponent({
  name: 'LoggedInUser',

  components: {
    UserInformation,
  },

  props: {
    drawerMiniState: {
      type: Boolean,
      required: true,
      default: false,
    },
    canExitWorkspace: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    // Access the user store
    const authStorePinia = useAuthStore();

    // state
    const state = reactive({
      showUserMenu: false,
    });

    // computed
    const userJson = computed(() => authStorePinia.user || {});

    const userName = computed(() => userJson.value.name || '');
    const userEmail = computed(() => userJson.value.email || '');
    const userNameFirstLetter = computed(() => userName.value.charAt(0).toUpperCase());

    return {
      // state
      ...toRefs(state),

      // computed
      userName,
      userEmail,
      userNameFirstLetter,

      // store
      logoutUser: authStorePinia.logoutUser,
      onExitWorkspace: authStorePinia.onExitWorkspace,
    };
  },
});
</script>

<style lang="scss" scoped>
.logged-in-user-card {
  min-height: unset;

  display: flex;
  align-items: center;
  padding: 8px;

  .name-letter-text {
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

    width: 32px;
    height: 32px;
  }

  .user-info-block {
    width: 100%;
    display: flex;
    align-items: center;

    margin-left: 10px;

    .user-name-text {
      color: $grey-50;
      font-size: 14px;
      font-style: normal;
      font-weight: 400;
      line-height: 16px;

      margin-right: 4px;
    }

    :deep(.down-arrow-icon) {
      height: 8px;
      width: 8px;

      transition: all 0.3s ease-in-out;
      @include svg-icon-stroke('path', $white);

      &.rotate-down-arrow {
        transform: rotate(180deg);
      }
    }

    // xs max
    &.hide-info-block {
      display: none;
    }
  }
}
</style>
