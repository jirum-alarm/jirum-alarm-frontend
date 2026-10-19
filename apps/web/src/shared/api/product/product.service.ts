// 상품 API 묶음 — 도메인별 *.service.ts 를 한 이름(ProductService)으로 모은다. 호출부는 그대로 ProductService.xxx.
import { PriceHistoryService } from './price-history.service';
import { ProductDetailService } from './product-detail.service';
import { ProductExperimentService } from './product-experiment.service';
import { ProductListService } from './product-list.service';
import { ProductRelatedService } from './product-related.service';
import { ProductTrackingService } from './product-tracking.service';
import { UserProductService } from './user-product.service';

export type * from './product-list.service';
export type * from './product-detail.service';
export type * from './price-history.service';
export type * from './product-related.service';
export type * from './product-experiment.service';
export type * from './product-tracking.service';
export type * from './user-product.service';

export const ProductService = {
  ...ProductListService,
  ...ProductDetailService,
  ...PriceHistoryService,
  ...ProductRelatedService,
  ...ProductExperimentService,
  ...ProductTrackingService,
  ...UserProductService,
};
