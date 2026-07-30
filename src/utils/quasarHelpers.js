// quasar
import { colors } from 'quasar';

// lodash
import { forEach } from 'lodash';

// constants
import {
  DEFAULT_BRAND_OTHER_COLORS,
  DARK_MODE_BRAND_OTHER_COLORS, BRANDS_PRIMARY_SECONDAY_COLOR,
} from 'src/boot/constants';

// for use in boot files
export const setBrandColor = (colorName, colorValue) => {
  const root = document.documentElement;

  // hex color
  root.style.setProperty(colorName, colorValue);
};

export const getBrandPrimaryAndSecondaryColor = () => BRANDS_PRIMARY_SECONDAY_COLOR.EMAIL_FOX;

export const setPartnerBrandColors = (branding) => {
  const defaultBrandColors = getBrandPrimaryAndSecondaryColor();

  const brandindColours = {
    primary: branding.primary_color || defaultBrandColors.primary,
    secondary: branding.secondary_color || defaultBrandColors.secondary,
    white: branding.light_text_color || DEFAULT_BRAND_OTHER_COLORS.white,
    black: branding.dark_text_color || DEFAULT_BRAND_OTHER_COLORS.black,
  };

  forEach(brandindColours, (colorValue, colorName) => {
    const hexToRgbColor = colors.hexToRgb(colorValue);

    setBrandColor(`--${colorName}-color`, colorValue);
    setBrandColor(`--${colorName}-rgb`, `${hexToRgbColor.r}, ${hexToRgbColor.g}, ${hexToRgbColor.b}`);
  });
};

export const setDefaultPrimaryAndSecondaryColor = () => {
  const defaultBrandColors = getBrandPrimaryAndSecondaryColor();

  forEach(defaultBrandColors, (colorValue, colorName) => {
    const hexToRgbColor = colors.hexToRgb(colorValue);

    setBrandColor(`--${colorName}-color`, colorValue);
    setBrandColor(`--${colorName}-rgb`, `${hexToRgbColor.r}, ${hexToRgbColor.g}, ${hexToRgbColor.b}`);
  });
};

export const setDefaultOtherColors = () => {
  forEach(DEFAULT_BRAND_OTHER_COLORS, (colorValue, colorName) => {
    const hexToRgbColor = colors.hexToRgb(colorValue);

    setBrandColor(`--${colorName}-color`, colorValue);
    setBrandColor(`--${colorName}-rgb`, `${hexToRgbColor.r}, ${hexToRgbColor.g}, ${hexToRgbColor.b}`);
  });
};

export const setDarkModeColors = () => {
  forEach(DARK_MODE_BRAND_OTHER_COLORS, (colorValue, colorName) => {
    const hexToRgbColor = colors.hexToRgb(colorValue);

    setBrandColor(`--${colorName}-color`, colorValue);
    setBrandColor(`--${colorName}-rgb`, `${hexToRgbColor.r}, ${hexToRgbColor.g}, ${hexToRgbColor.b}`);
  });
};

export const getSecondaryColor = (primaryColor) => {
  const rgb = colors.hexToRgb(primaryColor);

  // dynamic darkening
  let opacity = 32;

  // very bright colors darken more
  if (rgb.r > 120 || rgb.g > 120 || rgb.b > 120) {
    opacity = 42;
  }

  const secondaryRgb = {
    r: Math.round(rgb.r * (1 - opacity / 100)),
    g: Math.round(rgb.g * (1 - opacity / 100)),
    b: Math.round(rgb.b * (1 - opacity / 100)),
  };

  return {
    hex: colors.rgbToHex(secondaryRgb),
    rgb: secondaryRgb,
  };
};

export const updatePrimaryAndSecondaryColor = (theme) => {
  const defaultBrandColors = getBrandPrimaryAndSecondaryColor();

  if (theme.toLowerCase() === defaultBrandColors.primary.toLowerCase()) {
    setDefaultPrimaryAndSecondaryColor();
    return;
  }

  const hexToRgbColor = colors.hexToRgb(theme);

  setBrandColor('--primary-color', theme);
  setBrandColor('--primary-rgb', `${hexToRgbColor.r}, ${hexToRgbColor.g}, ${hexToRgbColor.b}`);

  const secondaryColorJson = getSecondaryColor(theme);
  setBrandColor('--secondary-color', secondaryColorJson.hex);
  setBrandColor('--secondary-rgb', `${secondaryColorJson.rgb.r}, ${secondaryColorJson.rgb.g}, ${secondaryColorJson.rgb.b}`);
};

export const hexToRgba = (hex, opacity = 0.2) => {
  // Remove the hash (#) if present
  hex = hex.replace(/^#/, '');

  // Parse the r, g, b values from the hex
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Return the RGBA string
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const getMaxHeightOfPage = () => {
  /** A function which will return height which is a string in px.
   * It will be used to set the max-height of the page excluding the header.
  */

  // Get the viewport height
  const viewportHeight = window.innerHeight;

  // get the padding of the main page
  const mainPageElement = document.getElementById('appMainPage');
  const mainPageComputedStyles = window.getComputedStyle(mainPageElement);

  // multiple by two because of padding top and padding bottom
  const mainPagePadding = parseInt(mainPageComputedStyles.padding, 10) * 2;

  // Get the header height
  const headerHeight = document.getElementById('appHeader')?.offsetHeight || 0;

  const maxHeight = viewportHeight - headerHeight - mainPagePadding;

  return `${maxHeight}px`;
};

export const getBrandColorByName = (colorName) => getComputedStyle(document.body).getPropertyValue(`--${colorName}-color`);

export const getBrandRgbColorByName = (colorName) => getComputedStyle(document.body).getPropertyValue(`--${colorName}-rgb`);

export const darkenColor = (hex, percent) => colors.lighten(hex, -percent);

export const getBlendedHexFromRgba = (
  rgbaStr,
  bgRgb = { r: 255, g: 255, b: 255 },
) => {
  if (!rgbaStr) return '';

  // 1. Extract numerical values using Regex
  const matches = rgbaStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i);
  if (!matches) return '';

  const r = Number(matches[1]);
  const g = Number(matches[2]);
  const b = Number(matches[3]);
  const a = matches[4] !== undefined ? Number(matches[4]) : 1.0;

  // 2. Alpha blend foreground RGB over background RGB
  const blendedR = Math.round(r * a + bgRgb.r * (1 - a));
  const blendedG = Math.round(g * a + bgRgb.g * (1 - a));
  const blendedB = Math.round(b * a + bgRgb.b * (1 - a));

  // 3. Convert composite RGB to standard #HEX using Quasar helper
  return colors.rgbToHex({
    r: blendedR,
    g: blendedG,
    b: blendedB,
  });
};
