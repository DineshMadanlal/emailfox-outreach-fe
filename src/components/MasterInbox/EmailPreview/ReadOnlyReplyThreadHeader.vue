<template>
  <q-item
    clickable
    @click="$emit('click')"
    class="read-only-reply-header"
  >
    <!-- Left -->
    <div class="thread-left-action">
      <!-- Img -->
      <EmailProfilePicture
        :email="fromNameAndEmail.email"
      />

      <!--  -->
      <div class="email-basic-details">
        <div class="user-details">
          <p class="mail-from-text">
            <b>
              {{ fromNameAndEmail.from }}
            </b>

            <span>({{ fromNameAndEmail.email }})</span>

            <!-- Circle dot spacer -->
            <LocalSvgIcon
              image="circle-dot"
              classes="circle-dot-icon"
            />

            <span>{{ emailRecievedAt }}</span>
          </p>
        </div>

        <div class="plain-text-container">
          <p class="plain-text-html ellipsis">
            {{ eachThreadJson.message_preview }}
          </p>
        </div>
      </div>

    </div>
  </q-item>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// utils
import { formateDateInAgo } from 'src/utils/dates';

// Components
import EmailProfilePicture from 'components/MasterInbox/EmailPreview/EmailProfilePicture.vue';

export default defineComponent({
  name: 'ReplyThreadHeader',

  components: {
    EmailProfilePicture,
  },

  props: {
    fromNameAndEmail: {
      type: Object,
      required: true,

      default: () => ({}),
    },
    eachThreadJson: {
      type: Object,
      required: true,

      default: () => ({}),
    },
  },

  setup(props) {
    // computed
    const emailRecievedAt = computed(() => formateDateInAgo(props.eachThreadJson.date));

    return {
      // computed
      emailRecievedAt,
    };
  },
});
</script>

<style lang="scss" scoped>
.read-only-reply-header {
  width: 100%;
  cursor: pointer;
  padding: 12px;

  .thread-left-action {
    display: flex;

    min-width: 0;
    text-overflow: ellipsis;

    :deep(.circle-dot-icon) {
      margin: 0px 4px;

      height: 4px;
      width: 4px;

      circle {
        fill: $grey;
      }
    }

    .email-basic-details {
      display: flex;
      flex-direction: column;

      .user-details {
        width: fit-content;
        display: flex;
        align-items: center;
      }
    }

    .mail-from-text {
      color: $black;
      font-size: 14px;
      line-height: 16px;

      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 2px;

      span {
        font-size: 13px;
        line-height: 16px;
      }
    }

    .plain-text-container {
      display: grid;
      grid-template-columns: auto;

      .plain-text-html {
        margin-top: 4px;

        color: $grey;
        font-size: 14px;
        font-weight: 400;
        line-height: 20px; /* 142.857% */

        width: 100%;
        max-width: 100%;
      }
    }
  }

  &:hover {
    background: rgba($color: var(--primary-rgb), $alpha: 0.05);
  }
}
</style>
