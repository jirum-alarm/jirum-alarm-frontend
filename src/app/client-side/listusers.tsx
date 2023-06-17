"use client";

import { gql } from "@apollo/client";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import React from "react";

const query = gql`
  query {
    products(limit: 10) {
      id
      title
      mallId
      providerId
    }
  }
`;

interface Response {
  products: { id: number; title: string }[];
}

export default function ListUsers() {
  const [count, setCount] = React.useState(0);
  const { data, error } = useSuspenseQuery<Response>(query);

  return (
    <main style={{ maxWidth: 1200, marginInline: "auto", padding: 20 }}>
      <div style={{ marginBottom: "4rem", textAlign: "center" }}>
        <h4 style={{ marginBottom: 16 }}>{count}</h4>
        <button onClick={() => setCount((prev) => prev + 1)}>increment</button>
        <button
          onClick={() => setCount((prev) => prev - 1)}
          style={{ marginInline: 16 }}
        >
          decrement
        </button>
        <button onClick={() => setCount(0)}>reset</button>
      </div>

      {error ? (
        <p>Oh no, there was an error</p>
      ) : !data ? (
        <p>Loading...</p>
      ) : data ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 20,
          }}
        >
          {data?.products.map((product) => (
            <div
              key={product.id}
              style={{ border: "1px solid #ccc", textAlign: "center" }}
            >
              <h3>{product.title}</h3>
            </div>
          ))}
        </div>
      ) : null}
    </main>
  );
}
