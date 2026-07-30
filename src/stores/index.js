// pinia
import { createPinia } from 'pinia';

// quasar wrappers
import { store } from 'quasar/wrappers';

// store plugins
import { secureLSPlugin } from 'src/stores/plugins/secureLS';

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default store((/* { ssrContext } */) => {
  const pinia = createPinia();

  // secure LS
  pinia.use(secureLSPlugin);

  return pinia;
});
