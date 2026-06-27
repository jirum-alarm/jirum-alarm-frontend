'use client';

import { ResponsiveAdvertiseGraphic } from '@/hooks/graphql/advertisement';

/**
 * graphic 라이브 프리뷰. _default 브레이크포인트 기준으로 background 위에 element 를
 * constraints(top/left/bottom/right) 로 절대배치해 렌더. 프론트 실제 렌더러의 축소판.
 */
const GraphicPreview = ({ graphic }: { graphic: ResponsiveAdvertiseGraphic | null }) => {
  if (!graphic?.size?._default || !graphic.background?.assetUrl) {
    return (
      <div className="flex h-60 items-center justify-center rounded-lg border border-dashed border-stroke text-sm text-bodydark2">
        유효한 graphic JSON 을 입력하면 미리보기가 표시됩니다
      </div>
    );
  }

  const { width, height } = graphic.size._default;
  const aspect = height / width;

  return (
    <div>
      <div className="mb-2 text-xs text-bodydark2">
        미리보기 (_default {width}×{height})
      </div>
      <div
        className="relative w-full overflow-hidden rounded-lg border border-stroke bg-gray-2 dark:border-strokedark"
        style={{ paddingBottom: `${aspect * 100}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={graphic.background.assetUrl}
          alt="background"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {(graphic.foregroundElements ?? []).map((el, i) => {
          const layout = el.layoutByWidth?._default;
          if (!layout) return null;
          const c = layout.constraints ?? {};
          // constraints/size 를 컨테이너 대비 % 로 환산 (designSize 기준이 _default.size 라 가정)
          const pct = (v: number | undefined, base: number) =>
            v === undefined ? undefined : `${(v / base) * 100}%`;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={i}
              src={el.assetUrl}
              alt={`element-${i}`}
              className="absolute"
              style={{
                top: pct(c.top, height),
                left: pct(c.left, width),
                bottom: pct(c.bottom, height),
                right: pct(c.right, width),
                width: pct(layout.size?.width, width),
                height: pct(layout.size?.height, height),
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GraphicPreview;
