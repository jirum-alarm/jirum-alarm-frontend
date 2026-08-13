import React from 'react';
import {Text, View} from 'react-native';

import type {ProductCommentSummary} from '@/shared/api/gql/graphql';
import AIIcon from '@/shared/components/icons/AI';
import Etc from '@/shared/components/icons/Etc';
import Option from '@/shared/components/icons/Option';
import Price from '@/shared/components/icons/Price';
import Shop from '@/shared/components/icons/Shop';
import Tip from '@/shared/components/icons/Tip';

const SUMMARY_ITEMS: {
  id: keyof Pick<
    ProductCommentSummary,
    | 'summary'
    | 'price'
    | 'satisfaction'
    | 'option'
    | 'purchaseMethod'
    | 'additionalInfo'
  >;
  title: string;
  Icon: React.ComponentType;
}[] = [
  {id: 'summary', title: '핫딜 추천 이유', Icon: AIIcon},
  {id: 'price', title: '핫딜 가격', Icon: Price},
  {id: 'satisfaction', title: '만족도', Icon: Shop},
  {id: 'option', title: '옵션 및 사이즈', Icon: Option},
  {id: 'purchaseMethod', title: '구매 팁', Icon: Tip},
  {id: 'additionalInfo', title: '기타', Icon: Etc},
];

/** web Reactions 와 같은 댓글 요약 블록. */
export default function Reactions({
  commentSummary,
}: {
  commentSummary: ProductCommentSummary;
}) {
  const rows = SUMMARY_ITEMS.filter(item => commentSummary[item.id]);
  if (!rows.length) return null;

  return (
    <View className="rounded-lg bg-gray-50 p-4">
      {rows.map((item, i) => {
        const Icon = item.Icon;
        return (
          <View
            key={item.id}
            className={i < rows.length - 1 ? 'pb-4' : undefined}>
            <View className="flex-row items-center gap-x-1 pb-1">
              <Icon />
              <Text className="font-medium text-gray-900">{item.title}</Text>
            </View>
            <Text className="text-sm text-gray-600">
              {commentSummary[item.id]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
