/** 화면 숫자 표기 — 금액·짧은 금액·상대 시각·월/일 */

export const won = (v?: number | null) => (v == null ? '-' : `${Math.round(v).toLocaleString()}원`);

/** 1만 이상은 '12.3만' — 좁은 칸·차트 축용 */
export const compact = (v: number) =>
  Math.abs(v) >= 10000
    ? `${Number((v / 10000).toFixed(1)).toLocaleString()}만`
    : Math.round(v).toLocaleString();

export const shortWon = (v?: number | null) => (v == null ? '-' : `${compact(v)}원`);

export const formatAgo = (iso?: string | null) => {
  if (!iso) return '-';
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 60) return `${Math.max(0, minutes)}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

/** 'YYYY-MM-DD…' → '10/3' */
export const monthDay = (date: string) =>
  `${Number(date.slice(5, 7))}/${Number(date.slice(8, 10))}`;
