"use client";

import ListUsers from "../../components/listusers";

export const dynamic = "force-dynamic";

export default function ClientSide() {
  // const { loading, error, data } = useSubscription<IProductOutput>(COMMENTS_SUBSCRIPTION);
  return <ListUsers />;
}
