<template>
  <div class="contact-lists-card">
    <h6 class="card-title">
      Contact List
    </h6>

    <div
      v-if="contactLists.length"
      class="lists-pills-container"
    >
      <router-link
        v-for="list in contactLists"
        :key="list.id || list.name"
        :to="list.id ? `/outreach/lists/view/${list.id}` : '#'"
        class="contact-list-pill"
      >
        <div class="pill-icon-circle">
          <LocalSvgIcon
            image="folder"
            classes="folder-icon"
          />
        </div>

        <span class="pill-text">
          {{ list.name }}
        </span>
      </router-link>
    </div>

    <!-- Empty state fallback -->
    <div
      v-else
      class="empty-lists-text"
    >
      No lists assigned
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'ContactLists',

  props: {
    lists: {
      type: Array,
      default: () => [],
    },
  },

  setup(props) {
    const contactLists = computed(() => {
      if (Array.isArray(props.lists)) {
        return props.lists;
      }
      return [];
    });

    return {
      contactLists,
    };
  },
});
</script>

<style lang="scss" scoped>
.contact-lists-card {
  width: 100%;
  background-color: $white;
  border: 1px solid $grey-50;
  border-radius: 8px;
  padding: 16px 20px 20px 20px;

  .card-title {
    color: $black;
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
    margin: 0 0 16px 0;
  }

  .lists-pills-container {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;

    .contact-list-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 6px 14px 6px 6px;
      border-radius: 9999px;
      border: 1px solid $blue-grey;
      background-color: $white;
      text-decoration: none;
      transition: all 0.2s ease-in-out;

      &:hover {
        border-color: $primary;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

        .pill-text {
          color: $primary;
        }
      }

      .pill-icon-circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: rgba(var(--primary-rgb), 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;

        :deep(.folder-icon) {
          width: 16px;
          height: 16px;
          @include svg-icon-stroke('path, rect', $primary);
        }
      }

      .pill-text {
        color: $black;
        font-size: 14px;
        font-weight: 500;
        line-height: 18px;
      }
    }
  }

  .empty-lists-text {
    color: $grey;
    font-size: 13px;
    font-style: italic;
    margin: 0;
  }
}
</style>
