// quasar wrappers
import { boot } from 'quasar/wrappers';

// utils
import { setDefaultPrimaryAndSecondaryColor, setDefaultOtherColors } from 'src/utils/quasarHelpers';

export default boot(() => {
  setDefaultPrimaryAndSecondaryColor();
  setDefaultOtherColors();
});
