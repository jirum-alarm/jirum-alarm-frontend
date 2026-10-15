import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

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
  {id: 'summary', title: '댓글 반응', Icon: AIIcon},
  {id: 'price', title: '핫딜 가격', Icon: Price},
  {id: 'satisfaction', title: '만족도', Icon: Shop},
  {id: 'option', title: '옵션 및 사이즈', Icon: Option},
  {id: 'purchaseMethod', title: '구매 팁', Icon: Tip},
  {id: 'additionalInfo', title: '기타', Icon: Etc},
];

/** 처음엔 이만큼만 보인다(web 과 같다) — 「댓글 반응」 한 줄 요약이 핵심이고 나머지는 펼쳐 본다. */
const COLLAPSED_ROWS = 2;

/** web Reactions 와 같은 댓글 AI 요약 — 커뮤니티 반응 카드 안, 위에 선 하나로 나눈다. */
export default function Reactions({
  commentSummary,
}: {
  commentSummary: ProductCommentSummary;
}) {
  const [expanded, setExpanded] = useState(false);
  const rows = SUMMARY_ITEMS.filter(item => commentSummary[item.id]);
  if (!rows.length) return null;
  const shown = expanded ? rows : rows.slice(0, COLLAPSED_ROWS);
  const hiddenCount = rows.length - shown.length;

  return (
    <View className="gap-y-3 border-t border-secondary-100 pt-3">
      {shown.map(item => {
        const Icon = item.Icon;
        return (
          <View key={item.id}>
            <View className="flex-row items-center gap-x-1 pb-1">
              <Icon />
              <Text className="text-sm font-medium text-gray-900">
                {item.title}
              </Text>
            </View>
            <Text className="text-sm leading-relaxed text-gray-600">
              {commentSummary[item.id]}
            </Text>
          </View>
        );
      })}
      {hiddenCount > 0 ? (
        <Pressable
          onPress={() => setExpanded(true)}
          hitSlop={8}
          accessibilityRole="button"
          className="self-start"
          style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
          <Text className="text-sm font-medium text-gray-600">
            요약 {hiddenCount}개 더 보기
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
