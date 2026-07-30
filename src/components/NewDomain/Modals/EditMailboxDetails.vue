<template>
  <q-card flat class="app-modal-card edit-mailbox-details">
    <q-form
      class="edit-mailbox-form"
      ref="saveMailboxFormRef"

      @submit.prevent.stop="onSaveMailbox"
    >
      <!-- header -->
      <div class="app-modal-header">
        <!--  -->
        <h4 class="modal-header-text">
          Edit Mailbox
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

      <!-- Content -->
      <div class="app-modal-content">
        <!-- First Name -->
        <div class="full-width">
          <!--  -->
          <InputLabel
            isImportant
            label="First Name"
          />

          <!--  -->
          <q-input
            dense
            outlined
            hide-bottom-space

            v-model="firstName"

            name="firstname"
            lazy-rules="ondemand"
            class="app-input-field-height"

            :rules="firstNameRules"

            @update:model-value="onFirstNameInputChange"
          />
        </div>

        <!-- Last Name -->
        <div class="full-width">
          <!--  -->
          <InputLabel
            isImportant
            label="Last Name"
          />

          <!--  -->
          <q-input
            dense
            outlined
            hide-bottom-space

            v-model="lastName"

            name="lastname"
            lazy-rules="ondemand"
            class="app-input-field-height"

            :rules="lastNameRules"

            @update:model-value="onLastNameInputChange"
          />
        </div>

        <!-- Email -->
        <div class="full-width">
          <!--  -->
          <InputLabel
            isImportant
            label="Email"
          />

          <!--  -->
          <q-input
            dense
            outlined
            hide-bottom-space
            v-model="email"
            lazy-rules="ondemand"
            class="app-input-field-height"
            :rules="emailRules"
            @update:model-value="onInputChange"
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="app-modal-footer">
        <!-- Update -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="Update"
          class="q-mr-md"
          type="submit"
        />

        <!-- Cancel -->
        <q-btn
          flat
          no-caps
          unelevated
          v-close-popup

          label="Cancel"
          color="primary"

          class="light-primary-btn"
        />
      </div>
    </q-form>
  </q-card>
</template>

<script>
// vue
import {
  defineComponent, reactive, toRefs, computed,
  onMounted,
} from 'vue';

// components
import InputLabel from 'components/Form/InputLabel.vue';

export default defineComponent({
  name: 'EditMailboxDetails',

  emits: ['onUpdateMailboxDetails'],

  components: {
    InputLabel,
  },

  props: {
    mailboxDetails: {
      type: Object,
      required: true,
    },
    domainEmailEntries: {
      type: Array,
      required: true,
    },
  },

  setup(props, { emit }) {
    // state
    const state = reactive({
      saveMailboxFormRef: null,
      firstName: '',
      lastName: '',
      email: '',
    });

    // computed
    const alreadyAddedMailboxes = computed(() => {
      const currentEmail = props.mailboxDetails.email;

      const alreadyAddedEmails = [];

      props.domainEmailEntries.forEach((entry) => {
        if (entry.email !== currentEmail) {
          alreadyAddedEmails.push(entry.email);
        }
      });

      return alreadyAddedEmails;
    });

    // methods
    const onInputChange = () => {
      state.saveMailboxFormRef.resetValidation();
    };

    const onFirstNameInputChange = (val) => {
      // trim the value
      state.firstName = val?.trim();
      onInputChange();
    };

    const onLastNameInputChange = (val) => {
      state.lastName = val?.trim();
      onInputChange();
    };

    const onSaveMailbox = () => {
      emit('onUpdateMailboxDetails', {
        first_name: state.firstName,
        last_name: state.lastName,
        email: state.email,
        password: props.mailboxDetails.password,
      });
    };

    onMounted(() => {
      const { first_name, last_name, email } = props.mailboxDetails;
      // populate initial values
      state.firstName = first_name;
      state.lastName = last_name;
      state.email = email;
    });

    return {
      // state
      ...toRefs(state),

      // methods
      onInputChange,
      onSaveMailbox,
      onLastNameInputChange,
      onFirstNameInputChange,

      firstNameRules: [
        (val) => val.length > 2 || 'Minimum of 3 characters required',
      ],
      lastNameRules: [
        (val) => val.length > 0 || 'Minimum of 1 characters required',
      ],

      emailRules: [
        (val) => val.length > 0 || 'Email is required',
        (val) => !alreadyAddedMailboxes.value.includes(val)
          || 'This email is already added',
      ],
    };
  },
});
</script>

<style lang="scss" scoped>
.edit-mailbox-details {
  max-width: 600px;

  .edit-mailbox-form {
    width: 100%;
    height: 100%;
    display: grid;
    grid-template-rows: auto 1fr auto;
  }

  .app-modal-content {
    display: grid;
    grid-row-gap: 20px;
  }
}
</style>
