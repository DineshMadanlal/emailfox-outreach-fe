<template>
  <q-item
    clickable

    class="master-inbox-email-list-item"
    :class="{
      active: isActive, unread: emailJson.is_unread
    }"

    @click="$emit('click')"
  >
    <div class="active-bar" />

    <q-item
      clickable
      v-ripple:warning
      class="thread-action-item"

      @click.stop="$emit('toggleEmailImportance')"
      v-if="threadTypeJson.showImportant"
    >
      <LocalSvgIcon
        image="star"
        classes="star-icon"
        :class="emailJson.is_important ? 'important' : ''"
      />
    </q-item>

    <SkyboxListItemProfilePicture
      :email="fromEmail"
    />

    <!--  -->
    <div
      v-if="mini"
      class="full-width"
    >
      <!-- name -->
      <p class="master-inbox-name-text">
        <span
          class="to-type-text"
          v-if="threadTypeJson.isSent"
        >
          To:
        </span>
        {{ fromName }}
      </p>

      <!-- email -->
      <p
        class="master-inbox-email-text"
      >
        {{ fromEmail }}
      </p>

      <div
        class="flex no-wrap items-center w-fit"
      >
        <LocalSvgIcon
          image="circle-dot"
          classes="circle-dot-icon"

          v-if="emailJson.is_unread"
        />

        <!-- Subject -->
        <p class="master-inbox-subject-text ellipsis">
          {{ emailJson.subject }}
        </p>
      </div>
    </div>

    <!--  -->
    <div
      v-else
      class="full-width"
    >
      <div class="email-basic-details">
        <span
          class="to-type-text"
          v-if="threadTypeJson.isSent"
        >
          To:
        </span>

        <!-- name -->
        <p class="master-inbox-name-text">
          {{ fromName }}
        </p>

        <LocalSvgIcon
          image="circle-dot"
          classes="circle-spacer"

          v-if="fromName"
        />

        <!-- email -->
        <p class="master-inbox-email-text">
          {{ fromEmail }}
        </p>
      </div>

      <!--  -->
      <div class="flex no-wrap items-center w-fit">
        <LocalSvgIcon
          image="circle-dot"
          classes="circle-dot-icon"

          v-if="emailJson.is_unread"
        />

        <!-- Subject -->
        <p class="master-inbox-subject-text ellipsis">
          {{ emailJson.subject }}
        </p>
      </div>
    </div>

    <p class="mail-time-text">
      {{ formateDateInAgo(emailJson.latest_time) }}
    </p>
  </q-item>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// composition api
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Utils
import { formateDateInAgo } from 'src/utils/dates';
import { getFromAndEmailJson } from 'src/utils/skyboxApi.js';

// Components
import SkyboxListItemProfilePicture from 'components/MasterInbox/SkyboxListItemProfilePicture.vue';

export default defineComponent({
  name: 'SkyBoxEmailListItem',

  emits: ['click', 'toggleEmailImportance'],

  components: {
    SkyboxListItemProfilePicture,
  },

  props: {
    emailJson: {
      type: Object,
      default: () => ({}),
    },
    threadTypeJson: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    activeThreadId: {
      type: Number,
      default: null,
    },
  },

  setup(props) {
    // composables
    const { isMobileDevice } = useAppHelpersApi();

    // computed
    const mini = computed(() => !!props.activeThreadId || isMobileDevice.value);
    const isActive = computed(() => props.activeThreadId === props.emailJson.thread_id);

    const fromNameAndEmail = computed(() => {
      if (props.threadTypeJson.isBounced) {
        const match = props.emailJson.message_preview.match(/<([^<>@\s]+@[^<>@\s]+)>/);

        const email = match ? match[1] : '';

        return {
          email,
          from: email.split('@')[0],
        };
      }

      const from = props.emailJson.from || props.emailJson.to;

      return getFromAndEmailJson(from);
    });

    const fromName = computed(() => fromNameAndEmail.value.from);
    const fromEmail = computed(() => fromNameAndEmail.value.email);

    return {
      // computed
      mini,
      isActive,
      fromName,
      fromEmail,

      // methods
      formateDateInAgo,
    };
  },
});
</script>

<style lang="scss" scoped>
.master-inbox-email-list-item {
  width: 100%;
  padding: 14px 12px;
  position: relative;
  background: rgba(var(--grey-50-rgb), 0.2);

  &:hover {
    background: rgba($color: var(--primary-rgb), $alpha: 0.05);
  }

  .thread-action-item {
    border-radius: 50%;
    padding: 4px;

    height: fit-content;
    min-height: unset;
    margin-right: 8px;
  }

  .active-bar {
    display: none;
  }

  :deep(.star-icon) {

    min-width: 16px;
    min-height: 16px;

    &.important {
      path {
        fill: $warning;
        stroke: $warning;
      }
    }
  }

  .master-inbox-name-text {
    color: $grey;
    font-size: 14px;
    font-weight: 500;
    line-height: 16px; /* 114.286% */

    text-transform: capitalize;
  }

  .to-type-text {
    color: $grey;
    font-size: 13px;
    font-weight: 400;
    line-height: 16px; /* 123.077% */

    margin-right: 2px;
  }

  .master-inbox-email-text {
    color: $grey;
    font-size: 13px;
    font-weight: 400;
    line-height: 16px; /* 123.077% */

    margin-top: 2px;
    margin-bottom: 8px;
    word-break: break-all;

    max-width: 95%;
  }

  :deep(.circle-dot-icon) {
    width: 6px;
    height: 6px;

    margin-right: 6px;

    circle {
      fill: $primary;
    }
  }

  .master-inbox-subject-text {
    color: $grey;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px; /* 114.286% */

    width: 100%;
    max-width: 240px;

    @media (max-width: $breakpoint-sm-max) {
      width: 240px;
    }

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      width: 240px;
    }

    // max 350px -- hardcoded
    @media (max-width: 350px) {
      width: 200px;
    }
  }

  .email-basic-details {
    display: flex;
    align-items: center;

    margin-bottom: 8px;

    .master-inbox-email-text {
      margin-top: 0px;
      margin-bottom: 0px;
    }

    :deep(.circle-spacer) {
      max-width: 4px;
      max-height: 4px;
      margin: 0px 6px;

      circle {
        fill: $grey;
      }
    }
  }

  &.active {
    background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);

    .active-bar {
      display: block;
      position: absolute;

      height: 100%;
      width: 2px;
      background-color: $primary;

      top: 0px;
      left: 0px;
    }
  }

  &.active, &.unread {
    .master-inbox-name-text {
      color: $primary;
      font-size: 14px;
      font-weight: 500;
    }

    .master-inbox-email-text {
      color: $black;
    }

    .master-inbox-subject-text {
      color: $black;
      font-weight: 500;
    }
  }

  &.unread {
    background: $white;

    .master-inbox-subject-text {
      max-width: 200px;
    }
  }

  .mail-time-text {
    position: absolute;
    top: 12px;
    right: 12px;

    color: $grey;
    text-align: right;
    font-size: 13px;
    line-height: 16px; /* 123.077% */
  }
}
</style>
