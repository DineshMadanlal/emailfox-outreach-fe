<template>
  <q-card flat class="app-modal-card edit-member-card">
    <q-form
      class="full-width"
      ref="saveTeamMemberFormRef"

      @submit.prevent.stop="onUpdateMember"
    >
      <!-- header -->
      <div class="app-modal-header">
        <!--  -->
        <h4 class="modal-header-text">
          Edit Role
        </h4>

        <q-space />

        <!-- Close -->
        <q-btn
          flat
          round
          dense
          v-close-popup

          color="negative"
          class="app-negative-button"
        >
          <LocalSvgIcon
            image="close"
            classes="app-negative-icon"
          />
        </q-btn>
      </div>

      <!-- content -->
      <div class="app-modal-content">
        <div class="edit-member-wrapper">
          <!-- Name -->
          <!-- <div class="full-width">
            <InputLabel
              isImportant
              label="Name"
            />

            <q-input
              dense
              outlined
              readonly
              hide-bottom-space

              v-model="name"
            />
          </div> -->

          <!-- Email -->
          <div class="full-width">
            <InputLabel
              isImportant
              label="Email"
            />

            <!--  -->
            <q-input
              dense
              outlined
              readonly
              hide-bottom-space

              v-model="email"
            />
          </div>

          <!-- Role -->
          <div class="full-width">
            <InputLabel
              isImportant
              label="Role"
            />

            <MemberRoles
              outlined
              v-model="role"
            />
          </div>
        </div>
      </div>

      <!-- footer -->
      <div class="app-modal-footer">
        <!-- save button -->
        <q-btn
          no-caps
          unelevated

          label="Save"
          type="submit"
          color="primary"

          :loading="isApiLoading"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, onMounted, reactive, toRefs, getCurrentInstance,
} from 'vue';

// Components
import InputLabel from 'components/Form/InputLabel.vue';
import MemberRoles from 'components/Dropdown/MemberRoles.vue';

// utils
import { patchApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'EditMember',

  components: {
    InputLabel,
    MemberRoles,
  },

  props: {
    editMemberData: {
      type: Object,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      name: '',
      email: '',
      role: '',

      // ref
      saveTeamMemberFormRef: null,

      // loading
      isApiLoading: false,
    });

    // methods
    const onUpdateMember = async () => {
      try {
        state.isApiLoading = true;

        const payload = {
          role: state.role,
          is_active: true,
        };

        await patchApiCall({
          endpoint: `/members/${props.editMemberData.user_id}`,
          payload,
        });

        // show toaster
        appContext.config.globalProperties.$toast({
          message: 'Member Role updated successfully',
          color: 'positive',
        });

        emit('onMemberUpdated', {
          ...props.editMemberData,
          ...payload,
        });
      } catch (error) {
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message,
        });
      } finally {
        state.isApiLoading = false;
      }
    };

    onMounted(() => {
      // Populate form fields with existing member data when the component is mounted
      state.name = props.editMemberData.name || '';
      state.email = props.editMemberData.email || '';
      state.role = props.editMemberData.role || '';
    });

    return {
      // state
      ...toRefs(state),

      // methods
      onUpdateMember,
    };
  },
});
</script>

<style lang="scss" scoped>
.edit-member-card {
  max-width: 600px;

  .app-modal-content {
    .edit-member-wrapper {
      width: 100%;
      max-width: 420px;

      display: grid;
      grid-row-gap: 24px;
    }
  }
}
</style>
