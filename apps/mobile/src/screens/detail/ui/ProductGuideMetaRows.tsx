import React from 'react';
import {View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {useQuery} from '@tanstack/react-query';

import {ProductQueries} from '@/entities/product/product.queries';
import {isPriceGuideTitle} from '@/entities/home/lib/toss';
import {detailInfo} from '@jirum/design-system/recipes';
import {parseGuideContent} from '@jirum/domain/guide-content';
import {cn} from '@/shared/lib/styling';
import {openInAppBrowser} from '@/shared/lib/navigation';

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
      // 주소는 링크로(쿠폰·이벤트 페이지) — 예전엔 지워서 「쿠폰 받기」가 글자로만 남았다. 규칙은 web 과 같은 정본.
      segments: parseGuideContent(g.content as string),
    }))
    .filter(r => r.segments.length > 0);

  if (!rows.length) return null;

  return (
    <>
      {rows.map(row => (
        <DetailInfoRow key={row.id} label={row.title}>
          <Text className={detailInfo.value} numberOfLines={4}>
            {row.segments.map((seg, i) =>
              seg.type === 'link' ? (
                <Text
                  key={i}
                  accessibilityRole="link"
                  className="text-secondary-600 underline"
                  onPress={() => void openInAppBrowser(seg.href)}>
                  {seg.label}
                </Text>
              ) : (
                <React.Fragment key={i}>{seg.text}</React.Fragment>
              ),
            )}
          </Text>
        </DetailInfoRow>
      ))}
    </>
  );
}

/**
 * 상세 정보 표 한 줄 — 라벨 고정폭 왼쪽, 값은 옆에서 줄바꿈(web DetailInfoRow 와 같은 detailInfo).
 * 예전엔 짧은 값은 좌우 끝 정렬, 40자 넘는 값은 라벨 아래로 쌓아 한 표에 두 모양이 섞였다.
 * 값 칸(children)은 Text 하나 또는 아이콘+Text 줄 — 글자 모양은 detailInfo.value 를 쓴다.
 */
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
