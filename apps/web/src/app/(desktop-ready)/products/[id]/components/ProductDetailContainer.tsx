import { notFound } from 'next/navigation';

import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import DeviceSpecific from '@/components/layout/DeviceSpecific';
import { ProductService } from '@/shared/api/product';

import DesktopProductDetailLayout from './desktop/ProductDetailLayout';
import ProductDetailLayout from './mobile/ProductDetailLayout';

export default async function ProductDetailContainer({ productId }: { productId: number }) {
  const { product } = await ProductService.getProduct({ id: productId });

  if (!product) notFound();

  return (
    <ApiErrorBoundary>
      <DeviceSpecific
        mobile={<ProductDetailLayout product={product} productId={productId} />}
        desktop={<DesktopProductDetailLayout product={product} productId={productId} />}
      />
    </ApiErrorBoundary>
  );
}
