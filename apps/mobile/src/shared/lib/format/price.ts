// 가격 표기 규칙은 web 과 같아야 해서 @jirum/domain/price 가 정본이다 — 고칠 땐 거기서.
export {parsePrice, splitPriceNote} from '@jirum/domain/price';

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

/**
 * web 의 displayTime 과 같은 구간 규칙.
 *
 * ponytail: web 은 dayjs 를 쓰지만 mobile 에는 dayjs 가 dependency 로 없다
 * (node_modules 에 hoisting 으로 올라와 있을 뿐이라 의존하면 부서진다).
 * 초 단위 뺄셈이면 충분해서 직접 계산한다.
 * 컴포넌트에선 `now` 에 `useNowMinute()` 를 넘긴다 — 안 넘기면 React Compiler 가 결과를 캐시해 문구가 멈춘다.
 */
export function displayTime(
  createdAt: string | Date | null | undefined,
  now: number = Date.now(),
) {
  if (!createdAt) return '';

  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return '';

  const seconds = Math.floor((now - created.getTime()) / 1000);
  if (seconds < 0) return '방금 전';
  if (seconds < MINUTE) return '방금 전';

  const minutes = Math.floor(seconds / MINUTE);
  if (minutes < 10) return '방금 전';
  if (minutes < 60) return `${Math.floor(minutes / 10) * 10}분 전`;

  const hours = Math.floor(seconds / HOUR);
  if (hours < 24) return `${hours}시간 전`;

  const days = Math.floor(seconds / DAY);
  if (days < 7) return `${days}일 전`;

  const weeks = Math.floor(seconds / WEEK);
  if (weeks < 5) return `${weeks}주 전`;

  // 달·해는 길이가 일정하지 않아 초 나눗셈으로는 어긋난다. 달력 기준으로 센다.
  const today = new Date(now);
  const months =
    (today.getFullYear() - created.getFullYear()) * 12 +
    (today.getMonth() - created.getMonth());
  if (months < 12) return `${Math.max(1, months)}달 전`;

  return `${Math.floor(months / 12)}년 전`;
}
