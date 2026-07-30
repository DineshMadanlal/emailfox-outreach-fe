<template>
  <div class="list-contacts-progress-page">

  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ListContactsProgress',

  props: {
    listId: {
      type: Number,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
.list-contacts-progress-page {
  width: 100%;
}
</style>
