<template>
  <div class="each-workflow">
    <!-- Delay Days -->
    <div
      v-if="workflowIndex"
      class="delay-days-wrapper"
    >
      <div class="days-bordered"></div>

      <q-input
        dense
        outlined

        :min="1"
        v-model="computedDelayDays"
        type="number"
        class="app-input-field-height delay-days-input-wrapper"
      >
        <template v-slot:append>
          <!-- Days -->
          <div class="input-append">
            <div class="days-text">
              {{ $pluralize('day', computedDelayDays) }}
            </div>
            <div class="after-text">after the previous email</div>
          </div>
        </template>
      </q-input>
    </div>

    <!-- card -->
    <q-card
      flat
      class="workflow-card"
    >
      <!-- top -->
      <div class="workflow-top-section">
        <!-- Email Delivered Icon -->
        <div class="email-delivered-wrapper">
          <LocalSvgIcon image="seq-delivered" classes="email-delivered-icon" />
        </div>

        <p class="workflow-name">
          Email {{ workflowIndex + 1 }}
          <span
            v-if="variantsLength > 1"
          >
            ({{ variantsLength }}) variants
          </span>
        </p>

        <q-space />

        <!-- Add variants -->
        <q-btn
          flat
          dense
          round
          color="primary"
          class="variant-btn"

          @click="$emit('addNewVariant')"

          v-if="variantsLength === 1"
        >
          <LocalSvgIcon
            image="seq-variants"
            classes="variants-icon"
          />
        </q-btn>

        <!-- Delete Workflow -->
        <q-btn
          flat
          dense
          round

          size="xs"
          color="negative"
          class="seq-delete-btn extra-height"

          @click="$emit('deleteWorkflow', workflowIndex)"

          v-if="variantsLength === 1"
        >
          <LocalSvgIcon
            image="delete"
            classes="app-negative-icon delete-icon"
          />
        </q-btn>
      </div>

      <!-- subject -->
      <q-item
        clickable
        class="single-variant-subject ellipsis"
        :class="{ 'add-opacity': !workflow.subject }"

        v-if="variantsLength === 1"

        @click="$emit('viewWorkflow', {
          workflowJson: workflow,
          variantJson: firstVariant,
        })"
      >
        {{ firstVariant.subject || 'Subject will appear here' }}
      </q-item>

      <!-- Show AB Variants -->
      <div
        v-else
        class="ab-variants-subject"
      >
        <div class="variants-grid">
          <q-item
            clickable
            v-for="(variant, vIndex) in nonArchivedVariants"
            :key="`variant-subject-${vIndex}`"

            class="each-variant"

            @click="$emit('viewWorkflow', {
              workflowJson: workflow,
              variantJson: variant,
            })"
          >
            <p class="seq-variant-name-text">
              {{ SEQUENCE_VARIANT_NAME[vIndex + 1] }}
            </p>

            <p
              class="variant-subject-text ellipsis"
              :class="{ 'add-opacity': !variant.subject }"
            >
              {{ variant.subject || 'Subject will appear here' }}
            </p>

            <q-space />

            <!-- Delete Variant -->
            <q-btn
              flat
              dense
              round

              size="xs"
              color="negative"
              class="seq-delete-btn"

              @click="$emit('deleteVariant', {
                workflowIndex,
                variantIndex: vIndex,
              })"
            >
              <LocalSvgIcon
                image="delete"
                classes="app-negative-icon delete-icon"
              />
            </q-btn>
          </q-item>

          <!-- New Variant -->
          <q-item
            clickable
            class="each-variant"

            @click="$emit('addNewVariant')"

            v-if="variantsLength < SEQUENCE_VARIANTS_MAX_LIMIT"
          >
            <div class="seq-variant-name-text">
              <LocalSvgIcon
                image="plus"
              />
            </div>

            <p
              class="variant-subject-text ellipsis"
            >
              New Variant
            </p>
          </q-item>
        </div>
      </div>
    </q-card>
  </div>
</template>
<script>
import { defineComponent, computed } from 'vue';

// constants
import { SEQUENCE_VARIANT_NAME, SEQUENCE_VARIANTS_MAX_LIMIT, VARIANT_STATUS } from 'src/boot/campaign-constants.js';

