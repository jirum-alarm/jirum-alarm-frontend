"use client";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { QueryProducts } from "../graphql";
import { IProduct, IProductOutput } from "../interface";

export default function ListUsers() {
  const limit = 100;
  const [products, setProducts] = useState<IProduct[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(true);
  const { ref, inView } = useInView({ threshold: 1 });

  const { data, error, fetchMore } = useSuspenseQuery<IProductOutput>(
    QueryProducts,
    {
      variables: { limit },
    },
  );

  const fetch = useCallback(async () => {
    if (hasNext) {
      const lastProduct = products.at(-1);
      const searchAfter = lastProduct?.searchAfter;
      const newProducts = await fetchMore({
        variables: { limit, searchAfter },
      });
      setHasNext(newProducts.data.products.length === limit);
      setProducts([...products, ...newProducts.data.products]);
    }
  }, [fetchMore, products, hasNext]);

  useEffect(() => {
    if (inView && hasNext) {
      fetch();
    }
  }, [inView, hasNext]);

  return (
    <main style={{ maxWidth: 1200, marginInline: "auto", padding: 20 }}>
      {error ? (
        <p>Oh no, there was an error</p>
      ) : !data ? (
        <p>Loading...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: 20,
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{ border: "1px solid #ccc", textAlign: "center" }}
            >
              <h3>{product.title}</h3>
            </div>
          ))}
        </div>
      )}
      <div ref={ref} className="h-96 w-full" />
    </main>
  );
}
function sleep(arg0: number) {
  throw new Error("Function not implemented.");
}
