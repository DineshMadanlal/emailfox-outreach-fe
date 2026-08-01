<template>
  <q-menu
    auto-close
    transition-show="jump-down"
    transition-hide="jump-up"
    content-class="bg-white text-dark"
  >
    <!-- List -->
    <q-list style="min-width: 202px" class="contacts-action-list">
      <!-- Edit -->
      <!-- <q-item
        v-ripple
        clickable
        class="flex items-center each-contact-action-item"
        @click="onEditContact"
      >
        <LocalSvgIcon image="edit" classes="contact-menu-icon" />

        <p class="contact-action-text">
          Edit Contact
        </p>
      </q-item> -->

      <!-- Mark as Inactive -->
      <!-- <q-item
        v-ripple
        clickable
        class="flex items-center each-contact-action-item"
        @click="$emit('viewDetails', contactJson)"
      >
        <LocalSvgIcon image="info-circle" classes="contact-menu-icon" />

        <p class="contact-action-text">
          View Details
        </p>
      </q-item> -->

      <!-- Delete -->
      <q-item
        v-ripple
        clickable
        class="flex items-center each-contact-action-item delete-contact-item"
        @click="ondeleteContact"
      >
        <LocalSvgIcon image="delete" classes="contact-menu-icon delete-icon" />

        <p class="contact-action-text">
          Delete Contact
        </p>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ContactsMoreOptions',

  emits: ['viewDetails', 'deleteContact'],

  props: {
    contactJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
  },

  setup(props, { emit }) {
    // methods
    const onEditContact = () => {
    };

    const ondeleteContact = () => {
      emit('deleteContact', props.contactJson);
    };

    return {
      // methods
      onEditContact,
      ondeleteContact,
    };
  },
});
</script>

<style lang="scss" scoped>
.contacts-action-list {

  .each-contact-action-item {
    padding: 10px 12px;
    min-height: unset;

    .contact-action-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */

      margin-left: 8px;
    }

    :deep(.contact-menu-icon) {
      @include svg-icon-stroke('path, circle, rect', $grey);
    }

    &:hover {
      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
    }

    &.delete-contact-item {
      :deep(.contact-menu-icon) {
        @include svg-icon-stroke('path, circle, rect', $negative);
      }

      .contact-action-text {
        color: $negative;
      }

      &:hover {
        background-color: rgba($color: var(--negative-rgb), $alpha: 0.1);
      }
    }
  }
}
</style>
