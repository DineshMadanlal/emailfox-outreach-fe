<template>
  <q-card
    class="contact-cell-card"
  >
    <p class="contact-cell-card-label-text">
      {{ contact.label }}
    </p>

    <p class="contact-cell-card-content-text">
      {{ contact.content }}
    </p>
  </q-card>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ContactCellCard',

  props: {
    contact: {
      type: Object,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.contact-cell-card {
  max-width: 500px;
  white-space: pre-wrap;

  .contact-cell-card-label-text {
    padding: 8px 16px;
    font-weight: 500;
    border-bottom: 1px solid $grey-50;

    font-weight: 16px;
  }

  .contact-cell-card-content-text {
    padding: 8px 16px;
  }
}
</style>
