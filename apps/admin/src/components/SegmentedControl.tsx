'use client';

interface Props<T extends string> {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** 기간·보기 전환 토글. 폰에선 폭을 꽉 채워 누르기 쉽게, 넓은 화면에선 내용만큼 */
const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
  className = '',
}: Props<T>) => (
  <div
    className={`grid rounded-lg bg-gray-2 p-1 text-sm sm:inline-grid ${className}`}
    style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
  >
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`rounded-md px-3 py-1.5 font-medium whitespace-nowrap ${
          value === o.value ? 'bg-white text-black shadow-xs' : 'text-body'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

export default SegmentedControl;
