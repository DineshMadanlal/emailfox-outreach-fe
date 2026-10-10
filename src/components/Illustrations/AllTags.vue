<template>
  <div class="tags-illustration">
    <!-- container -->
    <div class="tags-illustration-container">
      <!-- Illustration -->
      <div class="tags-img">
        <LocalSvgIcon
          image="tags"
          classes="tags-icon"
        />
      </div>

      <!-- header -->
      <h4 class="tags-header-text">
        <!-- Create/Add Your Domains -->
        No Tags created yet
      </h4>

      <!-- description -->
      <p class="tags-description-text">
        Tags help you group mailboxes, contact lists, and campaigns for
        better organization and targeting. Create your first tag
        to get started.
      </p>

      <!-- Actions -->
      <div class="tags-actions">
        <!-- Connect LinkedIn button -->
        <q-btn
          no-caps
          unelevated

          color="primary"
          label="Create Tag"
          :disable="isReadOnly"

          @click="$emit('onCreateTag')"
        >
          <AppTooltip
            v-if="isReadOnly"
            anchor="top middle"
            self="bottom middle"
            content="You have read-only access in this workspace"
          />
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

// composables
import { usePermissions } from 'src/composables/usePermissions';

// components
import AppTooltip from 'components/General/AppTooltip.vue';

export default defineComponent({
  name: 'AllTagsIllustration',

  emits: ['onCreateTag'],

  components: {
    AppTooltip,
  },

  setup() {
    // composables
    const { isReadOnly } = usePermissions();

    return {
      // computed
      isReadOnly,
    };
  },
});
</script>

<style lang="scss" scoped>
.tags-illustration {
  padding: 40px 20px;

  display: flex;
  justify-content: center;

  // xs max
  @media (max-width: $breakpoint-xs-max) {
    padding: 20px 16px;
  }

  .tags-illustration-container {
    width: 100%;
    max-width: 600px;

    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    :deep(.tags-img) {
      height: 76px;
      width: 76px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: $grey-50;

      .tags-icon {
        width: 32px;
        height: 100%;

        @include svg-icon-fill('circle', $grey);
        @include svg-icon-stroke('path, circle', $grey);
      }
    }

    .tags-header-text {
      margin-top: 24px;
      margin-bottom: 8px;

      color: $black;
      font-size: 18px;
      font-weight: 600;
      text-align: center;
    }

    .tags-description-text {
      margin-bottom: 20px;
      text-align: center;

      font-size: 14px;
      font-weight: 400;
      line-height: 16px; /* 114.286% */
      color: rgba(var(--black-rgb), 0.8);

      max-width: 468px;
    }

    .tags-actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;

      margin-bottom: 40px;
    }
  }
}
</style>
