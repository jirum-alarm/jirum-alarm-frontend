import React from 'react';
import {View} from 'react-native';

import BabyOnIcon from '@/shared/components/icons/categories/BabyOnIcon';
import BookOnIcon from '@/shared/components/icons/categories/BookOnIcon';
import CartOnIcon from '@/shared/components/icons/categories/CartOnIcon';
import ComputerOnIcon from '@/shared/components/icons/categories/ComputerOnIcon';
import CosmeticsOnIcon from '@/shared/components/icons/categories/CosmeticsOnIcon';
import ElectricOnIcon from '@/shared/components/icons/categories/ElectricOnIcon';
import EtcOnIcon from '@/shared/components/icons/categories/EtcOnIcon';
import FashionOnIcon from '@/shared/components/icons/categories/FashionOnIcon';
import GameOnIcon from '@/shared/components/icons/categories/GameOnIcon';
import GiftcardOnIcon from '@/shared/components/icons/categories/GiftcardOnIcon';
import LeisureOnIcon from '@/shared/components/icons/categories/LeisureOnIcon';

type IconComponent = React.ComponentType<{width?: number; height?: number}>;

/**
 * categoryId → 일러스트. web shared/config/categories.ts 의 value 와 같은 번호다.
 * 번호가 어긋나면 엉뚱한 그림이 뜨므로 web 을 고칠 때 같이 고쳐야 한다.
 */
const CATEGORY_ICON: Record<number, IconComponent> = {
  1: ComputerOnIcon, // 컴퓨터
  2: CartOnIcon, // 생활/식품
  3: CosmeticsOnIcon, // 화장품
  4: FashionOnIcon, // 의류/잡화
  5: BookOnIcon, // 도서
  6: ElectricOnIcon, // 가전/가구
  7: LeisureOnIcon, // 등산/레저
  8: GiftcardOnIcon, // 상품권
  9: GameOnIcon, // 디지털
  10: BabyOnIcon, // 육아
  11: EtcOnIcon, // 기타
};

const ICON_SIZE = {product: 64, hotDeal: 52} as const;

/**
 * 썸네일이 없을 때의 대체 그림.
 *
 * 회색 판에 "이미지 없음" 텍스트를 쓰면 목록에서 고장난 것처럼 보인다
 * (디자인 리뷰 2026-08-12). web 과 같은 카테고리 일러스트를 쓴다.
 */
export default function NoImage({
  categoryId,
  type = 'hotDeal',
}: {
  categoryId?: number | null;
  type?: keyof typeof ICON_SIZE;
}) {
  const Icon = (categoryId && CATEGORY_ICON[categoryId]) || EtcOnIcon;
  const size = ICON_SIZE[type];

  return (
    <View className="h-full w-full items-center justify-center bg-gray-50">
      <Icon width={size} height={size} />
    </View>
  );
}
