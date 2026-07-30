<template>
  <div class="general-settings">
    <!-- Dialog -->
    <q-dialog
      v-model="showDeleteWorkspaceModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <DeleteWorkspace
        @closeModal="showDeleteWorkspaceModal = false"
      />
    </q-dialog>

    <!-- Dialog -->
    <q-dialog
      v-model="showLeaveWorkspaceModal"
      class="app-modal-dialog"

      :transition-show="isMobileDevice ? 'slide-up' : ''"
      :transition-hide="isMobileDevice ? 'slide-down' : ''"
    >
      <LeaveWorkspace
        @closeModal="showLeaveWorkspaceModal = false"
      />
    </q-dialog>

    <!-- Header -->
    <div class="settings-section-header">
      <div class="settings-header-left-side">
        <!-- header text -->
        <p class="settings-header-text">
          General
        </p>

        <!-- label text -->
        <p class="settings-label-text">
          Manage your workspace profile and default preferences.
        </p>
      </div>

      <!-- right side -->
      <div class="settings-header-right-side">
      </div>
    </div>

    <!-- Content -->
    <div class="settings-section-content">
      <!-- Profile Picture -->
      <div class="each-general-details-container top-container">
        <p class="settings-content-header-text add-spacer">
          Profile Picture
        </p>

        <!--  -->
        <div class="workspace-logo-grid">
          <div class="logo-container">
            <!--  -->
            <q-img
              :src="activeWorkspaceJson.logo_url || 'https'"
              class="workspace-logo"
            >
              <!-- error -->
              <template #error>
                <div
                  class="workspace-name-text"
                  :style="{ background: activeWorkspaceJson.logo_bg_color }"
                >
                  {{ getWorkspaceTwoLetterAcronym(activeWorkspaceJson) }}
                </div>
              </template>
            </q-img>
          </div>

          <div>
            <p class="workspace-name">
              {{ activeWorkspaceJson.name }}
            </p>

            <p class="workspace-url">
              {{ activeWorkspaceJson.slug }}{{ workspaceBaseUrl }}
            </p>

            <!-- Update logo -->
            <ImageUpload
              :uniqueId="componentUid"
              @uploadComplete="onImageUploadComplete"

              v-if="isRoleAdminOrAbove"
            >
              <template #fileLabel="{ openFilePicker, isUploading, progress }">
                <label class="upload-picture-label" :for="`upload-picture-${componentUid}`">
                  <q-btn
                    flat
                    dense
                    no-caps
                    unelevated

                    color="primary"

                    :loading="isUploading"
                    :percentage="progress"

                    @click="openFilePicker"
                  >
                    <div class="text-weight-medium">
                      Update Logo
                    </div>
                  </q-btn>
                </label>

              </template>
            </ImageUpload>
          </div>
        </div>
      </div>

      <!-- Basic Details -->
      <div class="each-general-details-container">
        <p class="settings-content-header-text add-spacer">
          Basic Details
        </p>

        <!-- form -->
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
              hide-bottom-space

              v-model="name"

              lazy-rules="ondemand"
              placeholder="e.g. Acme Inc. Marketing Team"

              :readonly="!isRoleAdminOrAbove"
              :rules="[val => !!val || 'Workspace Name is required']"

              @update:model-value="onInputChange"
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
              readonly
              hide-bottom-space

              v-model="workspaceSlug"

              type="text"
              lazy-rules="ondemand"
              placeholder="e.g. acme-marketing"

              class="workspace-url-input"

              :rules="slugRules"

              @blur="onWorkspaceSlugInputBlur"
              @update:model-value="onInputChange"
            >
              <!-- Append -->
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

            class="w-fit"
            type="submit"
            color="primary"
            label="Update Workspace"

            :loading="isUpdatingWorkspace"

            v-if="isRoleAdminOrAbove"
          />
        </q-form>
      </div>

      <!-- Delete Workspace -->
      <div
        v-if="isSuperAdminLoggedIn"
        class="each-general-details-container"
      >
        <p class="settings-content-header-text">
          Delete Workspace
        </p>

        <p class="settings-content-desc-text">
          If you want to permanently delete this workspace and all of its data.
        </p>

        <!-- Delete workspace button -->
        <q-btn
          flat
          no-caps
          unelevated

          color="negative"
          label="Delete Workspace"
          class="light-negative-btn w-fit"

          :loading="isUpdatingWorkspace"

          @click="showDeleteWorkspaceModal = true"
        />
      </div>

      <!-- Leave workspace -->
      <div
        v-else
        class="each-general-details-container"
      >
        <p class="settings-content-header-text">
          Leave Workspace
        </p>

        <p class="settings-content-desc-text">
          You will no longer have access to this workspace unless you are invited again.
        </p>

        <!-- Leave workspace button -->
        <q-btn
          flat
          no-caps
          unelevated

          color="negative"
          label="Leave Workspace"
          class="light-negative-btn w-fit"

          :loading="isUpdatingWorkspace"

          @click="showLeaveWorkspaceModal = true"
        />
      </div>
    </div>
  </div>
</template>

<script>
// quasar
import { useMeta } from 'quasar';

