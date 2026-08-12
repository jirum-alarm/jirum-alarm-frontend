import React from 'react';
import {Text, View} from 'react-native';
import {useQuery} from '@tanstack/react-query';

import {ProductQueries} from '@/entities/product/product.queries';

/** 마크다운 링크·URL 을 걷어낸 평문. web ProductGuideMetaRows 와 동일 규칙. */
function plainGuideContent(content: string): string {
  return content
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g, '$1')
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** productGuides 를 쇼핑몰·배송비와 같은 메타 행으로 렌더. */
export default function ProductGuideMetaRows({productId}: {productId: number}) {
  const {data: guides} = useQuery(ProductQueries.guides({productId}));

  const rows = (guides ?? [])
    .filter(g => g.title && g.content)
    .map(g => ({
      id: String(g.id),
      title: g.title as string,
      content: plainGuideContent(g.content as string),
    }))
    .filter(r => r.content.length > 0);

  if (!rows.length) return null;

  return (
    <>
      {rows.map(row => (
        <View key={row.id} className="flex-row justify-between gap-x-4">
          <Text className="text-sm font-medium text-gray-500">{row.title}</Text>
          <Text
            className="shrink text-right text-sm font-medium text-gray-600"
            numberOfLines={2}>
            {row.content}
          </Text>
        </View>
      ))}
    </>
  );
}
