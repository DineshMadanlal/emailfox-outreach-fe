<template>
  <q-card flat class="contact-coverage-card">
    <!-- header -->
    <h6 class="contact-coverage-header-text">
      Contact Coverage Summary
    </h6>

    <!-- content -->
    <div class="contact-coverage-content">
      <div class="contact-coverage-details">
        <div
          v-for="detail in contactCoverageProgress"
          :key="`contact-coverage-detail-${detail.label}`"

          class="each-contact-coverage-detail"
        >
          <div class="contact-coverage-icon-block">
            <LocalSvgIcon
              image="seq-sent"
              classes="contact-coverage-icon"
            />
          </div>

          <div>
            <p class="contact-coverage-label-text">
              {{ detail.label }}
            </p>

            <p class="contact-coverage-value-text">
              {{ detail.value }}
            </p>

            <p class="contact-coverage-desc-text">
              {{ detail.desc }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

// numbers
import { getNumeralAmount } from 'src/utils/numbers';

export default defineComponent({
  name: 'SendingProgress',

  setup() {
    // computed
    const contactCoverageProgress = computed(() => {
      const details = [
        {
          label: 'Contacts Added',
          value: getNumeralAmount(3400),
          desc: 'emails',
        },
        {
          label: 'Queued',
          value: getNumeralAmount(800),
          desc: 'emails',
        },
        {
          label: 'Skipped',
          value: getNumeralAmount(80),
          desc: 'emails',
        },
        {
          label: 'Avg Per Account',
          value: getNumeralAmount(310),
          desc: 'emails/day',
        },
      ];

      return details;
    });

    return {
      // computed
      contactCoverageProgress,
    };
  },
});
</script>

<style lang="scss" scoped>
.contact-coverage-card {
  width: 100%;
  border: 1px solid $grey-50;

  border-top: 0px;
  border-radius: 0px 0px 6px 6px;

  padding: 20px;
  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 16px 12px;
  }

  .contact-coverage-header-text {
    color: $black;
    font-size: 16px;
    font-weight: 600;
  }

  .contact-coverage-content {
    width: 100%;
    margin-top: 27px;

    .contact-coverage-details {
      display: flex;
      flex-direction: column;
      gap: 32px;

      // xs max
      @media (max-width: $breakpoint-xs-max) {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .each-contact-coverage-detail {
        flex: 1 1 calc(25% - 12px);
        display: flex;
        gap: 16px;

        .contact-coverage-label-text {
          color: $black;
        }

        .contact-coverage-value-text {
          color: $black;
          font-size: 18px;
          font-weight: 600;

          margin-top: 4px;
          margin-bottom: 6px;
        }

        .contact-coverage-desc-text {
          color: $grey;
        }

        .contact-coverage-icon-block {
          min-width: 32px;
          min-height: 32px;
          max-width: 32px;
          max-height: 32px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;
          background: rgba($color: var(--primary-rgb), $alpha: 0.1);

          :deep(.contact-coverage-icon) {
            min-width: 16px;
            min-height: 12px;
            max-width: 16px;
            max-height: 12px;

            @include svg-icon-stroke('path, circle, rect', $primary);
          }
        }
      }
    }
  }
}
</style>
