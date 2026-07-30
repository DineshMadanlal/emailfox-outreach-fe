// lodash
import size from 'lodash/size';

// vue
import {
  computed, reactive, toRefs,
} from 'vue';

// utils
import { convertStringToNumber } from 'src/utils/numbers';
import { updatePrimaryAndSecondaryColor } from 'src/utils/quasarHelpers';
import { getApiCall, postApiCall, putApiCall } from 'src/utils/apiRequests';

// pinia
import { useAuthStore } from 'src/stores/auth';
import { useUserPreferencesStore } from 'stores/userPreferences';

// constants
import { TEAM_MEMBER_ROLES } from 'src/boot/workspace-constants';

export function useWorkspace() {
  // Access the user store
  const authStorePinia = useAuthStore();
  const userPreferencesStore = useUserPreferencesStore();

  // state
  const state = reactive({
    isWorkspaceApiLoading: false,

    workspacesLoaded: false,
  });

  // computed
  const activeUserJson = computed(() => authStorePinia.getUser);
  const allWorkspaces = computed(() => userPreferencesStore.getAllWorkspaces);
  const activeWorkspaceData = computed(() => authStorePinia.getActiveWorkspaceData);

  const workspaceSlug = computed(() => activeWorkspaceData.value?.slug || '');

  const workspaceBaseUrl = computed(() => {
    const { host } = window.location;

    const parts = host.split('.');

    // workspace.app.emailfox.ai -> app.emailfox.ai
    if (parts.length > 3) {
      return `/${parts.slice(1).join('.')}`;
    }

    return `/${host}`;
  });

  const isWorkspaceValid = computed(() => !!size(activeWorkspaceData.value));

  const activeWorkspaceJson = computed(() => {
    if (!activeWorkspaceData.value?.id) {
      return {};
    }

    return allWorkspaces.value.find((ws) => ws.id === activeWorkspaceData.value.id) || {};
  });

  const activeWorkspaceId = computed(() => activeWorkspaceData.value?.id || null);

  const activeWorkspaceName = computed(() => activeWorkspaceJson.value?.name || '');

  const isRoleAdminOrAbove = computed(() => {
    const role = activeWorkspaceJson.value?.role;

    return [TEAM_MEMBER_ROLES.SUPER_ADMIN.value, TEAM_MEMBER_ROLES.ADMIN.value].includes(role);
  });

  const isClientLoggedIn = computed(() => !!activeUserJson.value?.is_client);

  const isSuperAdminLoggedIn = computed(
    () => activeWorkspaceJson.value?.role === TEAM_MEMBER_ROLES.SUPER_ADMIN.value,
  );

  // methods
  const getWorkspaceTwoLetterAcronym = (workspace) => {
    if (!workspace.name) return '';

    const words = workspace.name.trim().split(' ');
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const fetchAllWorkspaces = async () => {
    try {
      state.isWorkspaceApiLoading = true;

      const workspaces = await getApiCall({
        endpoint: '/workspace/fetch-all',
      });

      // store in pinia
      userPreferencesStore.setField({
        field: 'allWorkspaces',
        value: workspaces,
      });

      // update the active workspace json
      const activeWorkspace = workspaces.find(
        (ws) => ws.id === activeWorkspaceData.value?.id,
      ) || {};

      if (activeWorkspaceData.value?.theme_color !== activeWorkspace.theme_color) {
        // set theme color
        updatePrimaryAndSecondaryColor(activeWorkspace.theme_color || '');
      }

      authStorePinia.setField({
        field: 'activeWorkspaceData',
        value: activeWorkspace,
      });

      state.workspacesLoaded = true;

      return true;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch workspaces');
    } finally {
      state.isWorkspaceApiLoading = false;
    }
  };

  const createNewWorkspace = async (payload) => {
    try {
      const newWorkspace = await postApiCall({
        endpoint: '/workspace',
        payload,
      });

      // Update the workspaces list
      userPreferencesStore.setField({
        field: 'allWorkspaces',
        value: [...allWorkspaces.value, newWorkspace],
      });

      return newWorkspace;
    } catch (error) {
      throw new Error(error.message || 'Failed to create workspace');
    }
  };

  const updateWorkspaceById = async (workspaceId, payload) => {
    try {
      await putApiCall({
        endpoint: `/workspace/${workspaceId}`,
        payload,
      });

      // Update the workspaces list
      const updatedWorkspaces = allWorkspaces.value.map(
        (ws) => (
          convertStringToNumber(ws.id) === convertStringToNumber(workspaceId)
            ? payload : ws),
      );

      userPreferencesStore.setField({
        field: 'allWorkspaces',
        value: updatedWorkspaces,
      });

      authStorePinia.setField({
        field: 'activeWorkspaceData',
        value: payload,
      });

      return payload;
    } catch (error) {
      throw new Error(error.message || 'Failed to update workspace');
    }
  };

  const fetchWorkspaceDetailsBySlug = async (slug) => {
    try {
      const workspaceDetails = await getApiCall({
        endpoint: `/workspace/details?slug=${slug}`,
      });

      return workspaceDetails;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch workspace details');
    }
  };

  const fetchWorkspaceDetailsByWhitelabelUrl = async (domain) => {
    try {
      const workspaceDetails = await getApiCall({
        endpoint: `/workspace/details-by-domain?custom_domain_url=${domain}`,
      });

      return workspaceDetails;
    } catch (error) {
      throw new Error(error.message || 'Failed to fetch workspace details');
    }
  };

  const getAppDomainFromHostname = (hostname = window.location.hostname) => {
    const parts = hostname.split('.');

    // Remove workspace slug if present
    if (parts.length > 3) {
      return parts.slice(1).join('.');
    }

    return hostname;
  };

  const getWorkspaceUrl = (workspace = {}) => {
    const {
      hostname,
      protocol,
      port,
    } = window.location;

    const parts = hostname.split('.');

    let baseHostname = hostname;

    // anotherworkspace.app.emailfox.ai -> app.emailfox.ai
    if (parts.length > 3) {
      baseHostname = parts.slice(1).join('.');
    }

    const workspacePrefix = workspace.slug
      ? `${workspace.slug}.`
      : '';

    const finalPort = process.env.DEV_MODE
      ? `:${port || 8080}`
      : '';

    return `${protocol}//${workspacePrefix}${baseHostname}${finalPort}`;
  };

  // The method will help return the correct action URL
  // for CREATE or JOIN workspace
  const workspceActionUrl = (action) => {
    const {
      hostname,
      protocol,
      port,
    } = window.location;

    const parts = hostname.split('.');

    let baseHostname = hostname;

    // anotherworkspace.app.emailfox.ai -> app.emailfox.ai
    if (parts.length > 3) {
      baseHostname = parts.slice(1).join('.');
    }

    const finalPort = process.env.DEV_MODE
      ? `:${port || 8080}`
      : '';

    return `${protocol}//${baseHostname}${finalPort}/workspace/${action}`;
  };

  // This method is used to sanitize the workspace slug input
  // It converts the input to lowercase, replaces spaces and underscores with hyphens,
  // removes invalid URL characters, collapses multiple hyphens into one,
  // and trims hyphens from the start and end.
  const sanitizeWorkspaceSlug = (value = '') => value
    .toLowerCase()
    .trim()

  // convert all dash variants to normal hyphen
    .replace(/[–—]/g, '-')

  // spaces & underscores -> hyphen
    .replace(/[\s_]+/g, '-')

  // keep only a-z, 0-9 and hyphen
    .replace(/[^a-z0-9-]/g, '')

  // remove duplicate hyphens
    .replace(/-+/g, '-')

  // remove starting/ending hyphens
    .replace(/^-|-$/g, '');

  const getWorkspaceSlugFromInput = (value = '') => {
    const input = value.trim();

    if (!input) return '';

    try {
    // if user pasted full URL
      if (
        input.startsWith('http://')
      || input.startsWith('https://')
      ) {
        const url = new URL(input);

        // subdomain.workspace.com
        const hostnameParts = url.hostname.split('.');

        // get first subdomain
        if (hostnameParts.length > 2) {
          return sanitizeWorkspaceSlug(hostnameParts[0]);
        }

        // fallback to first path segment
        const pathSlug = url.pathname
          .split('/')
          .filter(Boolean)[0];

        return sanitizeWorkspaceSlug(pathSlug || '');
      }

      // raw slug input
      return sanitizeWorkspaceSlug(
        input
          .replace(/^\/+|\/+$/g, '')
          .split('/')[0],
      );
    } catch {
      return sanitizeWorkspaceSlug(input);
    }
  };

  return {
    // state
    ...toRefs(state),

    // computed
    workspaceSlug,
    isWorkspaceValid,
    allWorkspaces,
    workspaceBaseUrl,
    activeWorkspaceName,
    activeWorkspaceJson,
    activeWorkspaceId,

    // role checks
    isClientLoggedIn,
    isRoleAdminOrAbove,
    isSuperAdminLoggedIn,

    // methods
    sanitizeWorkspaceSlug,
    updateWorkspaceById,
    createNewWorkspace,
    fetchAllWorkspaces,
    getWorkspaceUrl,
    workspceActionUrl,
    getWorkspaceSlugFromInput,
    getWorkspaceTwoLetterAcronym,
    fetchWorkspaceDetailsBySlug,
    fetchWorkspaceDetailsByWhitelabelUrl,
    getAppDomainFromHostname,
  };
}
