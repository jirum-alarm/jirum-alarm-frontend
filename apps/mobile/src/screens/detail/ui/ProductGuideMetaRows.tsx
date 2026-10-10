import React from 'react';
import {View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {useQuery} from '@tanstack/react-query';

import {ProductQueries} from '@/entities/product/product.queries';
import {isPriceGuideTitle} from '@/entities/home/lib/toss';

/** 마크다운 링크·URL 을 걷어낸 평문. web ProductGuideMetaRows 와 동일 규칙. */
function plainGuideContent(content: string): string {
  return content
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g, '$1')
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** 이보다 긴 글은 라벨 위·글 아래로 쌓는다 — web 과 같은 기준. 오른쪽 정렬 두 줄에선 잘려 나갔다. */
const STACK_AFTER_CHARS = 40;

/** productGuides 를 쇼핑몰·배송비와 같은 메타 행으로 렌더. */
export default function ProductGuideMetaRows({
  productId,
  hiddenIds,
  hidePrice,
}: {
  productId: number;
  /** 서버(dealEvidence)가 뺀 행 — 가격 조건 줄로 옮겼거나 제목·쇼핑몰·가격을 반복하는 행 */
  hiddenIds?: string[] | null;
  hidePrice?: boolean;
}) {
  const {data: guides} = useQuery(ProductQueries.guides({productId}));
  const hidden = new Set(hiddenIds ?? []);

  const rows = (guides ?? [])
    .filter(g => g.title && g.content && !hidden.has(String(g.id)))
    .filter(g => !hidePrice || !isPriceGuideTitle(g.title as string))
    .map(g => ({
      id: String(g.id),
      title: g.title as string,
      content: plainGuideContent(g.content as string),
    }))
    .filter(r => r.content.length > 0);

  if (!rows.length) return null;

  return (
    <>
      {rows.map(row =>
        row.content.length > STACK_AFTER_CHARS ? (
          <View key={row.id} className="gap-y-1">
            <Text className="text-sm font-medium text-gray-500">
              {row.title}
            </Text>
            <Text
              className="text-sm font-medium text-gray-500"
              numberOfLines={4}>
              {row.content}
            </Text>
          </View>
        ) : (
          <View key={row.id} className="flex-row justify-between gap-x-4">
            <Text className="text-sm font-medium text-gray-500">
              {row.title}
            </Text>
            <Text
              className="shrink text-right text-sm font-medium text-gray-500"
              numberOfLines={2}>
              {row.content}
            </Text>
          </View>
        ),
      )}
    </>
  );
}
