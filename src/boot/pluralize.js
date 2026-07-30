// quasar new boot pluralize
import { boot } from 'quasar/wrappers';

// npm package
import pluralize from 'pluralize';

export default boot(({ app }) => {
  // Make `pluralize` available in the global properties of your app
  app.config.globalProperties.$pluralize = pluralize;
});
