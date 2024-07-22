import dayjs from 'dayjs';

export const getDayBefore = (type: number) => {
  return dayjs().add(-type, 'day').startOf('minute').toDate();
};
