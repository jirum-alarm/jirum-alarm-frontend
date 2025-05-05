import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.locale('ko');
dayjs.extend(relativeTime);

export const getDayBefore = (type: number) => {
  return dayjs().add(-type, 'day').startOf('minute').toDate();
};

export const getFromNow = (date: string) => {
  const dayjsDate = dayjs(date);
  if (!dayjsDate.isValid()) return null;

  if (dayjsDate.isSame(dayjs(), 'day')) {
    return dayjsDate.format('A h시');
  }

  return dayjsDate.fromNow();
};
