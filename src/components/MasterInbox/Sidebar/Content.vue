<template>
  <div
    class="master-inbox-sidebar-content"
    :class="{ 'mini': miniDrawer }"
  >
    <!-- Compose Box -->
    <q-btn
      flat
      no-caps
      unelevated

      color="primary"
      class="compose-btn"

      @click="onComposeEmail"
    >
      <div class="flex no-wrap -items=center">
        <LocalSvgIcon
          image="compose"
        />

        <AppTooltip
          v-if="miniDrawer"
          content="Compose"

          anchor="center right"
          self="center left"
          :offset="[6, 10]"
        />

        <p
          v-else
          class="compose-label-text"
        >
          Compose
        </p>
      </div>
    </q-btn>

    <!-- Top Routes -->
    <q-item
      clickable
      v-for="(page, index) in skyboxTopRoutes"

      :to="page.route"
      :key="`master-inbox-page-option-${index}-${page.label}`"

      class="master-inbox-route-item"
      :class="{
        active: activeRoute.includes(page.route),
      }"

      @click="onClickPage(activeRoute.includes(page.route))"
    >
      <LocalSvgIcon
        :image="page.icon"
        class="master-inbox-page-icon"
        :classes="page.cssClassName || ''"
      />

      <AppTooltip
        v-if="miniDrawer"
        :content="page.label"

        anchor="center right"
        self="center left"
        :offset="[6, 10]"
      />

      <!--  -->
      <p
        v-if="!miniDrawer"
        class="master-inbox-label-text"
      >
        {{ page.label }}
      </p>

    </q-item>

    <div class="border-spacer" />
      <!-- Loader -->
      <div
        v-if="fetchFoldersApiLoading"
        class="folders-api-loader"
      >
        <ApiLoader
          show
        >
          <q-spinner-cube color="primary" size="24px" />
        </ApiLoader>
      </div>

      <!-- Empty Folder -->
      <q-item
        clickable

        class="master-inbox-route-item"
        to="/unibox/preferences/folder/add"

        v-if="areFoldersEmpty"
      >
        <LocalSvgIcon
          image="add-circle"
          class="add-circle-icon"
        />

        <AppTooltip
          v-if="miniDrawer"
          content="Add Folder"

          anchor="center right"
          self="center left"
          :offset="[6, 10]"
        />

        <!--  -->
        <p
          v-else
          class="master-inbox-label-text"
        >
          Add Folder
        </p>
      </q-item>

      <!-- Folders -->
      <q-expansion-item
        v-if="baseMailFoldersFromStore?.length > 0"

        dense
        default-opened
        hide-expand-icon

        v-model="expandPanel"

        class="folders-list-expansion-item"
        header-class="folders-list-expansion-header"
      >
      <template #header>
        <div
          class="full-width flex no-wrap items-center justify-between"
        >
          <p
            v-if="!miniDrawer"
            class="folders-list-text"
          >
            Folders List
          </p>

          <!-- Add Folder Button -->
          <q-btn
            flat
            round
            dense
            no-caps

            color="primary"
            to="/unibox/preferences/folder/add"
            class="add-folder-btn"
            :class="{ 'full-width': miniDrawer }"

            @click.stop
          >
            <LocalSvgIcon
              image="add-circle"
            />

            <AppTooltip
              content="Add Folder"

              anchor="center right"
              self="center left"
              :offset="[6, 10]"
            />
          </q-btn>
        </div>
      </template>

      <q-list class="full-width">
        <q-item
          v-for="(folder, index) in baseMailFoldersFromStore"
          :key="`master-inbox-folder-${index}-${folder.id}`"
          clickable
          :to="`/unibox/folder/${folder.id}/inbox`"
          class="master-inbox-route-item"
          :class="{
            active: activeFolderId === folder.id,
          }"
        >
          <LocalSvgIcon
            image="folder"
            class="master-inbox-page-icon"
          />

          <AppTooltip
            v-if="miniDrawer"
            :content="folder.name"

            anchor="center right"
            self="center left"
            :offset="[6, 10]"
          />

          <p
            v-else
            class="master-inbox-label-text ellipsis"
          >
            {{ folder.name }}
          </p>

        </q-item>
      </q-list>
    </q-expansion-item>

    <div class="border-spacer" />

    <!-- Bottom Routes -->
    <q-item
      clickable
      v-for="(page, index) in skyboxBottomRoutes"

      :to="page.route"
      :key="`master-inbox-bottom-page-option-${index}-${page.label}`"

      class="master-inbox-route-item"
      :class="{
        active: activeRoute.includes(page.route),
      }"
    >
      <LocalSvgIcon
        :image="page.icon"
        class="master-inbox-page-icon"
      />

      <AppTooltip
        v-if="miniDrawer"
        :content="page.label"

        anchor="center right"
        self="center left"
        :offset="[6, 10]"
      />

      <!--  -->
      <p
        v-if="!miniDrawer"
        class="master-inbox-label-text"
      >
        {{ page.label }}
      </p>

    </q-item>
  </div>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  computed, defineComponent, onMounted, reactive, toRefs, getCurrentInstance,
} from 'vue';

