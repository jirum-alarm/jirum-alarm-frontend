import React from 'react';
import {View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {useQuery} from '@tanstack/react-query';

import {ProductQueries} from '@/entities/product/product.queries';
import {isPriceGuideTitle} from '@/entities/home/lib/toss';
import {detailInfo} from '@jirum/design-system/recipes';
import {cn} from '@/shared/lib/styling';

/** 마크다운 링크·URL 을 걷어낸 평문. web ProductGuideMetaRows 와 동일 규칙. */
function plainGuideContent(content: string): string {
  return content
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g, '$1')
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** productGuides 를 쇼핑몰·배송비와 같은 메타 행으로 렌더. */
export default function ProductGuideMetaRows({
  productId,
  hidePrice,
}: {
  productId: number;
  hidePrice?: boolean;
}) {
  const {data: guides} = useQuery(ProductQueries.guides({productId}));

  const rows = (guides ?? [])
    .filter(g => g.title && g.content)
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
      {rows.map(row => (
        <DetailInfoRow key={row.id} label={row.title}>
          <Text className={detailInfo.value} numberOfLines={4}>
            {row.content}
          </Text>
        </DetailInfoRow>
      ))}
    </>
  );
}

/** 상세 정보 표 한 줄 — 라벨 고정폭 왼쪽, 값은 옆에서 줄바꿈(web DetailInfoRow 와 같은 detailInfo). */
export function DetailInfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className={cn('flex-row', detailInfo.row)}>
      <Text className={detailInfo.label}>{label}</Text>
      <View className="min-w-0 flex-1 flex-row items-center gap-x-1">
        {children}
      </View>
    </View>
  );
}
