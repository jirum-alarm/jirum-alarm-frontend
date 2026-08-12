import React, {useMemo, useState} from 'react';
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

import {
  buildChartGeometry,
  type ChartPoint,
  shortWon,
} from '../model/chart-geometry';

const WIDTH = 640;
const HEIGHT = 260;
const PAD = {top: 40, right: 20, bottom: 28, left: 44};

const LINE = '#7FC125';
const GRID = '#EAECF0';
const AXIS_TEXT = '#667085';

export default function PriceChart({
  points,
  currency,
  axisStartMs,
  axisEndMs,
  contentStartMs,
  contentEndMs,
  selectedIndex,
  onSelectIndex,
}: {
  points: ChartPoint[];
  currency?: string | null;
  axisStartMs: number;
  axisEndMs: number;
  contentStartMs: number;
  contentEndMs: number;
  selectedIndex: number | null;
  onSelectIndex: (index: number) => void;
}) {
  // viewBox 는 640 고정이고 실제 폭은 화면마다 다르다. 제스처 x 를 뷰박스
  // 좌표로 되돌리려면 실측 폭이 필요하다(web 의 getBoundingClientRect 대응).
  const [layoutWidth, setLayoutWidth] = useState(0);

  const geo = useMemo(
    () =>
      buildChartGeometry(
        points,
        WIDTH,
        HEIGHT,
        PAD,
        axisStartMs,
        axisEndMs,
        contentStartMs,
        contentEndMs,
      ),
    [points, axisStartMs, axisEndMs, contentStartMs, contentEndMs],
  );

  const nearestIndex = (gestureX: number) => {
    if (!layoutWidth || geo.coords.length === 0) return 0;
    const x = (gestureX / layoutWidth) * WIDTH;
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
  const pan = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(0)
        .onBegin(e => onSelectIndex(nearestIndex(e.x)))
        .onUpdate(e => onSelectIndex(nearestIndex(e.x))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [layoutWidth, geo.coords],
  );

  const selected =
    selectedIndex != null ? geo.coords[selectedIndex] : undefined;

  const areaPath = geo.d
    ? `${geo.d} L ${geo.coords.at(-1)?.x ?? 0} ${PAD.top + geo.plotH} L ${
        geo.coords[0]?.x ?? 0
      } ${PAD.top + geo.plotH} Z`
    : '';

  return (
    <GestureDetector gesture={pan}>
      <View
        onLayout={e => setLayoutWidth(e.nativeEvent.layout.width)}
        accessibilityLabel="가격 추이 그래프">
        <Svg width="100%" height={200} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
          <Defs>
            <LinearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={LINE} stopOpacity="0.16" />
              <Stop offset="1" stopColor={LINE} stopOpacity="0" />
            </LinearGradient>
          </Defs>

          {geo.ticks.map((t, i) => (
            <G key={`tick-${i}`}>
              <Line
                x1={PAD.left}
                y1={t.y}
                x2={WIDTH - PAD.right}
                y2={t.y}
                stroke={GRID}
                strokeWidth={1}
              />
              <SvgText
                x={PAD.left - 8}
                y={t.y + 4}
                fontSize={12}
                fill={AXIS_TEXT}
                textAnchor="end">
                {shortWon(t.price, currency, geo.tickStep, geo.yMax)}
              </SvgText>
            </G>
          ))}

          {areaPath ? <Path d={areaPath} fill="url(#priceFill)" /> : null}
          {geo.d ? (
            <Path
              d={geo.d}
              stroke={LINE}
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ) : null}

          {geo.coords.map((c, i) => (
            <Circle
              key={`p-${i}`}
              cx={c.x}
              cy={c.y}
              r={i === selectedIndex ? 5 : 3}
              fill={i === selectedIndex ? LINE : '#ffffff'}
              stroke={LINE}
              strokeWidth={2}
            />
          ))}

          {selected ? (
            <G>
              <Line
                x1={selected.x}
                y1={PAD.top}
                x2={selected.x}
                y2={PAD.top + geo.plotH}
                stroke={LINE}
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <SvgText
                x={selected.x}
                y={PAD.top - 12}
                fontSize={13}
                fontWeight="600"
                fill="#101828"
                textAnchor="middle">
                {shortWon(selected.price, currency, undefined, geo.yMax)}
              </SvgText>
            </G>
          ) : null}

          {geo.xLabels.map((l, i) => (
            <SvgText
              key={`x-${i}`}
              x={l.x}
              y={HEIGHT - 8}
              fontSize={12}
              fill={AXIS_TEXT}
              textAnchor="middle">
              {l.label}
            </SvgText>
          ))}
        </Svg>
      </View>
    </GestureDetector>
  );
}
