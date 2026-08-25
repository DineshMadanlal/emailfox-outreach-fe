<template>
  <div class="workspace-loader">
    <!--  -->
    <q-spinner-bars size="68px" color="primary" />

    <!-- loader text -->
    <p class="loader-text">
      Setting up your workspace...
    </p>
  </div>
</template>

<script>
// vue
import {
  defineComponent, onMounted, watch, getCurrentInstance,
} from 'vue';

// composables
import { useWorkspace } from 'src/composables/useWorkspace';

// vue-router
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'WorkspaceLoader',

  setup() {
    // router
    const $router = useRouter();

    // composables
    const {
      // computed
      isWorkspaceValid,
      workspacesLoaded,
      isWorkspaceApiLoading,

      // methods
      fetchAllWorkspaces,
    } = useWorkspace();

    // app context
    const { appContext } = getCurrentInstance();

    // methods
    const onAppMounted = async () => {
      try {
        await fetchAllWorkspaces();
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      }
    };

    // lifecycle hook
    onMounted(() => {
      onAppMounted();
    });

    watch(
      () => ({
        isWorkspaceValidNew: isWorkspaceValid.value,
        isWorkspaceApiLoadingNew: isWorkspaceApiLoading.value,
        workspacesLoadedNew: workspacesLoaded.value,
      }),
      ({ isWorkspaceValidNew, isWorkspaceApiLoadingNew, workspacesLoadedNew }) => {
        console.log('WorkspaceLoader watch triggered:', {
          isWorkspaceValidNew,
          isWorkspaceApiLoadingNew,
          workspacesLoadedNew,
        });
        if (
          workspacesLoadedNew
          && !isWorkspaceApiLoadingNew
          && !isWorkspaceValidNew
        ) {
          $router.push('outreach-workspace-not-found');
        }
      },
      { immediate: true },
    );
  },
});
</script>

<style lang="scss" scoped>
.workspace-loader {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;

  min-height: inherit;
  background: rgba($color: var(--primary-rgb), $alpha: 0.05);

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 12px;
  }

  .loader-text {
    color: $grey;
    text-align: center;
    font-size: 18px;
    font-style: italic;
    font-weight: 400;

    margin-top: 32px;
  }
}
</style>
