<template>
  <div class="domain-mailboxes-page">
    <MailboxesTable
      :addedFilters="{
        domain_id: domainByJson.id
      }"
    />
  </div>
</template>
<script>
// vue
import { defineComponent } from 'vue';

// Components
import MailboxesTable from 'components/Mailboxes/MailboxesTable.vue';

export default defineComponent({
  name: 'DomainMailboxes',

  props: {
    domainByJson: {
      type: Object,
      required: true,
    },
  },

  components: {
    MailboxesTable,
  },
});
</script>

<style lang="scss" scoped>
.domain-mailboxes-page {
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: relative;
  flex: 1;
}
</style>
