import { checkDevice } from '@/app/actions/agent';
import { getAccessToken } from '@/app/actions/token';
import ApiErrorBoundary from '@/components/ApiErrorBoundary';
import DeviceSpecific from '@/components/layout/DeviceSpecific';
import { ProductService } from '@/shared/api/product';

import DesktopProductDetailLayout from './desktop/ProductDetailLayout';
import ProductDetailLayout from './mobile/ProductDetailLayout';
import ProductFetcher from './ProductFetcher';

export default async function ProductDetailContainer({ productId }: { productId: number }) {
  // 서버에서 필요한 데이터들을 미리 가져옴 - Next.js fetch 캐싱 적용
  const [{ isMobile }, token] = await Promise.all([checkDevice(), getAccessToken()]);

  const isUserLogin = !!token;

  return (
    <ApiErrorBoundary>
      <DeviceSpecific
        mobile={<ProductDetailLayout productId={productId} isUserLogin={isUserLogin} />}
        desktop={
          <DesktopProductDetailLayout
            productId={productId}
            isUserLogin={isUserLogin}
            isMobile={isMobile}
          />
        }
      />
    </ApiErrorBoundary>
  );
}
