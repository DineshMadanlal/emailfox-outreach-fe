<template>
  <div class="workspace-logo-container">
    <!--  -->
    <q-img
      :src="workspace.logo_url || 'https'"
      class="workspace-logo"
    >
      <!-- error -->
      <template #error>
        <div
          class="workspace-name-text"
          :style="{ background: workspace.logo_bg_color }"
        >
          {{ getWorkspaceTwoLetterAcronym(workspace) }}
        </div>
      </template>
    </q-img>
  </div>
</template>
<script>
// vue
import { defineComponent } from 'vue';

// composables
import { useWorkspace } from 'src/composables/useWorkspace';

export default defineComponent({
  name: 'LogoOrText',

  props: {
    workspace: {
      type: Object,
      required: true,
    },
  },

  setup() {
    // composables
    const { getWorkspaceTwoLetterAcronym } = useWorkspace();

    return {
      // methods
      getWorkspaceTwoLetterAcronym,
    };
  },
});
</script>

<style lang="scss" scoped>
.workspace-logo-container {
  min-height: 32px;
  min-width: 32px;

  max-height: 32px;
  max-width: 32px;

  .workspace-logo {
    height: 32px;
    width: 32px;
    border-radius: 5px;
  }

  .workspace-name-text {
    height: 100%;
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: center;

    text-transform: uppercase;

    border-radius: 5px;

    color: $white;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.24px;

    background: inherit;
  }
}
</style>
