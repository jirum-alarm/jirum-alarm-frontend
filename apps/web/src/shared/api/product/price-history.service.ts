import { execute } from '@/shared/lib/http-client';

import { TypedDocumentString } from '../gql/graphql';

/** SELF = 이 상품 자신의 날짜별 관측가만(다른 딜 없음). */
export type PriceHistoryBasis = 'MAPPING' | 'CLUSTER' | 'SIMILAR' | 'SELF';
export type PriceHistoryConfidence = 'HIGH' | 'LOW';

export interface PriceHistoryDeal {
  id: number;
  title: string;
  displayTitle: string | null;
  parsedPrice: number;
  price: string | null;
  priceCurrency: string | null;
  postedAt: string;
  thumbnail: string | null;
  providerId: number;
  providerName: string | null;
  url: string | null;
  categoryId: number | null;
  isSeed: boolean;
}

export interface PriceHistoryPoint {
  date: string;
  price: number;
  deal: PriceHistoryDeal;
  deals: PriceHistoryDeal[];
}

export interface ProductPriceHistory {
  basis: PriceHistoryBasis;
  confidence: PriceHistoryConfidence;
  currency: string;
  rangeDays: number;
  pointCount: number;
  sampleCount: number;
  disclaimer: string | null;
  priceAxis?: string | null;
  unitLabel?: string | null;
  /** 가격추이 가치 실험(price_history_holdout_v1) holdout 기기 — 차트를 그리지 않는다. */
  holdout?: boolean | null;
  points: PriceHistoryPoint[];
}

/** 상품 상세 → /deals/{slug} CTA 용 (발행된 모델 페이지만). */
export interface ProductModelPageLink {
  slug: string;
  modelName: string;
  brand: string | null;
  dealCount: number;
}

interface QueryProductPriceHistoryResult {
  product: {
    id: number;
    priceHistory: ProductPriceHistory | null;
    modelPage: ProductModelPageLink | null;
  } | null;
}

const QueryProductPriceHistory = new TypedDocumentString<
  QueryProductPriceHistoryResult,
  { id: number; days?: number }
>(`
  query QueryProductPriceHistory($id: Int!, $days: Int) {
    product(id: $id) {
      id
      priceHistory(days: $days) {
        basis
        confidence
        currency
        rangeDays
        pointCount
        sampleCount
        disclaimer
        holdout
        priceAxis
        unitLabel
        points {
          date
          price
          deal {
            id
            title
            displayTitle
            parsedPrice
            price
            priceCurrency
            postedAt
            thumbnail
            providerId
            providerName
            url
            categoryId
            isSeed
          }
          deals {
            id
            title
            displayTitle
            parsedPrice
            postedAt
            thumbnail
            providerName
            isSeed
          }
        }
      }
      modelPage {
        slug
        modelName
        brand
        dealCount
      }
    }
  }
`);

export const PriceHistoryService = {
  /** 상세 일별 핫딜가 추이. null 이면 섹션 숨김(점 부족·게이트 실패). */
  async getPriceHistory(variables: { id: number; days?: number }) {
    return execute(QueryProductPriceHistory, variables).then((res) => res.data);
  },
};
