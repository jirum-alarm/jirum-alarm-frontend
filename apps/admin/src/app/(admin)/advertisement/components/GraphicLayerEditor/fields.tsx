import { useState } from 'react';

import { BreakpointKey, DEFAULT_RENDER_WIDTH_BREAKPOINT, parseBreakpoint } from './breakpoints';

// 편집 패널의 숫자 입력 필드들 — 빈 값/0dp/wrap 을 구분해 undefined·null 로 돌려준다.
const inputClass =
  'w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-2 py-1.5 text-xs text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary';

function toPositiveNumber(value: string, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function toOptionalNumber(value: string) {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toOptionalPositiveNumber(value: string) {
  if (value.trim() === '') return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function InfoCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded bg-gray-2 px-2 py-1 dark:bg-form-input">
      <span className="text-bodydark2">{label}</span>
      <span className="ml-1 font-medium text-black dark:text-white">{value}</span>
    </div>
  );
}

export function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-bodydark2">{label}</span>
      <input
        type="number"
        min={1}
        className={inputClass}
        value={value}
        onChange={(event) => onChange(toPositiveNumber(event.target.value, value))}
      />
    </label>
  );
}

export function OptionalNumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-bodydark2">{label}</span>
      <input
        type="number"
        className={inputClass}
        value={value ?? ''}
        placeholder="-"
        onChange={(event) => onChange(toOptionalNumber(event.target.value))}
      />
    </label>
  );
}

export function OptionalPositiveNumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | null | undefined;
  onChange: (value: number | undefined) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] text-bodydark2">{label}</span>
      <input
        type="number"
        min={1}
        className={inputClass}
        value={typeof value === 'number' ? value : ''}
        placeholder={value === null ? '0dp' : 'wrap'}
        onChange={(event) => onChange(toOptionalPositiveNumber(event.target.value))}
      />
    </label>
  );
}

export function BreakpointWidthField({
  breakpoint,
  onCommit,
}: {
  breakpoint: BreakpointKey;
  onCommit: (width: number) => void;
}) {
  const currentValue = parseBreakpoint(breakpoint)?.value ?? DEFAULT_RENDER_WIDTH_BREAKPOINT;
  const [value, setValue] = useState(String(currentValue));

  const commit = () => {
    const nextValue = toPositiveNumber(value, currentValue);
    setValue(String(nextValue));
    onCommit(nextValue);
  };

  return (
    <label className="flex items-center gap-1 text-xs font-semibold text-black dark:text-white">
      <span>&gt;=</span>
      <input
        type="number"
        min={1}
        className="w-20 rounded border border-stroke bg-white px-2 py-1 text-xs text-black outline-none focus:border-primary dark:border-strokedark dark:bg-boxdark dark:text-white"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.currentTarget.blur();
          }
        }}
      />
    </label>
  );
}

export function AddBreakpointControl({ onAdd }: { onAdd: (width: number) => void }) {
  const [value, setValue] = useState(String(DEFAULT_RENDER_WIDTH_BREAKPOINT));

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="block">
        <span className="mb-1 block text-[11px] text-bodydark2">≥ width</span>
        <input
          type="number"
          min={1}
          className="w-24 rounded-lg border-[1.5px] border-stroke bg-transparent px-2 py-1.5 text-xs text-black outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      </label>
      <button
        type="button"
        className="mb-0.5 rounded bg-primary px-3 py-2 text-xs text-white md:py-1.5"
        onClick={() => onAdd(toPositiveNumber(value, DEFAULT_RENDER_WIDTH_BREAKPOINT))}
      >
        variant 추가
      </button>
    </div>
  );
}
