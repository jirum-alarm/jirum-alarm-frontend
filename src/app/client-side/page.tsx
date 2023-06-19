"use client";
import { gql, useSubscription } from "@apollo/client";

import ListUsers from "./listusers";

export const dynamic = "force-dynamic";

const COMMENTS_SUBSCRIPTION = gql`
  subscription productAdded {
    productAdded {
      id
    }
  }
`;

interface IProduct {
  id: number;
}

export default function ClientSide() {
  const { loading, error, data } = useSubscription(COMMENTS_SUBSCRIPTION);
  return <ListUsers />;
}