// vue-router
import { useRoute } from 'vue-router';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import AppTooltip from 'components/General/AppTooltip.vue';

// store pinia
import { useSkyboxStore } from 'src/stores/skybox.js';

// utils
import { getApiCall } from 'src/utils/apiRequests';
import { convertStringToNumber } from 'src/utils/numbers';

// constants
import { FOLDER_STATUS, SKYBOX_CLICK_EVENTS_SEC_SIDEBAR } from 'boot/constants';

export default defineComponent({
  name: 'SkyBoxSidebarContent',

  components: {
    ApiLoader,
    AppTooltip,
  },

  props: {
    miniDrawer: {
      type: Boolean,
      default: false,
    },
  },

  setup() {
    const { appContext } = getCurrentInstance();

    // router
    const $route = useRoute();

    // store
    const skyboxPinia = useSkyboxStore();

    // state
    const state = reactive({
      expandPanel: true,
      fetchFoldersApiLoading: false,
    });

    // computed
    const activeRoute = computed(() => $route.path);

    const activeFolderId = computed(() => {
      if ($route.path.includes('/unibox/folder/')) {
        return convertStringToNumber($route.params.folderId);
      }
      return null;
    });

    const baseMailFoldersFromStore = computed(() => skyboxPinia.getBaseMailFolders);

    const areFoldersEmpty = computed(() => {
      if (isEmpty(baseMailFoldersFromStore.value)) {
        return true;
      }

      return false;
    });

    const skyboxTopRoutes = computed(() => {
      const routes = [
        {
          name: 'SkyBoxInbox',
          label: 'Inbox',
          icon: 'inbox',
          route: '/unibox/inbox',
        },
        {
          name: 'SkyBoxInbox',
          label: 'Sent',
          icon: 'mails-sent',
          route: '/unibox/sent',
        },
        {
          name: 'SkyBoxImportant',
          label: 'Important',
          icon: 'star',
          route: '/unibox/important',
        },
        {
          name: 'SkyBoxBounced',
          label: 'Bounced',
          icon: 'mails-bounced',
          route: '/unibox/bounced',
        },
        {
          name: 'SkyBoxSpam',
          label: 'Spam',
          icon: 'mails-spam',
          route: '/unibox/spam',
          cssClassName: 'spam-icon',
        },
      ];

      return routes;
    });

    const skyboxBottomRoutes = computed(() => {
      const routes = [
        {
          name: 'SkyBoxPreferences',
          label: 'Preferences',
          icon: 'preferences',
          route: '/unibox/preferences',
          addBorderSpacer: true,
        },
      ];

      return routes;
    });

    const onClickPage = (isActive) => {
      if (isActive) {
        skyboxPinia.setMultipleFields({
          secondarySiderbarClickEvent: SKYBOX_CLICK_EVENTS_SEC_SIDEBAR.REFRESH_SKYBOX,
        });
      }
    };

    const onComposeEmail = () => {
      skyboxPinia.setMultipleFields({
        secondarySiderbarClickEvent: SKYBOX_CLICK_EVENTS_SEC_SIDEBAR.COMPOSE_EMAIL,
      });
    };

    const getBasicSkyBoxFolders = async () => {
      try {
        state.fetchFoldersApiLoading = isEmpty(baseMailFoldersFromStore.value);

        // Fetch the basic skybox folders
        const response = await getApiCall({
          endpoint: 'skybox/mail-folders',
          params: {
            status: FOLDER_STATUS.ACTIVE,
          },
        });

        //
        skyboxPinia.setMultipleFields({
          baseMailFolders: response?.folders || [],
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error,
        });
      } finally {
        state.fetchFoldersApiLoading = false;
      }
    };

    // on mounted lifecycle hook
    onMounted(() => {
      // You can perform any setup logic here if needed
      getBasicSkyBoxFolders();
    });

    return {
      // state
      ...toRefs(state),

      // computed
      activeRoute,
      skyboxTopRoutes,
      skyboxBottomRoutes,
      activeFolderId,
      areFoldersEmpty,
      baseMailFoldersFromStore,

      // methods
      onClickPage,
      onComposeEmail,
    };
  },
});
</script>

