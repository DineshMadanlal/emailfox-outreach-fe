<template>
  <!-- Img -->
  <q-img
    no-spinner
    :src="imageUrl"
    :loading-show-delay="60"

    width="40px"
    height="40px"

    class="thread-img"
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
  name: 'EmailProfilePicture',

  props: {
    email: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    // computed
    const avatarText = computed(() => props.email.slice(0, 2).toUpperCase());

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
.thread-img {
  min-width: 40px;
  min-height: 40px;

  margin-right: 18px;
  border-radius: 6px;
  border: 1px solid $grey-50;

  .thread-name-avatar {
    width: 100%;
    height: 100%;

    background-color: rgba($color: var(--primary-rgb), $alpha: 0.1);

    padding: 0px;
    display: flex;
    align-items: center;
    justify-content: center;

    .thread-avatar-text {
      color: $secondary;
      font-size: 14px;
      font-weight: 500;
      line-height: 16px; /* 114.286% */
    }
  }
}
</style>
