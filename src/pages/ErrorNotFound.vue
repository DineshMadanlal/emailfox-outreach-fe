<template>
  <div class="fullscreen bg-primary text-white text-center q-pa-md flex flex-center">
    <div>
      <div style="font-size: 30vh">
        404
      </div>

      <div class="text-h2" style="opacity:.4">
        Oops. Nothing here...
      </div>

      <!-- Home link -->
      <q-btn
        no-caps
        unelevated

        to="/outreach"
        class="q-mt-md"
        label="Back Home"
      />
    </div>
  </div>
</template>

<script>
// vue
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ErrorNotFound',
});
</script>
