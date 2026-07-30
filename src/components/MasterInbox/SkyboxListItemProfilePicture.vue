<template>
  <!-- Img -->
  <q-img
    no-spinner
    :src="imageUrl"
    :loading-show-delay="60"

    width="32px"
    height="32px"

    class="master-inbox-list-item-img"
  >
    <template v-slot:error>
      <div class="thread-name-avatar">
        <p class="thread-avatar-text">
          {{ avatarText }}
        </p>
      </div>
    </template>
  </q-img>
</template>
<script>
// vue
import { computed, defineComponent } from 'vue';

// utils
import { getGravatarUrl } from 'src/utils/skyboxApi';

export default defineComponent({
  name: 'SkyboxListItemProfilePicture',

  props: {
    email: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    // computed
    const avatarText = computed(() => {
      if (props.email && props.email.length > 0) {
        return props.email.charAt(0).toUpperCase();
      }
      return '';
    });

    // Image URL with Gravatar fallback
    const imageUrl = computed(() => {
      if (props.email) return getGravatarUrl(props.email);

      return 'https://';
    });

    return {
      // computed
      avatarText,
      imageUrl,
    };
  },
});
</script>

<style lang="scss" scoped>
.master-inbox-list-item-img {
  min-width: 32px;
  min-height: 32px;

  margin-right: 18px;

  flex-shrink: 0;
  border-radius: 4px;
  border: rgba($color: var(--primary-rgb), $alpha: 0.2);
  background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);

  .thread-name-avatar {
    width: 100%;
    height: 100%;

    background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);

    padding: 0px;
    display: flex;
    align-items: center;
    justify-content: center;

    .thread-avatar-text {
      color: $primary;
      font-size: 14px;
      font-weight: 400;
      line-height: 20px; /* 142.857% */
    }
  }
}
</style>
