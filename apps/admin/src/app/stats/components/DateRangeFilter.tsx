import { DateInterval } from '@/types/stats';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  interval: DateInterval;
  onChangeStartDate: (value: string) => void;
  onChangeEndDate: (value: string) => void;
  onChangeInterval: (value: DateInterval) => void;
  onSearch: () => void;
}

const DateRangeFilter = ({
  startDate,
  endDate,
  interval,
  onChangeStartDate,
  onChangeEndDate,
  onChangeInterval,
  onSearch,
}: DateRangeFilterProps) => {
  return (
    <div className="mb-6 rounded-lg border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            시작일
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChangeStartDate(e.target.value)}
            className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            종료일
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onChangeEndDate(e.target.value)}
            className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">간격</label>
          <select
            value={interval}
            onChange={(e) => onChangeInterval(e.target.value as DateInterval)}
            className="rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white"
          >
            <option value={DateInterval.DAILY}>일별</option>
            <option value={DateInterval.WEEKLY}>주별</option>
            <option value={DateInterval.MONTHLY}>월별</option>
          </select>
        </div>
        <button
          onClick={onSearch}
          className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
        >
          조회
        </button>
      </div>
    </div>
  );
};

export default DateRangeFilter;
