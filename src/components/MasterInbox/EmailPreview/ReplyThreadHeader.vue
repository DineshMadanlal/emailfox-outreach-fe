<template>
  <q-item
    clickable
    class="reply-thread-header"

    @click="$emit('click')"
  >
    <!-- Left -->
    <div class="thread-left-action">
      <!-- Img -->
      <EmailProfilePicture
        :email="fromNameAndEmail.email"
      />

      <div>
        <div class="flex no-wrap items-center">
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

        <p
          class="mail-reciever-text"
        >
          to {{ displayedEmails }}

          <span
            v-if="hiddenToRecipientsCount > 0"
          >
            ,+{{ hiddenToRecipientsCount }} more
          </span>

          <!-- Button -->
          <q-btn
            flat
            no-caps
            rounded
            unelevated

            size="xs"
            color="primary"
            class="thread-more-icon"

            @click.stop
          >
            <LocalSvgIcon
              image="circle-down"
              classes="circle-down-icon"
            />

            <!-- Menu -->
            <q-menu
              auto-close
              v-model="showRecipientsMenu"

              class="no-box-shadow"
            >
              <RecipientDetails
                :from="eachThreadJson.from"
                :toRecipients="toRecipients"
                :ccRecipients="ccRecipients"
                :bccRecipients="bccRecipients"
                :mailedAt="eachThreadJson.date"
              />
            </q-menu>
          </q-btn>
        </p>
      </div>

    </div>

    <q-space />

    <!-- Right action -->
    <div
      v-if="showReplyForwardAction"
      class="thread-right-action"
    >
      <!-- Reply -->
      <q-btn
        flat
        no-caps
        unelevated

        color="primary"
        class="thread-action-btn"

        @click.stop="$emit('onReply')"
      >
        <AppTooltip
          content="Reply"
          :offset="[0, 10]"
        />
        <!--  -->
        <div class="flex no-wrap items-center">
          <LocalSvgIcon
            image="email-reply"
            classes="action-icon"
          />
        </div>
      </q-btn>

      <!-- Forward -->
      <q-btn
        flat
        no-caps
        unelevated
        color="primary"
        class="thread-action-btn forward-action"

        @click.stop="$emit('onForward')"
      >
        <AppTooltip
          content="Forward"
          :offset="[0, 10]"
        />

        <!--  -->
        <div class="flex no-wrap items-center">
          <LocalSvgIcon
            image="email-reply"
            classes="action-icon forward-icon"
          />
        </div>
      </q-btn>

      <!-- More Menu -->
      <q-btn
        dense
        outlined
        unelevated
        @click.stop.prevent

        class="thread-action-btn more-action-btn"
      >
        <!-- more -->
        <LocalSvgIcon
          image="more"
          classes="thread-menu-icon"
        />

        <!--  -->
        <EmailReplyMoreOptions
          @onReply="$emit('onReply')"
          @onForward="$emit('onForward')"
          @showOriginal="$emit('showOriginal')"
        />
      </q-btn>
    </div>
  </q-item>
</template>

<script>
// vue
import {
  defineComponent, computed, toRefs, reactive,
} from 'vue';

// Components
import AppTooltip from 'components/General/AppTooltip.vue';
import RecipientDetails from 'components/MasterInbox/Menu/RecipientDetails.vue';
import EmailReplyMoreOptions from 'components/MasterInbox/Menu/EmailReplyMoreOptions.vue';
import EmailProfilePicture from 'components/MasterInbox/EmailPreview/EmailProfilePicture.vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// utils
import { formateDateInAgo } from 'src/utils/dates';
import { parseEmailFields } from 'src/utils/skyboxApi.js';

// hardcoded constant
const MAX_TO_FIELDS = 3;
const MOBILE_MAX_TO_FIELDS = 1;

