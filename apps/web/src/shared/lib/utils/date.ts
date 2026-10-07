import dayjs, { DayjsTimezone, extend, locale } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import 'dayjs/locale/ko';

export type TimeZone = 'Asia/Seoul' | 'America/New_York';

locale('ko');
extend(relativeTime);
extend(timezone);
extend(utc);

// startOf('day') 고정 — 이 값은 react-query queryKey에 들어간다.
// startOf('minute')이면 분이 넘어갈 때마다 새 키가 되어, 오래 열어둔 탭에서
// useSuspenseQuery가 캐시 미스로 재suspend → 랭킹 영역이 사라진다.
// 일 단위면 하루 동안 키가 고정되고, "최근 N일" 필터에 분 정밀도는 무의미하다.
// 자정은 한국 시간으로 고정한다. 런타임 타임존을 따르면 서버(UTC)와 브라우저(KST)의 키가 달라져
// 서버가 채운 랭킹을 클라가 버리고 다시 suspend → 스켈레톤·빈 화면이 번갈아 보인다.
export const getDayBefore = (type: number) => {
  return dayjs().tz('Asia/Seoul').add(-type, 'day').startOf('day').toDate();
};

export const getFromNow = (date: string) => {
  const dayjsDate = dayjs(date);
  if (!dayjsDate.isValid()) return null;

  if (dayjsDate.isSame(dayjs(), 'day')) {
    return dayjsDate.format('A h시');
  }

  return dayjsDate.fromNow();
};

export const formatDateToMMD = (date: Date) => {
  return dayjs(date).format('MM.DD');
};

export const period = (timeZone: TimeZone = 'Asia/Seoul') => ({
  startAt: (startDate: string) => {
    return {
      endAt: (endDate: string) => {
        try {
          const now = dayjs.tz(new Date(), timeZone);

          if (startDate) {
            const start = dayjs.tz(startDate, timeZone);
            if (now.isBefore(start)) {
              return false;
            }
          }

          if (endDate) {
            let end = dayjs.tz(endDate, timeZone);
            const hasTimeComponent = /(\d{2}:\d{2})/.test(endDate);

            if (!hasTimeComponent) {
              // 기존 코드 호환성 사유로 추가 (이전 시간 동작 호환)
              end = end.endOf('day');
            }

            if (now.isAfter(end)) {
              return false;
            }
          }

          return true;
        } catch (error) {
          // 에러 시 안전하게 false 반환
          return false;
        }
      },
    };
  },
});
