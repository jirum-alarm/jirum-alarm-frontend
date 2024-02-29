'use client';

import { IProduct } from '@/graphql/interface';
import useTimeAgo from '@/lib/use-time-stamp';

interface IProductCard {
  product: IProduct;
}

export const ProductCard = (props: IProductCard) => {
  const timestamp = useTimeAgo(new Date(props.product.postedAt));
  const product = props.product;
  return (
    <div className="rounded-md border border border-gray-300 shadow transition duration-200 hover:shadow-md">
      <a href={product.url} target="_blank" rel="noopener noreferrer">
        <div className="h-full">
          <div className="flex justify-between bg-primary-100 px-5 py-2 text-sm">
            <h2 className="font-bold">{product.provider.nameKr}</h2>
            <h4>{product.category}</h4>
          </div>
          <div className="flex justify-between">
            <h3 className="my-2 break-all pl-4 pr-2">{product.title}</h3>
            <h4 className="my-2 whitespace-nowrap pl-2 pr-4 text-xs">{timestamp}</h4>
          </div>
        </div>
      </a>
    </div>
  );
};
export default ProductCard;
