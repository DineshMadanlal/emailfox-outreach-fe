<template>
  <div class="unibox-email-reply-composer">
    <!-- Header info: To / CC / Subject -->
    <div class="composer-header">
      <div class="composer-to-row flex items-center justify-between">
        <div class="flex items-center no-wrap flex-1 min-w-0">
          <span class="to-label text-grey q-mr-sm">To:</span>
          <span class="to-address font-medium text-black ellipsis">{{ toAddress }}</span>
        </div>

        <div class="cc-bcc-actions flex items-center q-gutter-xs">
          <q-btn
            flat
            dense
            no-caps
            size="xs"
            class="toggle-field-btn"
            :class="{ active: showCc }"
            @click="showCc = !showCc"
          >
            Cc
          </q-btn>
          <q-btn
            flat
            dense
            no-caps
            size="xs"
            class="toggle-field-btn"
            :class="{ active: showBcc }"
            @click="showBcc = !showBcc"
          >
            Bcc
          </q-btn>
        </div>
      </div>

      <!-- CC Field -->
      <div
        v-if="showCc"
        class="composer-cc-row flex items-center q-mt-xs"
      >
        <span class="field-label text-grey q-mr-sm">Cc:</span>
        <q-input
          dense
          borderless
          v-model="ccAddress"
          class="field-input flex-1"
          placeholder="Add CC email addresses..."
        />
      </div>

      <!-- BCC Field -->
      <div
        v-if="showBcc"
        class="composer-bcc-row flex items-center q-mt-xs"
      >
        <span class="field-label text-grey q-mr-sm">Bcc:</span>
        <q-input
          dense
          borderless
          v-model="bccAddress"
          class="field-input flex-1"
          placeholder="Add BCC email addresses..."
        />
      </div>

      <!-- Subject Field -->
      <div class="composer-subject-row flex items-center q-mt-xs">
        <span class="field-label text-grey q-mr-sm">Subject:</span>
        <q-input
          dense
          borderless
          v-model="replySubject"
          class="field-input flex-1 font-medium"
          placeholder="Subject..."
        />
      </div>
    </div>

    <!-- Message Body Area -->
    <div class="composer-body">
      <q-input
        v-model="replyBody"
        type="textarea"
        borderless
        autogrow
        rows="4"
        class="composer-textarea"
        placeholder="Write your email reply here..."
      />
    </div>

    <!-- Toolbar / Footer -->
    <div class="composer-footer flex items-center justify-between">
      <!-- Left: formatting / attachment tools -->
      <div class="footer-tools flex items-center q-gutter-xs">
        <q-btn
          flat
          round
          dense
          size="sm"
          class="tool-btn"
          @click="$emit('attach-file')"
        >
          <LocalSvgIcon
            image="attachment"
            class="tool-icon"
          />
          <AppTooltip content="Attach file" />
        </q-btn>

        <q-btn
          flat
          round
          dense
          size="sm"
          class="tool-btn"
          @click="$emit('insert-template')"
        >
          <LocalSvgIcon
            image="templates"
            class="tool-icon"
          />
          <AppTooltip content="Insert template" />
        </q-btn>
      </div>

      <!-- Right: Cancel & Send Buttons -->
      <div class="footer-actions flex items-center q-gutter-sm">
        <q-btn
          flat
          no-caps
          label="Cancel"
          color="grey-7"
          class="cancel-btn"
          @click="$emit('cancel')"
        />

        <q-btn
          unelevated
          no-caps
          color="primary"
          class="send-btn"
          :loading="isSending"
          :disable="!replyBody.trim()"
          @click="onSendEmailReply"
        >
          <span class="q-mr-xs">Send Email</span>
          <LocalSvgIcon
            image="send"
            class="send-icon"
          />
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, reactive, toRefs } from 'vue';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

export default defineComponent({
  name: 'UniboxEmailReply',

  components: {
    AppTooltip,
  },

  emits: ['send', 'cancel', 'attach-file', 'insert-template'],

  props: {
    toAddress: {
      type: String,
      default: '',
    },
    defaultSubject: {
      type: String,
      default: '',
    },
    isSending: {
      type: Boolean,
      default: false,
    },
  },

  setup(props, { emit }) {
    const state = reactive({
      showCc: false,
      showBcc: false,
      ccAddress: '',
      bccAddress: '',
      replySubject: props.defaultSubject || '',
      replyBody: '',
    });

    const onSendEmailReply = () => {
      emit('send', {
        to: props.toAddress,
        cc: state.ccAddress,
        bcc: state.bccAddress,
        subject: state.replySubject,
        body: state.replyBody,
      });
    };

    return {
      ...toRefs(state),
      onSendEmailReply,
    };
  },
});
</script>

<style lang="scss" scoped>
.unibox-email-reply-composer {
  width: 100%;
  border-radius: 8px;
  background-color: $white;
  border: 1px solid $grey-100;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-top: 16px;
  overflow: hidden;

  .composer-header {
    padding: 12px 16px;
    border-bottom: 1px solid $grey-50;

    .to-label,
    .field-label {
      font-size: 13px;
      min-width: 45px;
    }

    .to-address {
      font-size: 13px;
    }

    .toggle-field-btn {
      padding: 2px 6px;
      color: grey;
      border-radius: 4px;

      &.active {
        background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);
        color: $primary;
      }
    }

    .field-input {
      font-size: 13px;

      :deep(.q-field__control) {
        min-height: 28px;
        height: 28px;
      }
    }
  }

  .composer-body {
    padding: 12px 16px;

    .composer-textarea {
      font-size: 14px;
      line-height: 20px;
    }
  }

  .composer-footer {
    padding: 10px 16px;
    border-top: 1px solid $grey-50;
    background-color: #FAFAFA;

    .tool-btn {
      color: grey;

      .tool-icon {
        width: 14px;
        height: 14px;
        @include svg-icon-stroke('path, circle, rect', grey);
      }

      &:hover {
        background-color: rgba($color: var(--grey-50-rgb), $alpha: 0.5);
      }
    }

    .send-btn {
      padding: 6px 16px;
      border-radius: 6px;
      font-weight: 500;
      font-size: 13px;

      .send-icon {
        width: 12px;
        height: 12px;
        @include svg-icon-stroke('path, circle, rect', $white);
      }
    }
  }
}
</style>
