// quasar wrappers
import { boot } from 'quasar/wrappers';

// component
import LocalSvgIcon from 'components/Global/LocalSvgIcon.vue';

// composables
import { useToast } from 'src/composables/toast';

export default boot(({ app }) => {
  // component
  app.component('LocalSvgIcon', LocalSvgIcon);

  // Make the toast function available globally
  const { triggerToast, hideToast } = useToast();

  app.config.globalProperties.$hideToast = hideToast;
  app.config.globalProperties.$toast = triggerToast;
});
