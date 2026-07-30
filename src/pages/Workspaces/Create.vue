<template>
  <div class="create-workspace-page">
    <!-- card -->
    <q-card flat class="create-workspace-card">
      <p class="create-header-text">
        Create a Workspace
      </p>

      <q-form
        class="workspace-form full-width"
        ref="saveWorkspaceFormRef"

        @submit.prevent.stop="onSubmitForm"
      >
        <!-- Name -->
        <div class="full-width">
          <InputLabel
            isImportant
            label="Workspace Name"
          />

          <q-input
            dense
            outlined
            autofocus
            hide-bottom-space

            v-model="name"

            lazy-rules="ondemand"
            placeholder="e.g. Acme Inc. Marketing Team"
            :rules="[val => !!val || 'Workspace Name is required']"

            @update:model-value="onNameInputChange"
          />
        </div>

        <!-- Workspace Slug -->
        <div class="full-width">
          <InputLabel
            isImportant
            label="Workspace Slug"
          />

          <q-input
            dense
            outlined
            hide-bottom-space

            v-model="workspaceSlug"

            type="text"
            lazy-rules="ondemand"
            placeholder="e.g. acme-marketing"

            class="workspace-url-input"

            :rules="slugRules"

            @blur="onWorkspaceSlugInputBlur"
            @update:model-value="onWorkspaceSlugInputChange"
          >
            <!-- append -->
            <template v-slot:append>
              <div class="workspace-url-append">
                <p class="url-text">
                  {{ workspaceBaseUrl }}
                </p>
              </div>
            </template>
          </q-input>
        </div>

        <!-- Action -->
        <q-btn
          no-caps
          unelevated

          type="submit"
          color="primary"
          label="Create Workspace"

          :loading="isApiLoading"
        />
      </q-form>

      <!-- Join Existing Workspace -->
      <q-btn
        flat
        no-caps
        unelevated

        color="grey"
        to="/workspace/choose"

        class="join-existing-btn"

        :loading="isApiLoading"
      >
        <p class="join-text">
          Show All Workspaces
        </p>
      </q-btn>

    </q-card>
  </div>
</template>

<script>
// lodash
import kebabCase from 'lodash/kebabCase';

// vue
import {
  defineComponent, reactive, toRefs, getCurrentInstance,
} from 'vue';

// quasar
import { useMeta } from 'quasar';

// Components
import InputLabel from 'components/Form/InputLabel.vue';

// composables
import { useWorkspace } from 'src/composables/useWorkspace';
import useAppHelpersApi from 'src/composables/app-helpers.js';

export default defineComponent({
  name: 'CreateWorkspace',

  components: {
    InputLabel,
  },

  setup() {
    // composables
    const { generateMetadata } = useAppHelpersApi();
    const {
      getWorkspaceUrl,
      workspaceBaseUrl,
      createNewWorkspace,
      getWorkspaceSlugFromInput,
    } = useWorkspace();

    // metadata
    useMeta(generateMetadata('Create Workspace'));

    // app context
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      name: '',
      workspaceSlug: '',

      // ref
      saveWorkspaceFormRef: null,

      //
      isApiLoading: false,
    });

    // methods
    const onInputChange = () => {
      state.saveWorkspaceFormRef.resetValidation();
    };

    const onNameInputChange = () => {
      state.workspaceSlug = kebabCase(state.name);

      onInputChange();
    };

    const onWorkspaceSlugInputChange = () => {
      onInputChange();
    };

    const onWorkspaceSlugInputBlur = () => {
      state.workspaceSlug = getWorkspaceSlugFromInput(state.workspaceSlug);
    };

    const onSubmitForm = async () => {
      try {
        state.isApiLoading = true;

        // payload
        const payload = {
          name: state.name,
          slug: state.workspaceSlug,
        };

        // create new workspace
        await createNewWorkspace(payload);

        const workspaceUrl = getWorkspaceUrl(payload);

        window.open(workspaceUrl);
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    return {
      // state
      ...toRefs(state),

      // computed
      workspaceBaseUrl,

      // methods
      onSubmitForm,
      onNameInputChange,
      onWorkspaceSlugInputBlur,
      onWorkspaceSlugInputChange,

      // rules
      slugRules: [
        (val) => val.length > 3 || 'Minimum of 4 characters required',
      ],
    };
  },
});
</script>

<style lang="scss" scoped>
.create-workspace-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 80px;

  min-height: inherit;
  background: rgba($color: var(--primary-rgb), $alpha: 0.05);

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 24px 12px;
  }

  // sm max
  @media (max-width: $breakpoint-sm-max) {
    padding: 40px 24px;
  }

  .create-workspace-card {
    width: 100%;
    max-width: 580px;

    height: fit-content;

    padding: 60px 80px;

    border-radius: 8px;
    background: $white;
    border: 1px solid $grey-50;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .create-header-text {
      color: $black;
      font-size: 32px;
      font-weight: 600;

      margin-bottom: 24px;
    }

    .workspace-form {
      display: grid;
      grid-row-gap: 24px;

      :deep(.workspace-url-input) {
        .q-field__append {
          color: unset;
          font-size: unset;

          .workspace-url-append {
            display: flex;
            gap: 2px;
            font-size: 14px;
            line-height: 16px; /* 114.286% */

            .url-text {
              color: $grey;
              font-weight: 400;

              margin-right: 2px;
            }
          }
        }
      }
    }

    .join-existing-btn {
      margin-top: 24px;

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

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 40px 12px;
    }

    // sm max
    @media (max-width: $breakpoint-sm-max) {
      padding: 40px 32px;

      .create-header-text {
        font-size: 24px;
      }
    }
  }
}
</style>
