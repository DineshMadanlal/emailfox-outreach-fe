// constants
import { IS_PRIMARY_PLATFORM } from 'boot/constants';

export const getRootDomain = () => {
  const rootDomain = window.location.hostname.split('.').slice(-2).join('.');

  return rootDomain;
};

export const isMainApp = () => {
  if (IS_PRIMARY_PLATFORM) {
    return true;
  }

  try {
    const { hostname } = window.parent.location;

    return hostname === 'icemail.ai'
      || hostname.endsWith('.icemail.ai')
      || hostname === 'outreachfox.ai'
      || hostname.endsWith('.outreachfox.ai');
  } catch (error) {
    return false;
  }
};

export const getPrimaryBrandColor = () => {
  const color = getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim();

  return color || '#1C1F26';
};

export const applyBranding = (brand = {}) => {
  const {
    description = 'Get Infrastructure That Helps You Land in the Inbox. Not the Spam Folder',
    themeColor = getPrimaryBrandColor(),
    analyticsId = 'G-KN3V7N7M95',
    icons = {
      128: 'icons/custom-favicon-128x128.png',
      96: 'icons/custom-favicon-96x96.png',
      32: 'icons/custom-favicon-32x32.png',
      16: 'icons/custom-favicon-16x16.png',
      ico: 'custom-favicon.ico',
    },
  } = brand;

  // description
  if (description) {
    const descTag = document.querySelector('meta[name="description"]') || document.createElement('meta');
    descTag.name = 'description';
    descTag.content = description;
    if (!descTag.parentNode) document.head.appendChild(descTag);
  }

  // theme color
  if (themeColor) {
    // 3. Theme color
    const themeMeta = document.querySelector('meta[name="theme-color"]') || document.createElement('meta');
    themeMeta.name = 'theme-color';
    themeMeta.content = themeColor;
    if (!themeMeta.parentNode) document.head.appendChild(themeMeta);
  }

  if (icons) {
    // 4. Favicons
    Object.entries(icons).forEach(([size, src]) => {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = src;
      link.type = src.endsWith('.ico') ? 'image/x-icon' : 'image/png';
      if (size !== 'ico') link.sizes = `${size}x${size}`;
      document.head.appendChild(link);
    });
  }

  // 5. Optional: Google Fonts (you can make this conditional)
  const font = document.createElement('link');
  font.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined';
  font.rel = 'stylesheet';
  document.head.appendChild(font);

  // 6. Optional: Google Analytics (only if `analyticsId` is present)
  if (analyticsId) {
    const gtagScript = document.createElement('script');
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`;
    gtagScript.async = true;
    document.head.appendChild(gtagScript);

    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${analyticsId}');
    `;
    document.head.appendChild(inlineScript);
  }
};

export const applyExternalScripts = (scripts = []) => {
  scripts.forEach(({ placement = 'head', script: content }) => {
    if (!content) return;

    const container = placement === 'body' ? document.body : document.head;

    // Wrap content in a dummy div to extract <script> nodes
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    Array.from(tempDiv.querySelectorAll('script')).forEach((scriptEl) => {
      const s = document.createElement('script');

      if (scriptEl.src) {
        s.src = scriptEl.src;
        s.async = scriptEl.async;
        s.defer = scriptEl.defer;
      } else {
        s.text = scriptEl.textContent;
      }

      container.appendChild(s);
    });
  });
};
