export type IssueProvider = 'toss' | 'ohou' | 'kakao';

/** 수동 발급 대상 몰. 숫자만 있으면 구분 불가라 undefined. */
export const detectIssueProvider = (raw: string): IssueProvider | undefined => {
  const trimmed = raw.trim();
  if (!trimmed || /^\d+$/.test(trimmed)) return undefined;
  if (/(?:shopping\.toss\.im|toss\.shopping|toss\.im|sharelink\.toss\.im)/i.test(trimmed)) {
    return 'toss';
  }
  if (/store\.ohou\.se\/goods\//i.test(trimmed)) return 'ohou';
  if (/store\.kakao\.com\/[^/]+\/products\/\d+/i.test(trimmed) || /kko\.to\//i.test(trimmed)) {
    return 'kakao';
  }
  return undefined;
};

export const ISSUE_PROVIDER_LABEL: Record<IssueProvider, string> = {
  toss: '토스',
  ohou: '오늘의집',
  kakao: '카카오쇼핑',
};
