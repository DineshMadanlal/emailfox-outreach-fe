<template>
  <div class="choose-workspace">
    <!--  -->
    <q-card flat class="workspaces-list-card">
      <p class="choose-header-text">
        Choose Your Workspace
      </p>

      <div class="workspaces-container">
        <!-- View All Workspaces -->
        <div
          class="all-workspaces-grid"
          :class="{ loading: isWorkspaceApiLoading }"
        >
          <ApiLoader
            v-if="showApiLoader"
            show
          />

          <q-item
            v-for="workspace in allWorkspaces"
            :key="`each-workspace-${workspace.id}`"

            clickable
            class="each-workspace-item"

            type="a"
            :href="getWorkspaceUrl(workspace)"
          >
            <div class="flex no-wrap items-center">
              <LogoOrText :workspace="workspace" />

              <p class="workspace-route-text">
                {{ workspace.name }}
              </p>
            </div>
          </q-item>
        </div>

        <!-- Create workspace item -->
        <q-item
          clickable
          class="each-workspace-item create-workspace-item"

          :to="'/workspace/create'"
        >
          <div class="flex no-wrap items-center">
            <div class="workspace-box">
              <LocalSvgIcon
                image="plus"
                class="workspace-page-icon"
              />
            </div>

            <p class="workspace-route-text">
              Create a New Workspace
            </p>
          </div>
        </q-item>
      </div>
    </q-card>

    <!-- Join Existing Workspace -->
    <!-- <q-btn
      flat
      no-caps
      unelevated

      color="grey"
      to="/workspace/join"
    >
      <p class="join-text">
        Join an Existing Workspace
      </p>
    </q-btn> -->
  </div>
</template>

<script>
// vue
import {
  defineComponent, computed, onMounted, getCurrentInstance,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// composables
import { useWorkspace } from 'src/composables/useWorkspace';
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import ApiLoader from 'components/General/ApiLoader.vue';
import LogoOrText from 'components/Workspaces/LogoOrText.vue';

export default defineComponent({
  name: 'ChooseWorkspace',

  components: {
    ApiLoader,
    LogoOrText,
  },

  setup() {
    // composables
    const { generateMetadata } = useAppHelpersApi();

    // metadata
    useMeta(generateMetadata('Choose Workspace'));

    // composables
    const {
      allWorkspaces,
      isWorkspaceApiLoading,

      getWorkspaceUrl,
      fetchAllWorkspaces,
    } = useWorkspace();

    // app context
    const { appContext } = getCurrentInstance();

    // computed
    const showApiLoader = computed(
      () => isWorkspaceApiLoading.value && allWorkspaces.value.length === 0,
    );

    // lufecycle hook
    onMounted(async () => {
      try {
        await fetchAllWorkspaces();
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      }
    });

    return {
      // state
      isWorkspaceApiLoading,

      // computed
      showApiLoader,
      allWorkspaces,

      // methods
      getWorkspaceUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
.choose-workspace {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  position: relative;

  min-height: inherit;
  background: rgba($color: var(--primary-rgb), $alpha: 0.05);

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 12px;
  }

  .workspaces-list-card {
    width: 100%;
    max-width: 580px;
    padding: 60px 80px;
    margin-bottom: 24px;

    border-radius: 8px;
    background: $white;
    border: 1px solid $grey-50;

    display: flex;
    flex-direction: column;
    align-items: center;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 24px 12px;
    }

    // sm max
    @media (max-width: $breakpoint-sm-max) {
      padding: 24px;
    }

    .choose-header-text {
      color: $black;
      font-size: 32px;
      font-weight: 600;
      margin-bottom: 24px;
    }

    .workspaces-container {
      display: flex;
      flex-direction: column;
      align-items: center;

      border-radius: 6px;
      border: 1px solid $grey-50;
      background: $white;
      max-width: 420px;
      width: 100%;

      @include custom-scrollbar;

      .all-workspaces-grid {
        width: 100%;
        max-height: calc(100vh - 500px);
        overflow-y: auto;
        position: relative;

        &.loading {
          min-height: 150px;
        }

        // xs max
        @media (max-width: $breakpoint-sm-max) {
          max-height: calc(100vh - 500px);
        }

        // sm max
        @media (max-width: $breakpoint-sm-max) {
          max-height: calc(100vh - 400px);
        }
      }

      .each-workspace-item {
        width: 100%;
        min-height: unset;
        padding: 20px 16px;
        border-bottom: 1px solid $grey-50;

        &:last-child {
          border-bottom: none;
        }

        &.create-workspace-item {
          border-top: 1px solid $grey-50;
        }

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          padding: 16px 12px;
        }

        &:hover {
          background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
        }

        .workspace-box {
          padding: 8px;
          border-radius: 5px;
          background: $grey-50;

          min-height: 32px;
          min-width: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          :deep(.workspace-page-icon) {
            @include svg-icon-stroke('path, circle', $grey);
          }
        }

        .workspace-route-text {
          margin-left: 12px;

          font-size: 14px;
          font-weight: 400;
          line-height: 16px;
          color: rgba($color: var(--black-rgb), $alpha: 0.8);
        }
      }
    }
  }

  .join-text {
    color: $grey;
    text-align: center;
    font-size: 14px;
    font-weight: 400;
    text-decoration-line: underline;
    text-decoration-style: dotted;
    text-decoration-skip-ink: auto;
    text-decoration-thickness: 12.5%; /* 1.75px */
    text-underline-offset: auto;
    text-underline-position: from-font;
  }
}
</style>
