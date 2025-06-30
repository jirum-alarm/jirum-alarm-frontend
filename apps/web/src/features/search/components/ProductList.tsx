import { ProductLiveHotdealsImageCard, useCollectProduct } from '@/features/products';
import { IProduct } from '@/graphql/interface';

export default function ProductList({ products }: { products: IProduct[] }) {
  const collectProduct = useCollectProduct();

  return (
    <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-3 md:gap-x-5">
      {products.map((product) => (
        <ProductLiveHotdealsImageCard
          key={product.id}
          product={product}
          collectProduct={collectProduct}
          logging={{ page: 'SEARCH_RESULT' }}
        />
      ))}
    </div>
  );
}