<style lang="scss" scoped>
.master-inbox-sidebar-content {
  width: 100%;
  display: block;

  .compose-btn {
    width: 100%;
    margin-bottom: 12px;

    border-radius: 60px;
    background: rgba($color: var(--primary-rgb), $alpha: 0.1);
    border: 1px solid rgba($color: var(--primary-rgb), $alpha: 0.3);

    .compose-label-text {
      color: $primary;
      font-size: 14px;
      font-style: normal;
      font-weight: 500;
      line-height: 16px; /* 114.286% */

      margin-left: 8px;
    }
  }

  .border-spacer {
    width: 100%;
    height: 1px;
    border-top: 1px solid $grey-50;

    // margin: 10px 0px;
  }

  :deep(.q-expansion-item__content) {
    display: block;
  }

  .folders-api-loader {
    min-height: 40px;
    position: relative;
  }

  :deep(.folders-list-expansion-item) {

    .folders-list-expansion-header {
      padding: 0px 12px;

      border-radius: 6px;
      align-items: center;
      min-height: unset;
      // padding: 10px 16px;

      .folders-list-text {
        color: $primary;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
      }
    }
  }

  .master-inbox-route-item {
    display: flex;
    border-radius: 6px;
    align-items: center;
    min-height: unset;

    padding: 10px 10px;

    &.active {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.2);
    }

    .master-inbox-label-text {
      margin-left: 12px;

      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      &.apply-max-width {
        max-width: 125px;
      }
    }

    :deep(.master-inbox-page-icon) {
      min-width: 16px;
      min-height: 16px;
    }

    :deep(.add-circle-icon) {
      circle, path {
        stroke: $grey;
      }
    }

    &.active {
      :deep(.master-inbox-page-icon) {
        path {
          stroke: $primary;

          &.bounced-path {
            stroke: unset;
            fill: $primary;
          }
        }

        circle {
          stroke: $primary;
        }

        &.spam-icon {
          circle {
            fill: $primary;
          }
        }
      }

      .master-inbox-label-text {
        font-weight: 500;
        color: $primary;
      }
    }
  }

  &.mini {
    .master-inbox-label-text {
      display: none;
    }

    .master-inbox-route-item {
      flex-direction: column;
    }

    :deep(.folders-list-expansion-item) {
      .folders-list-expansion-header {
        padding: 0;
      }
    }
  }
}
</style>
