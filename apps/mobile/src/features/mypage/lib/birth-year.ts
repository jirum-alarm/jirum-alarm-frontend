/**
 * 출생년도 후보. web `shared/config/birthYear.ts` 와 같은 100년 범위.
 * 맨 앞의 '선택안함'(null)까지 web `usePersonalInfoFormViewModel` 과 같다.
 */
export type BirthYearOption = {text: string; value: string | null};

const YEAR_RANGE = 100;

export function buildBirthYearOptions(
  now: Date = new Date(),
): BirthYearOption[] {
  const currentYear = now.getFullYear();
  return [
    {text: '선택안함', value: null},
    ...Array.from({length: YEAR_RANGE}, (_, i) => {
      const year = String(currentYear - i);
      return {text: year, value: year};
    }),
  ];
}
