// quasar wrappers
import { boot } from 'quasar/wrappers';

// vue
import { computed } from 'vue';

// Libraries
import Cookies from 'js-cookie';

// Pinia
import { useAuthStore } from 'src/stores/auth';

// utils
import { isMainApp } from 'src/utils/applyBranding';
import { trackUserEvent } from 'src/utils/externalServices';
import { getWorkspaceSlugFromUrl } from 'src/utils/helperFunctions';

// methods
const getWorkspaceSlugFromRoute = () => getWorkspaceSlugFromUrl();

const getWorkspaceAppPath = ({
  path, activeWorkspaceData,
}) => {
  const workspaceSlug = activeWorkspaceData?.slug || getWorkspaceSlugFromRoute();

  if (!workspaceSlug) {
    // request the user to create a workspace
    return '/workspace/choose';
  }

  return `/outreach${path}`;
};

// CRITICAL: Notice the "async" keyword added here to handle the background backend handshake
export default boot(({ router }) => {
  router.beforeEach(async (to, from, next) => {
    // Access the authentication store
    const authStorePinia = useAuthStore();
    const isPrimaryPlatform = isMainApp();
    // for primary platform
    const isDevMode = !!process.env.DEV_MODE;

    // computed
    const isAuthenticated = computed(() => authStorePinia.isAuthenticated);
    const activeWorkspaceData = computed(() => authStorePinia.activeWorkspaceData);

    // ========================================================
    // 🧠 SILENT AUTH HYDRATION LAYER
    // ========================================================

    if (isPrimaryPlatform && !isAuthenticated.value) {
      // Look for the plaintext frontend-visible session hint cookie
      const hasLoginSession = Cookies.get('logged_in') === 'true';

      if (hasLoginSession) {
        try {
          // Trigger the HTTP-Only cookie backend exchange
          await authStorePinia.refreshSession();
        } catch (error) {
          if (isDevMode) {
            Cookies.remove('logged_in', { domain: '.skysenders.local', path: '/' });
          } else {
            // Handshake failed (e.g., token expired or revoked on server)
          // Wipe the public hint cookie immediately so we don't spam the API on next load
            Cookies.remove('logged_in', { domain: '.emailfox.ai', path: '/' });
          }

          // Clear out the memory
          authStorePinia.logoutUser();
        }
      }
    }

    // ========================================================
    // 🛡️ EXISTING AUTHORIZATION AND ROUTING LOGIC
    // ========================================================

    const { isSemiPublic, requiresAuth } = to.meta;

    // workspace routes are restricted for users with workspace URL
    // ex: DONT ALLOW: workspace.app.emailfox.ai
    // ALLOW: app.emailfox.ai
    const workspaceRestrictedRoutes = [
      // workspace related routes
      '/workspace/create',
      '/workspace/join',
      '/workspace/choose',
    ];

    // whitelabeled customers restricted routes
    const whitelabelRestrictedRoutes = [
      // auth related routes
      '/oauth/callback',

      // settings
      '/settings/general',
      '/settings/members/team',
      '/settings/members/clients',
      '/settings/billing',
    ];

    if (isPrimaryPlatform) {
      // restrict this routes for whitelabeled app
      const isRouteRestricted = workspaceRestrictedRoutes.some(
        (data) => to.path.includes(data),
      );

      if (activeWorkspaceData.value?.id && isRouteRestricted) {
        // go back to the previous page
        next({
          path: getWorkspaceAppPath({
            path: '/campaigns-all',
            activeWorkspaceData: activeWorkspaceData.value,
          }),
        });

        return;
      }
    } else {
      // restrict this routes for whitelabeled app
      const isRouteRestricted = whitelabelRestrictedRoutes.some(
        (data) => to.path.includes(data),
      );

      if (isRouteRestricted) {
        // redirect to the analytics page
        next({
          path: getWorkspaceAppPath({
            path: '/campaigns-all',
            activeWorkspaceData: activeWorkspaceData.value,
          }),
        });

        return;
      }
    }

    // track page route event
    if (isAuthenticated.value && isPrimaryPlatform) {
      // Only track page views for authenticated users
      trackUserEvent('Page Navigation', {
        page: to.fullPath,
        referrer: from.fullPath,
      });
    }

    /** If the user is authenticated and the page is semi-public,
     * redirect them away from login/signup */
    if (isAuthenticated.value && isSemiPublic) {
      next({
        path: getWorkspaceAppPath({
          path: '/campaigns-all',
          activeWorkspaceData: activeWorkspaceData.value,
        }),
      });

      return;
    }

    // If the page requires authentication and the user is not authenticated, redirect to login
    if (!isAuthenticated.value && requiresAuth) {
      next({
        path: '/login',
        query: { redirect: to.fullPath },
      });

      return;
    }

    // Otherwise, allow access
    next();
  });

  /** Handle router errors */
  router.onError((error, to) => {
    const isChunkLoadError = error.name === 'ChunkLoadError'
    || /Loading chunk.*failed/i.test(error.message)
    || /Failed to fetch dynamically imported module/i.test(error.message);

    if (!isChunkLoadError) return;

    alert('A new version is available. The page will reload.');

    const targetPath = to?.fullPath || window.location.pathname;

    window.location.assign(targetPath);
  });
});
