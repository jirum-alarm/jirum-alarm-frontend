"use client";

import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import SwipeableViews from "react-swipeable-views";

import { QueryProducts } from "../graphql";
import { IProduct, IProductOutput } from "../interface";
import Product from "./product";

export default function ProductList() {
  const limit = 20;
  const [products, setProducts] = useState<IProduct[]>([]);
  const [hasNext, setHasNext] = useState<boolean>(true);
  const { ref, inView } = useInView({ threshold: 0 });

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
    <main>
      {error ? (
        <p>게시글을 불러오지 못했습니다.</p>
      ) : !data ? (
        <p>로딩중....</p>
      ) : (
        <SwipeableViews>
          <div className="flex">
            <div className="item-center mx-5 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {products.map((product) => (
                <Product key={product.id} product={product}></Product>
              ))}
            </div>
          </div>
          <div className="flex">
            <div className="item-center mx-5 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {products.map((product) => (
                <Product key={product.id} product={product}></Product>
              ))}
            </div>
          </div>
          <div className="flex">
            <div className="item-center mx-5 grid grid-cols-1 gap-8 sm:grid-cols-2">
              {products.map((product) => (
                <Product key={product.id} product={product}></Product>
              ))}
            </div>
          </div>
        </SwipeableViews>
      )}
      <div ref={ref} className="h-48 w-full" />
    </main>
  );
}
