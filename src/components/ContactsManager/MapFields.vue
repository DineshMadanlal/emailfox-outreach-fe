<template>
  <div class="map-fields">
    <Teleport
      v-if="isMounted"
      to="#importContactsFooter"
    >
      <!-- Save and continue button -->
      <q-btn
        no-caps
        unelevated

        color="primary"
        label="Save and Continue"

        :loading="showButtonLoading"

        @click="onSaveAndContinue"
      />
    </Teleport>

    <h6 class="map-fields-header-text">
      Map Fields
    </h6>

    <p class="map-fields-desc-text">
      Review and confirm each mapping choice
    </p>

    <!--  -->
    <div class="map-csv-fields">
      <!-- Header -->
      <div class="map-csv-container headers-block">
        <p class="map-header-text csv-column-text">
          CSV Column
        </p>

        <!-- image -->
        <LocalSvgIcon
          image="right-line-arrow"
          classes="right-line-arrow-icon"
        />

        <p class="map-header-text map-field-text">
          Map Fields
        </p>
      </div>

      <!-- Values -->
      <div
        class="map-csv-container"

        v-for="(header, index) in csvDataJson.csvHeaders"
        :key="`map-csv-header-${index}`"
      >
        <p
          class="map-header-text csv-column-text"
          :title="header"
        >
          {{ header }}
        </p>

        <!-- image -->
        <LocalSvgIcon
          image="right-line-arrow"
          classes="right-line-arrow-icon"
        />

        <SelectSystemFields
          borderless
          v-model="mappedCsvHeaders[index]"

          class="system-fields-dd"
        />
      </div>
    </div>
  </div>
</template>

<script>
// quasar
import { useQuasar } from 'quasar';

// vue
import {
  computed, defineComponent, onMounted, reactive, toRefs,
} from 'vue';

// components
import SelectSystemFields from 'components/Dropdown/SelectSystemFields.vue';

// utils
import { normalizeString } from 'src/utils/helperFunctions';

// constants
import { SYSTEM_FIELD_ALIASES, CUSTOM_FIELD } from 'src/boot/campaign-constants';

export default defineComponent({
  name: 'MapFields',

  emits: ['onCompleteStep'],

  components: {
    SelectSystemFields,
  },

  props: {
    csvDataJson: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    showButtonLoading: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  setup(props, { emit }) {
    // quasar
    const $q = useQuasar();

    // state
    const state = reactive({
      mappedCsvHeaders: [],

      isMounted: false,
    });

    // computed
    const tableColumns = computed(() => [
      { label: 'CSV Column', field: 'csvHeader', name: 'csvHeader' },
      { label: 'Map Fields', field: 'mapField', name: 'mapField' },
    ]);

    // methods
    const preMapCsvHeaders = () => {
      state.mappedCsvHeaders = [];

      const csvHeaders = props.csvDataJson.csvHeaders || [];

      // normalizeString system field lookup
      const normalizeStringdSystemFields = Object.entries(SYSTEM_FIELD_ALIASES).flatMap(
        ([systemField, aliases]) => aliases.map((alias) => ({
          alias: normalizeString(alias),
          systemField,
        })),
      );

      csvHeaders.forEach((header, headerIndex) => {
        const normHeader = normalizeString(header);

        const match = normalizeStringdSystemFields.find(
          (entry) => normHeader.includes(entry.alias) || entry.alias.includes(normHeader),
        );

        if (match) {
          state.mappedCsvHeaders[headerIndex] = match.systemField;
        } else {
          state.mappedCsvHeaders[headerIndex] = CUSTOM_FIELD.value;
        }
      });
    };

    const onSaveAndContinue = () => {
      // make sure email field is mapped as it's mandatory
      const emailFieldIndex = state.mappedCsvHeaders.findIndex(
        (field) => field === 'email',
      );

      if (emailFieldIndex === -1) {
        $q.dialog({
          title: 'Email field is required',
          message: 'Please map the email field as it is mandatory',
        });

        return;
      }

      emit('onCompleteStep', {
        mappedCsvHeaders: state.mappedCsvHeaders,
      });
    };

    onMounted(() => {
      preMapCsvHeaders();

      state.isMounted = true;
    });

    return {
      // state
      ...toRefs(state),

      // computed
      tableColumns,

      // methods
      onSaveAndContinue,
    };
  },
});
</script>

<style lang="scss" scoped>
.map-fields {
  width: 100%;
  max-width: 510px;

  padding: 20px;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 16px 12px;
  }

  .map-fields-header-text {
    color: $black;
    font-size: 16px;
    font-weight: 600;
  }

  .map-fields-desc-text {
    color: $black;
    font-size: 14px;
    font-weight: 400;
    line-height: 16px; /* 114.286% */

    margin-top: 6px;
    margin-bottom: 24px;
  }

  .map-csv-fields {
    width: 100%;

    .map-csv-container {
      width: 100%;
      display: flex;
      align-items: center;

      background: rgba($color: var(--grey-50-rgb), $alpha: 0.5);

      padding: 10px 20px;
      // xs max
      @media (max-width: $breakpoint-xs-max) {
        padding: 8px 12px;
      }

      .map-header-text {
        color: $grey;
        font-size: 13px;
        font-weight: 500;

        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;

        &.csv-column-text {
          width: 45%;
        }

        &.map-field-text {
          width: 100%;
        }
      }

      .right-line-arrow-icon {
        min-width: 11px;
        margin: 0px 40px 0px 12px;

        // xs max
        @media (max-width: $breakpoint-xs-max) {
          margin: 0 8px;
        }
      }

      &.headers-block {
        .right-line-arrow-icon {
          opacity: 0;
        }
      }
    }
  }
}
</style>
