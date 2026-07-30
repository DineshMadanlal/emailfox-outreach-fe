<template>
  <InlineSvg
    :class="classes"
    :src="getSvgPath"
  />
</template>

<script>
import { defineComponent, computed } from 'vue';
import InlineSvg from 'vue-inline-svg';

export default defineComponent({
  name: 'LocalSvgIcon',

  components: {
    InlineSvg,
  },

  props: {
    isIconFolder: {
      type: Boolean,
      default: true,
    },

    isIllustrationFolder: {
      type: Boolean,
      default: false,
    },

    image: {
      type: String,
      required: true,
    },

    classes: {
      type: String,
      default: '',
    },
  },

  setup(props) {
    const getSvgPath = computed(() => {
      const base = window.location.origin;

      if (props.isIconFolder) {
        return `${base}/icons/${props.image}.svg`;
      }

      if (props.isIllustrationFolder) {
        return `${base}/illustrations/${props.image}.svg`;
      }

      return `${base}/${props.image}.svg`;
    });

    return {
      getSvgPath,
    };
  },
});
</script>
