import dayjs from 'dayjs';

export const dateFormatter = (date: string | number) => {
  return dayjs(date).format('YYYY/MM/DD');
};
