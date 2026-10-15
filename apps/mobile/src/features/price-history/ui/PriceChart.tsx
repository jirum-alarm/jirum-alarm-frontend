import React, {useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import {chartColor} from '@jirum/design-system';

import {
  buildChartGeometry,
  type ChartPoint,
  shortWon,
  won,
} from '../model/chart-geometry';
import type {CurrentProductMarker} from '../model/seed-marker';
import {useColors, type Colors} from '@/shared/theme/useColors';

// 레이아웃을 재기 전 기본값. 실제로는 그려지는 폭을 viewBox 로 쓴다(1단위 = 1pt) — 640 고정이던 때는
// 폰(약 350pt)에서 통째로 0.55배가 돼 축 글자가 6.6pt, 「이 상품」 라벨이 5.5pt 였다(2026-10-15 실측, web 과 같은 수정).
const WIDTH = 640;
const HEIGHT = 260;
/** 폭이 좁은 화면(폰)의 차트 높이. 넓으면 HEIGHT. */
const NARROW_HEIGHT = 200;
// left: Y축 라벨(textAnchor=end, x=left-8)이 들어갈 폭. 44 면 "2,260k"(12px ≈ 39)의
// 첫 글자가 0 밖으로 나가 잘렸다 — "12,260k" 까지 들어가게 56.
const PAD = {top: 40, right: 20, bottom: 28, left: 56};

export default function PriceChart({
  points,
  currency,
  axisStartMs,
  axisEndMs,
  contentStartMs,
  contentEndMs,
  selectedIndex,
  onSelectIndex,
  onInteract,
  currentMarker,
}: {
  points: ChartPoint[];
  currency?: string | null;
  axisStartMs: number;
  axisEndMs: number;
  contentStartMs: number;
  contentEndMs: number;
  selectedIndex: number | null;
  onSelectIndex: (index: number) => void;
  /** 탭·가로 스크럽이 끝났을 때(세로 스크롤로 빠진 터치는 제외). */
  onInteract?: () => void;
  currentMarker?: CurrentProductMarker | null;
}) {
  const colors = useColors();
  // 차트 색은 디자인 시스템 차트 역할 — web·AI 그래프와 같은 파랑(예전 앱만 라임이었다).
  const line = chartColor('line', colors);
  // viewBox 는 640 고정이고 실제 폭은 화면마다 다르다. 제스처 x 를 뷰박스
  // 좌표로 되돌리려면 실측 폭이 필요하다(web 의 getBoundingClientRect 대응).
  const [layoutWidth, setLayoutWidth] = useState(0);
  const width = layoutWidth || WIDTH;
  const height = width < 480 ? NARROW_HEIGHT : HEIGHT;

  const geo = useMemo(
    () =>
      buildChartGeometry(
        points,
        width,
        height,
        PAD,
        axisStartMs,
        axisEndMs,
        contentStartMs,
        contentEndMs,
        currentMarker ? [currentMarker.price] : [],
      ),
    [
      points,
      width,
      height,
      axisStartMs,
      axisEndMs,
      contentStartMs,
      contentEndMs,
      currentMarker,
    ],
  );

  const seedCoord = useMemo(() => {
    if (!currentMarker) return null;
    const {x, y} = geo.project(currentMarker.date, currentMarker.price);
    return {...currentMarker, x, y};
  }, [currentMarker, geo]);

  const nearestIndex = (gestureX: number) => {
    if (!layoutWidth || geo.coords.length === 0) return 0;
    const x = (gestureX / layoutWidth) * width;
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < geo.coords.length; i++) {
      const dist = Math.abs(geo.coords[i].x - x);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  };

  // web 은 hover(가이드)와 click(고정)이 따로지만 모바일엔 hover 가 없다.
  // 드래그 스크럽 하나로 합친다 — 누른 채 움직이면 선택이 따라온다.
  //
  // 🔴`.runOnJS(true)` 필수. reanimated 가 깔려 있으면 babel 플러그인이 이 콜백을
  // worklet 으로 바꿔 **UI 스레드**에서 돌린다 — 거기서 JS 함수(nearestIndex·
  // onSelectIndex)를 부르면 `[Worklets] Tried to synchronously call a non-worklet
  // function` 으로 **앱이 통째로 죽는다**(안드로이드 에뮬레이터 실측 2026-09-25:
  // 차트를 한 번 누르자 FATAL EXCEPTION). 선택은 React state 라 JS 스레드가 맞다.
  // 스크럽 중 onUpdate 는 손가락이 움직일 때마다(초당 60번) 온다 — 가까운 점이 바뀔 때만 올린다.
  // 그대로 올리면 같은 값이어도 부모(PriceHistorySection)가 매번 렌더를 예약했다.
  const lastSent = useRef<number | null>(null);
  const select = (index: number, force = false) => {
    if (!force && index === lastSent.current) return;
    lastSent.current = index;
    onSelectIndex(index);
  };

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .runOnJS(true)
        // 가로로 움직일 때만 차트가 잡는다 — 세로면 즉시 포기해 스크롤에 넘긴다.
        // (minDistance(0) 이라 차트 위에서 시작한 세로 스크롤까지 가로챘다.)
        // 탭 선택은 onBegin 이 손가락이 닿는 순간 처리하므로 그대로다.
        .activeOffsetX([-6, 6])
        .failOffsetY([-12, 12])
        .onBegin(e => select(nearestIndex(e.x), true))
        .onUpdate(e => select(nearestIndex(e.x)))
        // onBegin 은 세로 스크롤을 시작한 터치에도 불린다. failOffsetY(12) 를 넘긴 터치만 빼면 탭·스크럽이 남는다.
        .onFinalize(e => {
          if (Math.abs(e.translationY) < 12) onInteract?.();
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layoutWidth, geo.coords],
  );

  const selected =
    selectedIndex != null ? geo.coords[selectedIndex] : undefined;
  // 이 상품 점은 전용 마커로만 그린다 — 골라도 큰 점을 겹쳐 그리지 않는다(예전과 같음).
  // 「이 상품」 라벨은 위 여백에 고정이라, 그 근처 점(대개 오늘)을 고르면 위쪽 가격이 라벨과 겹친다(2026-10-15) —
  // 그땐 가격을 점 왼쪽에 붙인다. 이 상품 점 자체를 고르면 그 라벨이 이미 가격을 보여 준다.
  const nearSeed =
    !!selected && !!seedCoord && Math.abs(selected.x - seedCoord.x) < 48;
  const selectedIsSeed =
    !!selected &&
    !!currentMarker &&
    selected.date === currentMarker.date &&
    selected.price === currentMarker.price;

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={e => setLayoutWidth(e.nativeEvent.layout.width)}
        accessibilityLabel="가격 추이 그래프">
        {/* viewBox 를 실제 폭·높이와 같게 둔다 — 비율이 어긋나면 선·라벨이 눌려 작아진다(그래프가 안 보이던 원인). */}
        <Svg
          width="100%"
          height={layoutWidth ? height : 0}
          viewBox={`0 0 ${width} ${height}`}>
          <ChartBase
            geo={geo}
            currency={currency}
            colors={colors}
            currentMarker={currentMarker}
            seedCoord={seedCoord}
          />

          {/* 고른 점만 따로 그린다 — 스크럽마다 바뀌는 건 이 몇 개뿐이다. */}
          {selected ? (
            <G>
              <Line
                x1={selected.x}
                y1={PAD.top}
                x2={selected.x}
                y2={PAD.top + geo.plotH}
                stroke={line}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              {selectedIsSeed ? null : (
                <Circle
                  cx={selected.x}
                  cy={selected.y}
                  r={5}
                  fill={line}
                  stroke={line}
                  strokeWidth={2}
                />
              )}
              {selectedIsSeed ? null : (
                <SvgText
                  x={nearSeed ? selected.x - 10 : selected.x}
                  y={nearSeed ? selected.y + 4 : PAD.top - 12}
                  fontSize={12}
                  fontWeight="600"
                  fill={colors.gray[900]}
                  textAnchor={nearSeed ? 'end' : 'middle'}>
                  {/* web 점 라벨과 같은 전체 금액 — k 반올림이면 10,600원이 「11k」로 보였다(2026-10-12). */}
                  {won(selected.price, currency)}
                </SvgText>
              )}
            </G>
          ) : null}
        </Svg>
      </View>
    </GestureDetector>
  );
}

