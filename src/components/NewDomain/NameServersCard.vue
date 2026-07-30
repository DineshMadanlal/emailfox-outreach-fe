<template>
  <q-card
    flat
    class="name-servers-entries-card"
  >
    <!--  -->
    <q-dialog
      seamless
      position="right"
      class="app-modal-dialog--right-positioned"
      v-model="showUpdateNameServersHelpArticleModal"
    >
      <UpdateNameServersHelpArticle
      />
    </q-dialog>

    <!-- Grid -->
    <div class="name-servers-grid">
      <div
        v-for="(ns, index) in nameServers"
        :key="`ns-record-${index}`"
        class="each-ns-entry"
      >
        <p class="ns-entry-text">
          {{ ns }}
        </p>

        <q-btn
          flat
          dense

          class="header-action-btn"

          @click="onCopyNameServer(ns)"
        >
          <LocalSvgIcon image="copy" classes="copy-icon" />
        </q-btn>
      </div>
    </div>

    <q-item
      clickable
      class="learn-dns-steps-block"

      @click="showUpdateNameServersHelpArticleModal = true"
    >
      <div class="flex no-wrap items-center">
        <LocalSvgIcon
          image="circle-question"
          class="question-circle-icon"
        />
        <p class="learn-dns-steps-text">
          Learn Steps to Update Domain Name Server?
        </p>
      </div>
    </q-item>
  </q-card>
</template>
<script>
// vue
import {
  defineComponent, getCurrentInstance, reactive, toRefs,
} from 'vue';

// quasar
import { copyToClipboard } from 'quasar';

// components
import UpdateNameServersHelpArticle from 'components/NewDomain/Modals/UpdateNameServersHelpArticle.vue';

export default defineComponent({
  name: 'NameServersCard',

  components: {
    UpdateNameServersHelpArticle,
  },

  props: {
    nameServers: {
      type: Array,
      required: true,
    },
  },

  setup() {
    const { appContext } = getCurrentInstance();

    // state
    const state = reactive({
      showUpdateNameServersHelpArticleModal: false,
    });

    // methods
    const onCopyNameServer = (ns) => {
      // copy api key using clipboard
      copyToClipboard(ns).then(() => {
        // show toast
        appContext.config.globalProperties.$toast({
          message: 'Name server copied successfully',
        });
      });
    };

    return {
      // state
      ...toRefs(state),

      // methods
      onCopyNameServer,
    };
  },
});
</script>

<style lang="scss" scoped>
.name-servers-entries-card {
  width: 100%;
  padding: 16px;

  border-radius: 8px;
  border: 1px solid $grey-100;
  background: rgba($color: var(--grey-50-rgb), $alpha: 0.3);

  .name-servers-grid {
    display: grid;
    grid-row-gap: 6px;
    padding-bottom: 16px;
    margin-bottom: 16px;
    border-bottom: 1px solid $grey-50;

    .each-ns-entry {
      display: flex;
      align-items: center;

      .ns-entry-text {
        color: $primary;
        font-size: 14px;
        font-style: normal;
        font-weight: 500;
        line-height: 24px; /* 171.429% */
        min-width: 175px;
        margin-right: 4px;
      }
    }
  }

  .learn-dns-steps-block {
    width: fit-content;
    padding: 0px;
    min-height: unset;
    border-radius: 4px;

    .learn-dns-steps-text {
      color: $grey;
      font-size: 13px;
      font-weight: 400;
      line-height: 16px; /* 123.077% */
      text-decoration-line: underline;
      text-decoration-style: solid;
      text-decoration-skip-ink: none;
      text-decoration-thickness: auto;
      text-underline-offset: auto;

      margin-left: 8px;
    }
  }
}
</style>
