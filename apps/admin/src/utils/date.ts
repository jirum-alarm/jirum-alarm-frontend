import dayjs from 'dayjs';

export const dateFormatter = (date: string | number) => {
  return dayjs(date).format('YYYY/MM/DD');
};

export const formatStatsDate = (date: string | number) => {
  const num = Number(date);
  if (!isNaN(num)) {
    // 10자리 이하면 초 단위 타임스탬프, 13자리면 밀리초 단위
    return num > 9_999_999_999 ? dayjs(num).format('YY/MM/DD') : dayjs.unix(num).format('YY/MM/DD');
  }
  return dayjs(date).format('YY/MM/DD');
};
