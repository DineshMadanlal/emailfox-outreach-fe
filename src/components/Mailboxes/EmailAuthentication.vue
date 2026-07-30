<template>
  <div class="email-authentication">
    <!-- Icon and label -->
    <div class="authentication-report">
      <LocalSvgIcon
        :image="statusIconAndLabel.icon"
        :class="[
          'authentication-status-icon',
          statusIconAndLabel.iconColor, statusIconAndLabel.classes || ''
        ]"
      />
      <div
        class="authentication-status-label"
      >
        {{ statusIconAndLabel.label }}
      </div>
    </div>

    <!-- Indicators -->
    <div class="flex no-wrap items-center authentication-indicators">
      <div
        :class="{ 'text-negative': !isSpfPass }"
      >
        SPF
      </div>
      ,
      <div
        :class="{ 'text-negative': !isDkimPass }"
      >
        &nbsp;DKIM
      </div>
      ,
      <div
        :class="{ 'text-negative': !isDmarcPass }"
      >
        &nbsp;
        DMARC
      </div>
      ,
      <div
        :class="{ 'text-negative': !isMxPass }"
      >
        &nbsp;MX
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { computed, defineComponent } from 'vue';

export default defineComponent({
  name: 'EmailAuthentication',

  props: {
    tableRow: {
      type: Object,
      default: () => {},
    },
  },

  setup(props) {
    // computed
    const isSpfPass = computed(() => props.tableRow?.spf_pass);
    const isDkimPass = computed(() => props.tableRow?.dkim_pass);
    const isDmarcPass = computed(() => props.tableRow?.dmarc_pass);
    const isMxPass = computed(() => props.tableRow?.mx_pass);

    const areAllPass = computed(() => isSpfPass.value && isDkimPass.value
      && isDmarcPass.value && isMxPass.value);
    const atleastOnePass = computed(() => isSpfPass.value || isDkimPass.value
      || isDmarcPass.value || isMxPass.value);

    const statusIconAndLabel = computed(() => {
      if (areAllPass.value) {
        return {
          icon: 'circle-tick',
          label: 'Passed',
          iconColor: 'positive',
        };
      } if (atleastOnePass.value) {
        return {
          icon: 'circle-tick',
          label: 'Passed',
          iconColor: 'warning',
        };
      }

      return {
        icon: 'seq-bounced',
        label: 'Failed',
        iconColor: 'negative',
        classes: 'bounced-icon',
      };
    });

    return {
      // computed
      isSpfPass,
      isDkimPass,
      isDmarcPass,
      isMxPass,
      statusIconAndLabel,
    };
  },
});
</script>

<style lang="scss" scoped>
.email-authentication {
  width: 100%;

  display: flex;
  flex-direction: column;
  gap: 4px;

  .authentication-report {
    gap: 6px;
    display: flex;
    align-items: center;

    :deep(.authentication-status-icon) {
      min-height: 14px;
      min-width: 14px;

      max-height: 14px;
      max-width: 14px;

      &.positive {
        @include svg-icon-fill('circle', $positive);
        @include svg-icon-stroke('circle', $positive);
        @include svg-icon-stroke('path', $white);
      }

      &.warning {
        @include svg-icon-fill('circle', $warning);
        @include svg-icon-stroke('circle', $warning);
        @include svg-icon-stroke('path', $white);
      }
    }

    :deep(.bounced-icon) {
      @include svg-icon-fill('path', $negative);

      circle {
        &:first-child {
          stroke: $negative;
        }

        &:last-child {
          fill: $negative;
        }
      }
    }

    .authentication-status-label {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
    }
  }

  .authentication-indicators {
    color: $grey;
    font-size: 13px;
    font-weight: 400;
    line-height: 16px;
  }
}
</style>
