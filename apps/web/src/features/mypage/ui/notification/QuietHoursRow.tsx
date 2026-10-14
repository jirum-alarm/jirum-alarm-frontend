'use client';

import {
  DEFAULT_QUIET_HOURS,
  describeQuietHours,
  formatHour,
  HOURS,
  type QuietHours,
  toQuietHours,
} from '@jirum/domain/quiet-hours';
import { useId } from 'react';

import Switch from '@/shared/ui/common/Switch';

type Props = {
  start: number | null;
  end: number | null;
  nightAlerts: boolean;
  disabled: boolean;
  onChange: (next: { quietHoursStart: number | null; quietHoursEnd: number | null }) => void;
};

/**
 * 방해금지 시간. 그 사이 온 키워드·핫딜·커뮤니티 알림은 끝나는 시각에 모아서 보낸다(공지 제외, 알림함엔 그대로 쌓임).
 * 시 선택은 네이티브 `<select>` — 공용 Select 는 비제어(defaultValue)라 서버 값과 어긋나고, 폰 웹에선 OS 휠이 더 편하다.
 */
const QuietHoursRow = ({ start, end, nightAlerts, disabled, onChange }: Props) => {
  const id = useId();
  const quiet = toQuietHours(start, end);

  const save = (next: QuietHours | null) =>
    onChange({ quietHoursStart: next?.start ?? null, quietHoursEnd: next?.end ?? null });

  return (
    <li className="border-b border-gray-200 py-4">
      <div className="flex items-center gap-4">
        <label htmlFor={id} className="flex min-w-0 flex-1 cursor-pointer flex-col gap-0.5">
          <span className="font-medium text-gray-900">방해금지 시간</span>
          <span className="text-sm text-gray-500">
            정한 시간엔 알림을 울리지 않고, 끝나는 시각에 모아서 보내드려요. 알림함에는 바로 쌓여요
          </span>
        </label>
        <Switch
          id={id}
          aria-label="방해금지 시간"
          checked={quiet !== null}
          disabled={disabled}
          onCheckedChange={(next) => save(next ? DEFAULT_QUIET_HOURS : null)}
        />
      </div>
      {quiet ? (
        <div className="mt-3 flex flex-col gap-2 rounded-lg bg-gray-50 p-3">
          <div className="flex items-center gap-2">
            <HourSelect
              label="시작"
              value={quiet.start}
              exclude={quiet.end}
              disabled={disabled}
              onChange={(hour) => save({ ...quiet, start: hour })}
            />
            <span className="text-gray-500">~</span>
            <HourSelect
              label="끝"
              value={quiet.end}
              exclude={quiet.start}
              disabled={disabled}
              onChange={(hour) => save({ ...quiet, end: hour })}
            />
          </div>
          <p className="text-sm text-gray-600">{describeQuietHours(quiet, nightAlerts)}</p>
        </div>
      ) : null}
    </li>
  );
};

const HourSelect = ({
  label,
  value,
  exclude,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  /** 시작과 끝이 같으면 서버가 거부한다 — 상대편 시각은 고를 수 없게. */
  exclude: number;
  disabled: boolean;
  onChange: (hour: number) => void;
}) => (
  <select
    aria-label={`방해금지 ${label} 시각`}
    value={value}
    disabled={disabled}
    onChange={(event) => onChange(Number(event.target.value))}
    className="h-10 flex-1 rounded-md border border-gray-300 bg-white px-3 text-gray-900"
  >
    {HOURS.map((hour) => (
      <option key={hour} value={hour} disabled={hour === exclude}>
        {formatHour(hour)}
      </option>
    ))}
  </select>
);

export default QuietHoursRow;
