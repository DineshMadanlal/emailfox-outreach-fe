// vue
import { provide } from 'vue';

// quasar wrappers - boot
import { boot } from 'quasar/wrappers';

// Vue apollo
import { createApolloProvider } from '@vue/apollo-option';

// vue apollo composable
import { ApolloClients } from '@vue/apollo-composable';

// apollo client
import { client1 } from 'src/graphql/apollo';

export default boot(({ app }) => {
  const apolloProvider = createApolloProvider({
    clients: {
      client1,
    },
    defaultClient: client1,
  });

  // for vue2
  app.use(apolloProvider);

  app.config.globalProperties.apolloProvider = apolloProvider;

  app.setup = () => {
    provide(ApolloClients, {
      default: client1,
    });
    return {};
  };
});
