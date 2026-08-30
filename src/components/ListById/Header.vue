<template>
  <div class="list-by-id-header">
    <!-- top header -->
    <div class="list-id-top-header">
      <!-- All Lists route -->
      <router-link
        to="/outreach/lists/all"
        class="lists-route-link-text"
      >
        Lists
      </router-link>

      <LocalSvgIcon
        image="plain-down-arrow"
        classes="plain-down-arrow-icon"
      />

      <p class="overview-text">
        Overview
      </p>

      <q-space />

      <!-- close button -->
      <q-btn
        flat
        round
        dense

        color="negative"
        class="app-negative-button"

        :to="`/outreach/lists/all`"
      >
        <LocalSvgIcon
          image="close"
          classes="app-negative-icon"
        />
      </q-btn>
    </div>

    <!-- bottom header -->
    <div class="list-id-bottom-header">
      <!-- left -->
      <div>
        <p class="list-name-text">
          {{ listName }}
        </p>

        <div class="flex no-wrap items-center">
          <p class="list-subtitle-text">
            {{ listContactsLength }} {{ $pluralize('Contact', listContactsLength) }}
          </p>

          <LocalSvgIcon
            image="circle-dot"
            classes="dot-icon"
          />

          <p class="list-subtitle-text">
            Created on {{ formatDateWithTime(listByJson.created_at) }}
          </p>
        </div>
      </div>

      <q-space />

      <!-- right -->
      <div class="list-id-right-section">
        <!-- More options / Import History -->
        <q-btn
          dense
          outlined
          unelevated

          class="filter-more-btn"
        >
          <!-- more -->
          <LocalSvgIcon
            image="more"
            classes="filter-more-icon"
          />

          <ListByIdMoreOptions
            @importHistory="$emit('importHistory')"
          />
        </q-btn>

        <!-- Upload -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          class="upload-contact-button"

          :to="`/outreach/contacts/${listByJson.id}/upload`"
        >
          <div class="flex no-wrap items-center">
            <LocalSvgIcon image="download" classes="download-icon" />

            <p class="upload-button-text">
              Upload
            </p>
          </div>
        </q-btn>
      </div>
      <div>

      </div>
    </div>

    <!-- Tab components -->
    <q-tabs
      dense
      narrow-indicator

      align="left"
      class="app-tabs"
      active-color="primary"
      indicator-color="primary"
    >
      <!-- route tab -->
      <q-route-tab
        no-caps

        v-for="(page, index) in listByIdPages"

        :key="`list-id-${index}-${page.label}`"
        :to="page.route"
      >
        <!-- page label -->
        <p class="route-label-text">
          {{ page.label }}
        </p>
      </q-route-tab>
    </q-tabs>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

// quasar
import { useMeta } from 'quasar';

// composables
import useAppHelpersApi from 'src/composables/app-helpers.js';

// Components
import ListByIdMoreOptions from 'components/Menu/ListByIdMoreOptions.vue';

// utils
import { getNumeralAmount } from 'src/utils/numbers';
import { formatDateWithTime } from 'src/utils/dates';

export default defineComponent({
  name: 'ListByIdHeader',

  emits: ['importHistory'],

  components: {
    ListByIdMoreOptions,
  },

  props: {
    listByJson: {
      type: Object,
      required: true,
    },
  },

  setup(props) {
    // composition API
    const { generateMetadata, isMobileDevice } = useAppHelpersApi();

    // computed
    const listName = computed(() => props.listByJson.name);

    // metadata
    useMeta(generateMetadata(`${listName.value} - Lists`));

    const listByIdPages = computed(() => {
      const listId = props.listByJson.id;

      return [
        {
          label: 'Contacts',
          route: `/outreach/lists/view/${listId}/list-contacts`,
        },
        // {
        //   label: 'List Analytics',
        //   route: `/outreach/lists/view/${listId}/list-analytics`,
        // },
      ];
    });

    const listContactsLength = computed(() => getNumeralAmount(props.listByJson.total_contacts));

    return {
      // computed
      listName,
      listByIdPages,
      isMobileDevice,
      listContactsLength,

      // methods
      formatDateWithTime,
    };
  },
});
</script>

<style lang="scss" scoped>
.list-by-id-header {
  width: 100%;

  top: 0px;
  z-index: 3;
  position: sticky;

  background: $white;
  border-radius: 8px 8px 0px 0px;
  border-bottom: 1px solid $grey-50;

  // top header
  .list-id-top-header {
    width: 100%;

    padding: 24px 20px 4px 20px;

    display: flex;
    align-items: center;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px 16px 4px 16px;
    }

    .lists-route-link-text {
      color: $grey;
      font-size: 14px;
      font-weight: 400;

      text-decoration: unset;

      &:hover {
        color: $primary;
        text-decoration: underline;
      }
    }

    :deep(.plain-down-arrow-icon) {
      margin: 0px 12px;

      transform: rotate(-90deg);
    }

    .overview-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
    }
  }

  // bottom header
  .list-id-bottom-header {
    width: 100%;
    row-gap: 6px;
    padding: 16px 20px;

    display: flex;

    // xs max
    @media (max-width: $breakpoint-xs-max) {
      padding: 16px;
      flex-direction: column;
    }

    // right section
    .list-id-right-section {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 12px;

      .filter-more-btn {
        width: 36px;
        height: 36px;
        border-radius: 6px;
        border: 1px solid $blue-grey;

        .filter-more-icon {
          // transform: rotate(90deg);
        }
      }
    }

    .list-name-text {
      color: $black;
      font-size: 18px;
      font-weight: 600;

      margin-bottom: 8px;
    }

    .list-subtitle-text {
      color: $black;
      font-size: 14px;
      font-weight: 400;
      line-height: 16px;
    }

    .upload-contact-button {
      :deep(.download-icon) {
        path {
          stroke: $white;
        }
      }

      .upload-button-text {
        color: $white;
        font-size: 14px;
        font-weight: 500;
        margin-left: 8px;
      }
    }

    :deep(.dot-icon) {
      max-height: 4px;
      max-width: 4px;

      margin: 0px 12px;

      circle {
        fill: $grey-300;
        stroke-width: 2px;
      }
    }
  }
}
</style>
