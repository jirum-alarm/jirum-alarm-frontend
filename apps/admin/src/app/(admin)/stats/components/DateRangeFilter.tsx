'use client';

import { useState } from 'react';

import Panel from '@/components/Panel';
import SegmentedControl from '@/components/SegmentedControl';
import { DateInterval } from '@/types/stats';
import { kstDaysAgo, toKstDateString } from '@/utils/date';

type Preset = '7' | '30' | '90' | 'custom';

export type StatsRange = {
  preset: Preset;
  startDate: string;
  endDate: string;
  interval: DateInterval;
};

const PRESETS = [
  { value: '7', label: '7일' },
  { value: '30', label: '30일' },
  { value: '90', label: '90일' },
  { value: 'custom', label: '직접' },
] as const;

const INTERVALS = [
  { value: DateInterval.DAILY, label: '일별' },
  { value: DateInterval.WEEKLY, label: '주별' },
  { value: DateInterval.MONTHLY, label: '월별' },
] as const;

const presetRange = (preset: Preset, interval: DateInterval, prev?: StatsRange): StatsRange =>
  preset === 'custom' && prev
    ? { ...prev, preset }
    : { preset, interval, startDate: kstDaysAgo(Number(preset) - 1), endDate: toKstDateString() };

/** 통계 기간 상태 — 바뀌면 화면이 useEffect 로 바로 다시 불러온다(조회 버튼 없음) */
export const useStatsRange = (days: 7 | 30 | 90 = 30) =>
  useState<StatsRange>(() => presetRange(String(days) as Preset, DateInterval.DAILY));

const inputClass =
  'w-full rounded-sm border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white';

const DateRangeFilter = ({
  value,
  onChange,
}: {
  value: StatsRange;
  onChange: (value: StatsRange) => void;
}) => (
  <Panel className="p-3">
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      <SegmentedControl
        options={PRESETS}
        value={value.preset}
        onChange={(preset) => onChange(presetRange(preset, value.interval, value))}
      />
      <SegmentedControl
        options={INTERVALS}
        value={value.interval}
        onChange={(interval) => onChange({ ...value, interval })}
      />
    </div>
    {value.preset === 'custom' && (
      <div className="mt-2 grid grid-cols-2 gap-2 sm:flex">
        <input
          type="date"
          aria-label="시작일"
          value={value.startDate}
          max={value.endDate}
          onChange={(e) => e.target.value && onChange({ ...value, startDate: e.target.value })}
          className={inputClass}
        />
        <input
          type="date"
          aria-label="종료일"
          value={value.endDate}
          min={value.startDate}
          onChange={(e) => e.target.value && onChange({ ...value, endDate: e.target.value })}
          className={inputClass}
        />
      </div>
    )}
  </Panel>
);

export default DateRangeFilter;
