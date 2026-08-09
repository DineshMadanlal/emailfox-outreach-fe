<template>
  <q-card flat class="app-modal-card save-list-name-card">
    <q-form
      class="full-width"
      ref="saveListNameFormRef"

      @submit.prevent.stop="onSaveName"
    >
      <!-- header -->
      <div class="app-modal-header">
        <h4 class="modal-header-text">
          {{ isNewList ? 'Create New' : 'Edit' }} List
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
        <!-- Name -->
        <div class="full-width">
          <InputLabel
            isImportant
            label="Name"
          />

          <q-input
            dense
            outlined
            autofocus
            hide-bottom-space

            v-model="listName"

            lazy-rules="ondemand"
            class="input-width-maxed"
            placeholder="e.g. Q3 Campaign"
            :rules="[val => !!val || 'Name is required']"

            @update:model-value="onInputChange"
          />
        </div>
      </div>

      <!-- footer -->
      <div class="app-modal-footer">
        <!-- Create/Update -->
        <q-btn
          no-caps
          unelevated

          type="submit"
          color="primary"
          :loading="isApiLoading"
          :label="isNewList ? 'Create' : 'Update'"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// lodash
import isEmpty from 'lodash/isEmpty';

// vue
import {
  computed, defineComponent, getCurrentInstance, onMounted, reactive, toRefs,
} from 'vue';

// Components
import InputLabel from 'components/Form/InputLabel.vue';

// Utils
import { postApiCall, putApiCall } from 'src/utils/apiRequests';

export default defineComponent({
  name: 'SaveListName',

  emits: ['onUpdateList', 'newCreatedList'],

  components: {
    InputLabel,
  },

  props: {
    listJson: {
      type: Object,
      default: () => {},
    },
    prefillListNameAndSave: {
      type: String,
      default: '',
    },
  },

  setup(props, { emit }) {
    // instance
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      listName: '',
      isApiLoading: false,
      saveListNameFormRef: null,
    });

    // computed
    const isNewList = computed(() => isEmpty(props.listJson));

    // methods
    const createNewList = async () => {
      try {
        const payload = {
          name: state.listName,
        };

        const response = await postApiCall({
          payload,
          endpoint: '/lists',
          includeWorkspace: true,
        });

        emit('newCreatedList', response);
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to create new campaign. Please try again later.',
        });
      }
    };

    const updatelistName = async () => {
      try {
        const payload = {
          name: state.listName,
        };

        // update API
        await putApiCall({
          includeWorkspace: true,
          endpoint: `/lists/${props.listJson.id}`,
          payload,
        });

        emit('onUpdateList', {
          ...props.listJson,
          name: state.listName,
        });
      } catch (error) {
        // show toast
        appContext.config.globalProperties.$toast({
          warning: true,
          message: error.message || 'Failed to update the campaign name. Please try again later.',
        });
      }
    };

    const onSaveName = async () => {
      state.isApiLoading = true;

      if (isNewList.value) {
        await createNewList();
      } else {
        await updatelistName();
      }

      state.isApiLoading = false;
    };

    const onInputChange = () => {
      state.saveListNameFormRef.resetValidation();
    };

    onMounted(() => {
      // set initial name
      if (props.prefillListNameAndSave) {
        state.listName = props.prefillListNameAndSave;

        // auto save
        onSaveName();
      } else if (!isNewList.value) {
        state.listName = props.listJson.name;
      }
    });

    return {
      // state
      ...toRefs(state),

      // computed
      isNewList,

      // methods
      onSaveName,
      onInputChange,
    };
  },
});
</script>

<style lang="scss" scoped>
.save-list-name-card {
  max-width: 600px;

  .app-modal-footer {
    gap: 16px;
  }

  .app-modal-content {
    display: flex;
    flex-direction: column;
    gap: 24px;

    .input-width-maxed {
      width: 100%;
      max-width: 424px;
    }

    .campaign-options-flex {
      gap: 20px;
      width: 100%;
      display: flex;

      .campaign-option-card {
        width: 100%;
        border-radius: 8px;
        border: 1px solid $grey-50;
        background: $white;
        cursor: pointer;

        &:hover {
          border: 1px solid rgba(var(--primary-rgb), 0.1);
          background: rgba(var(--primary-rgb), 0.02);
        }

        &.selected {
          border: 1px solid rgba(var(--primary-rgb), 0.1);
          background: rgba(var(--primary-rgb), 0.04);
        }

        :deep(.each-campaign-option-radio) {
          padding: 20px 16px;
          align-items: flex-start;

          .radio-header-img-flex {
            display: flex;
            gap: 8px;
            align-items: center;

            .radio-header-text {
              color: $black;
              font-size: 14px;
              font-weight: 500;
            }

            .mail-icon {
              width: 14px;

              @include svg-icon-stroke('rect, path', $warning);
            }
          }

          .radio-desc-text {
            margin-top: 4px;

            color: $grey;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
          }

          .q-radio__inner {
            position: relative;
            top: 2px
          }

          // xs max
          @media (max-width: $breakpoint-xs-max) {
            padding: 16px 12px;
          }
        }
      }

      // sm max
      @media (max-width: $breakpoint-sm-max) {
        flex-wrap: wrap;
      }
    }
  }
}
</style>