export default defineComponent({
  name: 'SequenceWorkflowEachWorkflow',

  emits: ['addNewVariant', 'deleteVariant', 'deleteWorkflow', 'update:delayDays', 'viewWorkflow'],

  props: {
    workflow: {
      type: Object,
      default: () => ({}),
    },
    workflowIndex: {
      type: Number,
      required: true,
    },
  },

  setup(props, { emit }) {
    // computed
    const variants = computed(() => props.workflow.variants || []);

    const firstVariant = computed(() => variants.value[0] || {});

    const variantsLength = computed(() => variants.value.length);

    const nonArchivedVariants = computed(() => variants.value.filter(
      (variant) => variant.status !== VARIANT_STATUS.ARCHIVED,
    ));

    const computedDelayDays = computed({
      get: () => props.workflow.delayDays || 0,
      set: (value) => {
        emit('update:delayDays', {
          value,
          workflowIndex: props.workflowIndex,
        });
      },
    });

    return {
      // computed
      firstVariant,
      variantsLength,
      computedDelayDays,
      nonArchivedVariants,

      // constants
      SEQUENCE_VARIANT_NAME,
      SEQUENCE_VARIANTS_MAX_LIMIT,
    };
  },
});
</script>

<style lang="scss" scoped>
.each-workflow {
  width: 100%;

  .delay-days-wrapper {
    margin-bottom: 12px;

    .days-bordered {
      position: relative;
      left: 24px;
      height: 24px;
      width: 1px;
      border-left: 1px dashed $grey-200;
    }

    :deep(.delay-days-input-wrapper) {
      margin-top: 8px;

      .q-field__control, .q-field__append {
        height: 28px;
      }

      .q-field__control-container {
        flex: unset;
      }

      .q-field__append {
        width: 100%;
        flex-shrink: 0.15;

        border-left: 1px solid $grey-50;
      }

      .q-field__native {
        font-size: 14px;
        line-height: 16px;
        color: $primary;
      }

      .input-append {
        width: 100%;
        display: flex;
        align-items: center;

        .days-text {
          color: $black;
          font-size: 14px;
          font-weight: 400;
          line-height: 28px;

          padding-right: 12px;
          margin-right: 12px;
          border-right: 1px solid $grey-50;
        }

        .after-text {
          color: $grey;
          font-size: 14px;
          font-weight: 400;
          line-height: 16px;
        }
      }
    }
  }

  .workflow-card {
    border: 1px solid $grey-50;
    border-radius: 8px;

    flex-direction: column;
    padding: 0px;
    min-height: unset;

    :deep(.seq-delete-btn) {
      .delete-icon {
        width: 14px;
        @include svg-icon-stroke('path', $grey);
      }

      &:hover {
        @include svg-icon-stroke('path', $negative);
      }

      &.extra-height {
        .delete-icon {
          width: 16px;
        }
      }
    }

    .workflow-top-section {
      height: 50px;
      padding: 12px;
      border-bottom: 1px solid $grey-50;

      display: flex;
      gap: 12px;
      align-items: center;

      .email-delivered-wrapper {
        border-radius: 4px;
        border: 1px solid rgba($color: var(--primary-rgb), $alpha: 0.2);
        background: rgba($color: var(--primary-rgb), $alpha: 0.1);
        padding: 6px;

        height: 26px;
        width: 26px;

        display: flex;
        align-items: center;
        justify-content: center;

        :deep(.email-delivered-icon) {
          min-width: 14px;
          height: 14px;

          @include svg-icon-stroke('path', $grey);
        }
      }

      .workflow-name {
        color: $secondary;
        font-size: 14px;
        font-weight: 600;

        span {
          color: $grey;
          font-size: 12px;
          font-weight: 400;
        }
      }

      .variant-btn {
        padding: 1px;
      }
    }

    .ab-variants-subject {
      .variants-grid {
        .each-variant {
          display: flex;
          align-items: center;
          gap: 15px;

          min-height: unset;
          padding: 12px;
          border-bottom: 1px solid $grey-50;

          &:last-child {
            border-bottom: 0px;
          }

          .seq-variant-name-text {
            color: $grey;
            font-size: 14px;
            line-height: 20px;

            height: 20px;
            width: 20px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 4px;
            border: 1px solid rgba($color: var(--primary-rgb), $alpha: 0.2);
          }

          .variant-subject-text {
            color: $black;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;

            &.add-opacity {
              opacity: 0.4;
            }
          }
        }
      }
    }

    .single-variant-subject {
      min-height: unset;
      padding: 12px;

      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px; /* 142.857% */

      &.add-opacity {
        opacity: 0.4;
      }
    }
  }
}
</style>
