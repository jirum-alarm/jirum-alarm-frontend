"use client";
import { ApolloClient, HttpLink, SuspenseCache } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import {
  ApolloNextAppProvider,
  NextSSRInMemoryCache,
} from "@apollo/experimental-nextjs-app-support/ssr";

import {
  GRAPHQL_ENDPOINT,
  GRAPHQL_SUBSCRIPTIONS_ENDPOINT,
} from "@/common/constant";
import { split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

function makeClient() {
  const httpLink = new HttpLink({ uri: GRAPHQL_ENDPOINT });

  const wsLink =
    typeof window !== "undefined"
      ? new GraphQLWsLink(
          createClient({
            url: GRAPHQL_SUBSCRIPTIONS_ENDPOINT,
          }),
        )
      : null;

  const link =
    typeof window !== "undefined" && wsLink != null
      ? split(
          ({ query }) => {
            const def = getMainDefinition(query);
            return (
              def.kind === "OperationDefinition" &&
              def.operation === "subscription"
            );
          },
          wsLink,
          httpLink,
        )
      : httpLink;

  return new ApolloClient({ cache: new NextSSRInMemoryCache(), link });
}

function makeSuspenseCache() {
  return new SuspenseCache();
}

export function ApolloWrapper({ children }) {
  return (
    <ApolloNextAppProvider
      makeClient={makeClient}
      makeSuspenseCache={makeSuspenseCache}
    >
      {children}
    </ApolloNextAppProvider>
  );
}