// vue
import {
  defineComponent, toRefs, reactive, onMounted,
  getCurrentInstance, computed,
} from 'vue';

// Components
import InputLabel from 'components/Form/InputLabel.vue';
import ImageUpload from 'components/FileUpload/ImageUpload.vue';
import LeaveWorkspace from 'components/Workspaces/Modals/LeaveWorkspace.vue';
import DeleteWorkspace from 'components/Workspaces/Modals/DeleteWorkspace.vue';

// composables
import { useWorkspace } from 'src/composables/useWorkspace';
import useAppHelpersApi from 'src/composables/app-helpers.js';

export default defineComponent({
  name: 'GeneralSettings',

  components: {
    InputLabel,
    ImageUpload,
    LeaveWorkspace,
    DeleteWorkspace,
  },

  setup() {
    // composables
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();
    const {
      // computed
      workspaceBaseUrl,
      isRoleAdminOrAbove,
      activeWorkspaceJson,
      isSuperAdminLoggedIn,

      // methods
      updateWorkspaceById,
      getWorkspaceSlugFromInput,
      getWorkspaceTwoLetterAcronym,
    } = useWorkspace();

    // metadata
    useMeta(generateMetadata('General Settings'));

    // app context
    const { appContext, uid } = getCurrentInstance();

    // state
    const state = reactive({
      name: '',
      workspaceSlug: '',

      saveWorkspaceFormRef: null,

      showLeaveWorkspaceModal: false,
      showDeleteWorkspaceModal: false,

      // loading states
      isUpdatingWorkspace: false,
    });

    // computed
    const isWorkspaceOwnerLoggedIn = computed(
      () => activeWorkspaceJson.value?.is_current_user_owner,
    );

    const componentUid = computed(() => uid);

    // methods
    const onInputChange = () => {
      state.saveWorkspaceFormRef.resetValidation();
    };

    const onWorkspaceSlugInputBlur = () => {
      state.workspaceSlug = getWorkspaceSlugFromInput(state.workspaceSlug);
    };

    const onImageUploadComplete = async ({ fileUrl }) => {
      state.imageUploadingPercentage = 0;

      try {
        const payload = {
          ...activeWorkspaceJson.value,
          logo_url: fileUrl,
        };

        await updateWorkspaceById(
          activeWorkspaceJson.value.id,
          payload,
        );
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      }
    };

    const onSubmitForm = async () => {
      try {
        state.isUpdatingWorkspace = true;

        const payload = {
          ...activeWorkspaceJson.value,
          name: state.name,
          slug: state.workspaceSlug,
        };

        await updateWorkspaceById(
          activeWorkspaceJson.value.id,
          payload,
        );
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isUpdatingWorkspace = false;
      }
    };

    // lifecycle hook
    onMounted(() => {
      if (activeWorkspaceJson.value) {
        state.name = activeWorkspaceJson.value.name;
        state.workspaceSlug = activeWorkspaceJson.value.slug;
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isMobileDevice,
      componentUid,
      workspaceBaseUrl,
      activeWorkspaceJson,
      isWorkspaceOwnerLoggedIn,
      isRoleAdminOrAbove,
      isSuperAdminLoggedIn,

      // methods
      onSubmitForm,
      onInputChange,
      onImageUploadComplete,
      onWorkspaceSlugInputBlur,
      getWorkspaceTwoLetterAcronym,

      // rules
      slugRules: [
        (val) => val.length > 3 || 'Minimum of 4 characters required',
      ],
    };
  },
});
</script>

<style lang="scss" scoped>
.general-settings {
  width: 100%;

  .settings-content-header-text {
    color: $black;
    font-size: 16px;
    font-weight: 600;

    &.add-spacer {
      margin-bottom: 20px;
    }
  }

  .settings-content-desc-text {
    margin-top: 4px;
    margin-bottom: 16px;

    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 22px;
  }

  .each-general-details-container {
    width: 100%;
    padding: 32px 0px;

    border-top: 1px solid $grey-50;

    &.top-container {
      border-top: 0px;
      padding: 0px 0px 32px 0px;
    }

    .workspace-logo-grid {
      display: flex;
      gap: 16px;

      flex-wrap: wrap;

      .logo-container {
        min-height: 98px;
        min-width: 98px;

        max-height: 98px;
        max-width: 98px;

        .workspace-logo {
          height: 100%;
          width: 100%;
          border-radius: 5px;
        }

        .workspace-name-text {
          height: 100%;
          width: 100%;

          display: flex;
          align-items: center;
          justify-content: center;

          text-transform: uppercase;

          border-radius: 5px;

          color: $white;
          text-align: center;
          font-size: 32px;
          font-weight: 600;
          letter-spacing: 0.64px;

          background: inherit;
        }
      }

      .workspace-name {
        color: $black;
        font-size: 14px;
        font-weight: 600;
        line-height: 16px; /* 114.286% */
      }

      .workspace-url {
        color: $grey;
        font-size: 14px;
        font-weight: 400;
        line-height: 16px; /* 114.286% */

        margin-top: 8px;
        margin-bottom: 10px;
      }
    }

    .workspace-form {
      display: grid;
      grid-row-gap: 24px;
      max-width: 420px;

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

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px;
    }
  }
}
</style>
