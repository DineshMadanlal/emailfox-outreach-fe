<template>
  <div class="master-inbox-paginated-footer">
    <div class="flex no-wrap items-center">
      <p class="records-per-page-label">
        Show
      </p>

      <!-- Select Dropdown -->
      <q-select
        dense
        outlined
        options-dense
        hide-bottom-space

        behavior="menu"

        :options="[25, 50, 75, 100]"
        v-model="rowsPerPage"

        class="master-inbox-paginated-select"
      >
      </q-select>

      <p class="records-per-page-label">
        per page
      </p>
    </div>

    <q-space />

    <div class="flex no-wrap items-center">

      <!-- left arrow button -->
      <q-btn
        flat
        no-caps
        unelevated

        color="primary"
        class="pagination-btn"

        :disable="isFirstPage"
        :class="{ 'btn-disabled': isFirstPage }"

        @click="onPreviousPage"
      >
        <!-- Left Arrow -->
        <div class="pagination-btn-content">
          <LocalSvgIcon
            image="plain-down-arrow"
            classes="pagination-icon left-arrow"
          />
        </div>
      </q-btn>

      <!-- label -->
      <p class="pagination-label">
        {{ paginationLabel }}
      </p>

      <!-- right arrow button -->
      <q-btn
        flat
        no-caps
        unelevated

        color="primary"
        class="pagination-btn"

        :disable="isLastPage"
        :class="{ 'btn-disabled': isLastPage }"

        @click="onNextPage"
      >
        <!-- Right Arrow -->
        <div class="pagination-btn-content">
          <LocalSvgIcon
            image="plain-down-arrow"
            classes="pagination-icon right-arrow"
          />
        </div>
      </q-btn>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'SkyBoxPaginatedFooter',

  emits: ['update:pagination'],

  props: {
    pagination: {
      type: Object,
      required: true,
    },
  },

  setup(props, { emit }) {
    // computed
    const rowsPerPage = computed({
      get: () => props.pagination.rowsPerPage,
      set: (value) => {
        emit('update:pagination', {
          ...props.pagination,
          rowsPerPage: value,
          page: 1, // optionally reset to page 1
        });
      },
    });

    const paginationLabel = computed(() => {
      const { page } = props.pagination;

      const start = (page - 1) * rowsPerPage.value + 1;
      const end = page * rowsPerPage.value;

      return `${start} to ${end}`;
    });

    const isLastPage = computed(() => !props.pagination.hasMore);
    const isFirstPage = computed(() => props.pagination.page === 1);

    // methods
    const onNextPage = () => {
      if (isLastPage.value) return;

      emit('update:pagination', {
        ...props.pagination,
        page: props.pagination.page + 1,
      });
    };

    const onPreviousPage = () => {
      if (isFirstPage.value) return;

      emit('update:pagination', {
        ...props.pagination,
        page: props.pagination.page - 1,
      });
    };

    return {
      // computed
      rowsPerPage,
      isFirstPage,
      isLastPage,
      paginationLabel,

      // methods
      onNextPage,
      onPreviousPage,
    };
  },
});
</script>

<style lang="scss" scoped>
.master-inbox-paginated-footer {
  width: 100%;

  display: flex;
  align-items: center;

  padding: 12px;

  position: sticky;
  bottom: 0;
  z-index: 2;
  background-color: $white;

  border-top: 1px solid $grey-50;

  :deep(.master-inbox-paginated-select) {
    width: 24px;
    margin: 0px 4px;

    .q-field__native {
      padding: 0;
      min-height: unset;
      line-height: unset;
      justify-content: center;
    }

    .q-field__control {
      min-height: unset;
      padding: 2px 4px;

      span {
        color: $primary;
        font-size: 12px;
        font-style: normal;
        font-weight: 500;
        line-height: 16px;
        /* 133.333% */
      }
    }

    .q-field__append {
      display: none;
    }
  }

  .records-per-page-label {
    color: rgba($color: var(--black-rgb), $alpha: 0.8);
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
  }

  .pagination-label {
    margin: 0px 6px;

    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    color: rgba($color: var(--black-rgb), $alpha: 0.8);
  }
}
</style>