export default defineComponent({
  name: 'ReplyThreadHeader',

  emits: ['click', 'onForward', 'onReply', 'showOriginal'],

  components: {
    AppTooltip,
    RecipientDetails,
    EmailProfilePicture,
    EmailReplyMoreOptions,
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
    showReplyForwardAction: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // state
    const state = reactive({
      showRecipientsMenu: false,
    });

    // computed
    const emailRecievedAt = computed(() => formateDateInAgo(props.eachThreadJson.date));

    const maxFields = computed(() => {
      // if mobile, show only 1 to field
      if (isMobileDevice.value) {
        return MOBILE_MAX_TO_FIELDS;
      }

      return MAX_TO_FIELDS;
    });

    const toRecipients = computed(() => {
      const { to } = props.eachThreadJson;

      const emailFields = parseEmailFields(to);

      if (emailFields.length > 0) {
        return emailFields.map((recipient) => ({
          to: true,
          name: recipient.name,
          email: recipient.email,
        }));
      }

      return [];
    });

    const ccRecipients = computed(() => {
      const { cc } = props.eachThreadJson;

      const emailFields = parseEmailFields(cc);

      if (emailFields.length > 0) {
        return emailFields.map((recipient) => ({
          cc: true,
          name: recipient.name,
          email: recipient.email,
        }));
      }

      return [];
    });

    const bccRecipients = computed(() => {
      const { bcc } = props.eachThreadJson;

      const emailFields = parseEmailFields(bcc);

      if (emailFields.length > 0) {
        return emailFields.map((recipient) => ({
          bcc: true,
          name: recipient.name,
          email: recipient.email,
        }));
      }

      return [];
    });

    const combinedRecipients = computed(() => [
      ...toRecipients.value,
      ...ccRecipients.value,
      ...bccRecipients.value,
    ]);

    // slicing top 3 to show in the UI
    const displayedToRecipients = computed(() => {
      if (combinedRecipients.value.length > maxFields.value) {
        const slicedList = combinedRecipients.value.slice(0, maxFields.value);

        const emails = slicedList.map((r) => r.email);

        return emails.join(', ');
      }

      return '';
    });

    const displayedEmails = computed(() => {
      let emailList = combinedRecipients.value;

      if (combinedRecipients.value.length > maxFields.value) {
        emailList = combinedRecipients.value.slice(0, maxFields.value);
      }

      const emails = emailList.map((r) => r.email);

      return emails.join(', ');
    });

    const hiddenToRecipientsCount = computed(() => {
      if (combinedRecipients.value.length > maxFields.value) {
        return combinedRecipients.value.length - maxFields.value;
      }

      return 0;
    });

    return {
      // state
      ...toRefs(state),

      // computed
      emailRecievedAt,
      toRecipients,
      ccRecipients,
      bccRecipients,

      displayedEmails,
      displayedToRecipients,
      hiddenToRecipientsCount,
    };
  },
});
</script>

<style lang="scss" scoped>
.reply-thread-header {
  width: 100%;
  padding: 12px;

  display: flex;
  flex-direction: row;

  .thread-left-action {
    display: flex;
    align-items: center;

    :deep(.circle-dot-icon) {
      margin: 0px 4px;

      height: 4px;
      width: 4px;

      circle {
        fill: $grey;
      }
    }

    .thread-name-avatar {
      width: 100%;
      height: 100%;

      background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);

      padding: 0px;
      display: flex;
      align-items: center;
      justify-content: center;

      .thread-avatar-text {
        color: $secondary;
        font-size: 14px;
        font-weight: 500;
        line-height: 16px; /* 114.286% */
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
      }
    }

    .mail-reciever-text {
      margin-top: 4px;

      color: $black;
      font-size: 13px;
      font-weight: 400;
      line-height: 16px;
    }

    .thread-more-icon {
      width: fit-content;
      min-height: unset;
      font-size: 8px;
      padding: 2px;
    }
  }

  .thread-right-action {
    display: flex;
    align-items: center;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      display: none;
    }

    .thread-action-btn {
      height: 28px;
      width: 28px;
      min-height: unset;

      margin-left: 8px;

      :deep(.action-icon) {
        path {
          stroke: $grey;
        }

        &:hover {
          path {
            stroke: $primary;
          }
        }
      }

      :deep(.forward-icon) {
        transform: rotateY(180deg);
      }
    }
  }

  &:hover {
    background: rgba($color: var(--primary-rgb), $alpha: 0.05);
  }
}
</style>