type Geometry = ReturnType<typeof buildChartGeometry>;

/**
 * 고른 점과 무관한 층(눈금·면·선·점·이 상품 마커·x 라벨). memo 라 스크럽 중엔 다시 그리지 않는다.
 *
 * ★예전엔 손가락이 점을 옮길 때마다 이 전부(1년이면 점 수백 개 + 눈금·라벨)를 SVG 로 다시 만들었다 —
 * 고른 점 표시가 r·fill 로 점 목록 안에 섞여 있어서. 고른 점은 위 오버레이가 덮어 그린다.
 */
const ChartBase = React.memo(function ChartBase({
  geo,
  currency,
  colors,
  currentMarker,
  seedCoord,
}: {
  geo: Geometry;
  currency?: string | null;
  colors: Colors;
  currentMarker?: CurrentProductMarker | null;
  seedCoord: (CurrentProductMarker & {x: number; y: number}) | null;
}) {
  const line = chartColor('line', colors);
  const seed = chartColor('current', colors);
  const areaPath = geo.d
    ? `${geo.d} L ${geo.coords.at(-1)?.x ?? 0} ${PAD.top + geo.plotH} L ${
        geo.coords[0]?.x ?? 0
      } ${PAD.top + geo.plotH} Z`
    : '';

  return (
    <G>
      <Defs>
        <LinearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={line} stopOpacity="0.16" />
          <Stop offset="1" stopColor={line} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {geo.ticks.map((t, i) => (
        <G key={`tick-${i}`}>
          <Line
            x1={PAD.left}
            y1={t.y}
            x2={geo.width - PAD.right}
            y2={t.y}
            stroke={colors.gray[200]}
            strokeWidth={1}
          />
          <SvgText
            x={PAD.left - 8}
            y={t.y + 4}
            fontSize={11}
            fill={colors.gray[500]}
            textAnchor="end">
            {shortWon(t.price, currency, geo.tickStep, geo.yMax)}
          </SvgText>
        </G>
      ))}

      {areaPath ? <Path d={areaPath} fill="url(#priceFill)" /> : null}
      {geo.d ? (
        <Path
          d={geo.d}
          stroke={line}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : null}

      {geo.coords.map((c, i) => {
        // seed 날짜·가는 아래 전용 마커로만 그린다(이중 점 방지).
        if (
          currentMarker &&
          c.date === currentMarker.date &&
          c.price === currentMarker.price
        ) {
          return null;
        }
        return (
          <Circle
            key={`p-${i}`}
            cx={c.x}
            cy={c.y}
            r={3}
            fill={colors.white}
            stroke={line}
            strokeWidth={2}
          />
        );
      })}

      {/* 「이 상품」 라벨은 위 여백(PAD.top 위)에 고정하고 점선으로 점과 잇는다 — 점 바로 위에 두면 이 상품이 최저가라
          바닥에 있을 때 내려오는 선·점과 겹쳤다(2026-10-15). web 은 같은 자리 + 기본 가이드 점선. */}
      {seedCoord ? (
        <G>
          <Line
            x1={seedCoord.x}
            y1={PAD.top}
            x2={seedCoord.x}
            y2={seedCoord.y - 8}
            stroke={seed}
            strokeOpacity={0.5}
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <SvgText
            x={seedCoord.x}
            y={PAD.top - 20}
            fontSize={11}
            fontWeight="700"
            fill={seed}
            textAnchor="middle">
            이 상품
          </SvgText>
          <SvgText
            x={seedCoord.x}
            y={PAD.top - 6}
            fontSize={11}
            fontWeight="600"
            fill={seed}
            textAnchor="middle">
            {won(seedCoord.price, currency)}
          </SvgText>
          <Circle cx={seedCoord.x} cy={seedCoord.y} r={6.5} fill={seed} />
        </G>
      ) : null}

      {geo.xLabels.map((l, i) => (
        <SvgText
          key={`x-${i}`}
          x={l.x}
          y={geo.height - 8}
          fontSize={11}
          fill={colors.gray[500]}
          textAnchor="middle">
          {l.label}
        </SvgText>
      ))}
    </G>
  );
});
