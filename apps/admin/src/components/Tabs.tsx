'use client';

interface Props<T extends string> {
  tabs: readonly { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

/** 화면 안 큰 구획 전환(밑줄 탭). 넘치면 가로로 밀린다 */
const Tabs = <T extends string>({ tabs, value, onChange }: Props<T>) => (
  <div className="no-scrollbar flex overflow-x-auto whitespace-nowrap border-b border-stroke dark:border-strokedark">
    {tabs.map((t) => (
      <button
        key={t.value}
        type="button"
        onClick={() => onChange(t.value)}
        className={`shrink-0 px-4 py-3 text-sm font-medium transition-colors ${
          value === t.value
            ? 'border-b-2 border-primary text-primary'
            : 'text-bodydark2 hover:text-black dark:hover:text-white'
        }`}
      >
        {t.label}
      </button>
    ))}
  </div>
);

export default Tabs;
