"use client";

import { IProduct } from "../graphql/interface";
import useTimeAgo from "../lib/use-time-stamp";

interface IProps {
  product: IProduct;
}

export default function Product(props: IProps) {
  const timestamp = useTimeAgo(new Date(props.product.postedAt));
  const product = props.product;
  return (
    <div className="rounded-md border border-gray-300 shadow">
      <a href={product.url} target="_blank" rel="noopener noreferrer">
        <div className="h-full">
          <div className="flex bg-blue-300 px-5 py-2 text-sm justify-between">
            <h2 className="font-bold">{product.provider.nameKr}</h2>
            <h4>{product.category}</h4>
          </div>
          <div className="flex justify-between">
            <h3 className="pl-4 pr-2 my-2">{product.title}</h3>
            <h4 className="pr-4 pl-2 my-2 text-xs whitespace-nowrap">
              {timestamp}
            </h4>
          </div>
        </div>
      </a>
    </div>
  );
}
