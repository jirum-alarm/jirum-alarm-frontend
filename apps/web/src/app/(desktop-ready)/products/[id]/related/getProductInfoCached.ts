import { cache } from 'react';

import { ProductService } from '@/shared/api/product';

// generateMetadata, layout, page에서 동일 productId로 중복 호출되므로 요청 단위로 캐싱
export const getProductInfoCached = cache((id: number) => ProductService.getProductInfo({ id }));
