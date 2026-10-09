/** web formatDateToMMD 와 같은 표기(MM.DD). dayjs 없이 처리한다. 비었거나 잘못된 날짜는 빈 문자열. */
export function formatMMD(date?: string | null): string {
  if (!date) return '';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}.${dd}`;
}
