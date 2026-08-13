<template>
  <q-card flat class="app-modal-card import-list-preferences">
    <!-- header -->
    <div class="app-modal-header">
      <!--  -->
      <h4 class="modal-header-text">
        Import Preferences
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
      <!--  -->
      <p class="import-desc-text">
        Control how your contacts are imported. Choose whether to include contacts from restricted
        lists or skip duplicates across your account.
      </p>

      <div class="import-preferences-grid">
        <div
          class="each-import-option"

          v-for="(option, index) in importPreferences"
          :key="`import-option-${index}`"
        >
          <div>
            <p class="import-label-text">
              {{ option.label }}
            </p>

            <p class="import-sub-text">
              {{ option.description }}
            </p>
          </div>

          <q-space />

          <ToggleInput
            v-model="preferences[option.value]"
          />
        </div>
      </div>
    </div>

    <!-- footer -->
    <div class="app-modal-footer">
      <!-- Save -->
      <q-btn
        no-caps
        unelevated

        label="Save"
        color="primary"

        @click="$emit('onSave', preferences)"
      />
    </div>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed,
} from 'vue';

// Components
import ToggleInput from 'components/Input/ToggleInput.vue';

// constants
import { IMPORT_PREFERENCES_DEFAULTS } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'ImportListPreferences',

  emits: ['onSave'],

  components: {
    ToggleInput,
  },

  setup() {
    // state
    const state = reactive({
      preferences: {
        ...IMPORT_PREFERENCES_DEFAULTS,
      },
    });

    // computed
    const importPreferences = computed(() => {
      const options = [
        // Skip contacts already in other sequences
        {
          label: 'Skip contacts already in other sequences',
          value: 'skip_contact_already_in_other_sequence',
          description: 'Skip contacts that are already in other sequences to avoid duplicates.',
        },

        // allow blocklist contacts
        {
          label: 'Allow blocklist contacts',
          value: 'allow_blocklist_contacts',
          description: 'Include contacts that are on your blocklist in the import.',
        },

        // include unsubscribed contacts
        {
          label: 'Include unsubscribed contacts',
          value: 'include_unsubscribed_contacts',
          description: 'Include contacts that have unsubscribed from your emails in the import.',
        },
      ];

      return options;
    });

    return {
      // state
      ...toRefs(state),

      // computed
      importPreferences,
    };
  },
});
</script>

<style lang="scss" scoped>
.import-list-preferences {
  max-width: 650px;

  .app-modal-content {
    padding: 4px;

    .import-desc-text {
      padding: 16px;
      font-size: 14px;
      font-weight: 400;

      color: rgba(var(--black-rgb), 0.8);

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 16px 12px;
      }
    }

    .import-preferences-grid {
      width: 100%;
      margin-bottom: 12px;

      .each-import-option {
        width: 100%;
        display: flex;
        gap: 12px;
        padding: 16px;
        border-bottom: 1px solid $grey-50;

        // last child
        &:last-child {
          border-bottom: none;
        }

        .import-label-text {
          font-size: 14px;
          font-weight: 500;
          line-height: 16px;
        }

        .import-sub-text {
          font-size: 14px;
          font-weight: 400;
          color: $grey;
          margin-top: 8px;
        }

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          padding: 16px 12px;
          flex-direction: column;
        }
      }
    }
  }
}
</style>
