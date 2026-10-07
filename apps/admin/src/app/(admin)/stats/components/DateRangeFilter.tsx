import Panel from '@/components/Panel';
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
    <Panel className="mb-6 p-4">
      <div className="grid grid-cols-2 items-end gap-3 sm:flex sm:flex-wrap sm:gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">
            시작일
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onChangeStartDate(e.target.value)}
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white sm:w-auto"
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
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white sm:w-auto"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">간격</label>
          <select
            value={interval}
            onChange={(e) => onChangeInterval(e.target.value as DateInterval)}
            className="w-full rounded border border-stroke px-3 py-2 text-sm dark:border-strokedark dark:bg-boxdark dark:text-white sm:w-auto"
          >
            <option value={DateInterval.DAILY}>일별</option>
            <option value={DateInterval.WEEKLY}>주별</option>
            <option value={DateInterval.MONTHLY}>월별</option>
          </select>
        </div>
        <button
          onClick={onSearch}
          className="min-h-10 rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
        >
          조회
        </button>
      </div>
    </Panel>
  );
};

export default DateRangeFilter;
