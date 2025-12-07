import { HotDealType } from '@/shared/api/gql/graphql';

export const hotdealTextMap: Record<HotDealType, string> = {
  [HotDealType.HotDeal]: '핫딜',
  [HotDealType.SuperDeal]: '대박딜',
  [HotDealType.UltraDeal]: '초대박딜',
};
