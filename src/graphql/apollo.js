// npm modules
import {
  ApolloClient, createHttpLink, InMemoryCache, split,
} from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { WebSocketLink } from '@apollo/client/link/ws';
import { getMainDefinition } from '@apollo/client/utilities';

// Utils
import { getUserToken } from 'src/utils/auth';

// Custom fetch function to handle timeouts
const fetchWithTimeout = (url, options = {}) => {
  const { timeout = 10000, ...rest } = options;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout')), timeout);
    fetch(url, rest).then(
      (response) => {
        clearTimeout(timer);
        resolve(response);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
};

// Auth Link
const authLink = setContext((_, { headers }) => {
  const token = getUserToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error Link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    // graphQLErrors.forEach(({ message, locations, path }) => {
    //   console.error(`[GraphQL error]:Message: ${message},Location: ${locations},Path: ${path}`);
    // });
  }
  if (networkError) {
    // console.error(`[Network error]: ${networkError}`);
  }
});

// Default options for Apollo Client
const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
};

// Cache configuration with type policies
const cache = new InMemoryCache({
  typePolicies: {
    Publication: {
      fields: {
        items: {
          // eslint-disable-next-line default-param-last
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
      },
    },
    Post: {
      fields: {
        items: {
          // eslint-disable-next-line default-param-last
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
      },
    },
  },
});

// Function to create Apollo Client
const createClient = (urlString) => {
  // HTTP Link configuration
  const httpLink = createHttpLink({
    uri: `https://${urlString}`,
    fetch: (
      uri,
      options,
    ) => fetchWithTimeout(uri, { ...options, timeout: 6000 }), // Timeout of 6 seconds
  });

  // WebSocket Link configuration
  const wsLinkConfig = {
    uri: `wss://${urlString}`,
    options: {
      lazy: true,
      reconnect: true,
      connectionParams: () => ({
        headers: {
          Authorization: `Bearer ${getUserToken()}`,
        },
      }),
    },
  };

  // Create WebSocket Link
  const wsLink = new WebSocketLink(wsLinkConfig);

  // Split link based on operation type (query/mutation vs subscription)
  const link = split(
    ({ query }) => {
      const definition = getMainDefinition(query);
      return (
        definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
      );
    },
    wsLink,
    httpLink,
  );

  // Create and return the Apollo Client
  return new ApolloClient({
    link: errorLink.concat(authLink).concat(link),
    cache,
    defaultOptions,
  });
};

// utils
import { isMainApp } from 'src/utils/applyBranding';

const isPrimaryApp = isMainApp();

let graphqlEndpoint = 'gql.apiruntime.com/v1/graphql';

if (isPrimaryApp) {
  graphqlEndpoint = process.env.GRAPHQL_ENDPOINT;
}

// Export the client (using a sample environment variable for endpoint)
export const client1 = createClient(graphqlEndpoint);
