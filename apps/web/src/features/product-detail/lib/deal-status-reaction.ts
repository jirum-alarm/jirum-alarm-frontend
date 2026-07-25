/**
 * 서버 HotDealKeywordGroupRole 과 동일.
 * QUALITY → 추천%/칩, DEAL_STATUS → 품절·종료 등 상태 문구.
 */
export type ReactionKeywordRole = 'QUALITY' | 'DEAL_STATUS' | string;

export type ReactionKeywordItem = {
  name: string;
  tag: string;
  count: number;
  type: string;
  role?: ReactionKeywordRole | null;
};

/** role 없으면 레거시 name 목록으로 폴백 */
const LEGACY_DEAL_STATUS_NAMES = new Set([
  '품절이에요',
  '종료됐어요',
  '할인이 끝났어요',
  '가격이 올랐어요',
  '가격이 바뀌었어요',
  '취소됐어요',
]);

export function isDealStatusReaction(item: ReactionKeywordItem): boolean {
  if (item.role === 'DEAL_STATUS') return true;
  if (item.role === 'QUALITY') return false;
  return LEGACY_DEAL_STATUS_NAMES.has(item.name);
}

export function splitReactionKeywords(items: ReactionKeywordItem[]) {
  const quality: ReactionKeywordItem[] = [];
  const status: ReactionKeywordItem[] = [];

  for (const item of items) {
    if (isDealStatusReaction(item)) {
      status.push(item);
    } else {
      quality.push(item);
    }
  }

  return { quality, status };
}

/** 품절·종료·할인종료·취소 */
export function isAvailabilityStatus(name: string): boolean {
  return (
    name === '품절이에요' ||
    name === '종료됐어요' ||
    name === '할인이 끝났어요' ||
    name === '취소됐어요'
  );
}

/** 가격 상승·변경 */
export function isPriceStatus(name: string): boolean {
  return name === '가격이 올랐어요' || name === '가격이 바뀌었어요';
}

export function buildDealStatusSummary(statusItems: ReactionKeywordItem[]) {
  if (!statusItems.length) return null;

  const hasAvailability = statusItems.some((i) => isAvailabilityStatus(i.name));
  const hasPrice = statusItems.some((i) => isPriceStatus(i.name));
  const totalMentions = statusItems.reduce((sum, i) => sum + i.count, 0);

  let message = '';
  if (hasAvailability && hasPrice) {
    message = '댓글에서 품절·종료·가격변동 언급이 있어요';
  } else if (hasAvailability) {
    message = '댓글에서 품절·종료 언급이 있어요';
  } else {
    message = '댓글에서 가격이 올랐다는 말이 있어요';
  }

  return { message, totalMentions, items: statusItems };
}
