/**
 * 상품 제목에서 알림 키워드를 뽑는다. 대괄호 말머리와 괄호 뒷단을 떼어낸 앞부분.
 *
 * 키워드가 길수록 매칭되는 신규 딜이 사라지므로 앞 두 단어까지만 남긴다.
 * (PostPurchaseKeywordPrompt 에서 쓴다. 컴포넌트 파일은 React/Next 를 import 해서
 *  bare node ESM 으로 로드가 안 되므로 순수 함수만 따로 둔다 — 레포의 date.test.ts 참고.)
 *
 * ★특수문자는 "구분자"만 지우고 "토큰 내부" 문자는 남긴다.
 * 운영 알림 키워드 1,411개 중 17개가 특수문자를 의미 있게 쓴다: `m.2` `h.point` `qi2.2`
 * `gt-2000` `퍼스트 2.0` `1++`(한우 등급) `9800x3d+rtx5080`. 전부 지우면 m.2 → m2 가 되어
 * 제목의 "M.2" 와 안 맞는다. 반대로 제목에서 자동 추출할 때 딸려오는 슬래시·중점·파이프
 * 같은 건 의미가 아니라 편집 기호라 지워야 한다.
 *
 * ★말머리·상태어·수량은 키워드가 아니다(2026-10-12 리플레이). 9/1~9/11 상세가 열린 커뮤니티 딜
 * 1,000건으로 뽑은 키워드의 ~13%가 `하루특가) 샐몬`·`품절 화려한우`·`9 4`(날짜)·`Rocoren 5`(5,000mAh)·
 * `펩시제로 500ml` 였다. 말머리는 같은 판매처 다른 상품에 걸리고, 수량은 같은 상품의 다른 묶음을 놓친다.
 * LLM 메타데이터의 상품명(modelName)으로 바꾸는 안은 같은 리플레이에서 기각 — 제목을 다시 써서
 * 원래 제목에조차 39%만 매칭되고, 30일 안에 알림이 가는 비율이 16%(지금 방식 58%)였다.
 */

/** 토큰 사이 구분자로만 쓰이는 문자. 이것만 공백으로 바꾼다. */
const SEPARATORS = /[/|·ㆍ,~～·]+/g;

/** 토큰 가장자리에 붙은 장식 문자. 내부(m.2)는 건드리지 않고 양끝만 턴다. */
const EDGE_PUNCT = /^[.\-_+#*&'[\]]+|[.\-_#*&'[\]]+$/g;

/**
 * `하루특가)`·`최저가)`·`티멤)`·`PICK)` — 여는 괄호 없이 닫는 괄호로 끝나는 말머리.
 * 바로 뒤 대괄호는 판매처가 아니라 브랜드다(`티멤) [삼다수] 무라벨`·`티멤) [코카콜라] 몬스터`) — 지우지 않고 벗긴다.
 * `🔥인기 [지마켓]`·`품절 [리퍼특가]` 뒤의 대괄호는 판매처·분류라 아래 대괄호 규칙이 지운다(9/1~10/12 제목 70건 실측).
 */
const CLOSING_PAREN_TAG = /^[^\s()[\]]{1,10}\)\s*(?:\[([^\]]*)\]\s*)?/;

/** `(무료)`·`(PC)` — 괄호로 시작하는 말머리. 안 떼면 아래 split('(') 이 빈 문자열을 남긴다. */
const LEADING_PAREN_TAG = /^\([^)]*\)\s*/;

/** 맨 앞 상태어·장식어. 상품명이 아니라 글 상태라 같은 상태의 다른 글에 걸린다. */
const STATUS_PREFIX = /^(품절|종료|마감|인기)\S*\s+/;

/** `🔥` 같은 맨 앞 이모지·기호. */
const LEADING_SYMBOLS = /^[^\p{L}\p{N}[(]+/u;

/** `9/4 네이버포인트` 같은 날짜 머리. 구분자 처리 뒤엔 `9 4` 가 돼서 숫자 든 제목 전부에 걸린다. */
const DATE_PREFIX = /^\d{1,2}[/.]\d{1,2}\s+/;

/** 두 번째 단어가 수량·용량이면 버린다 — `펩시제로 500ml` 은 같은 상품 20펫·30캔 묶음을 놓친다. */
const QUANTITY_WORD =
  /^\d[\d.]*(개입|개|입|봉|팩|캔|펫|병|매|롤|박스|ml|l|g|kg|t|구|미|과|인분|ea|p)$/i;

/** 머리에 붙은 것들. `신카)롯카)현카)`·`🔥인기 [기타]` 처럼 겹쳐 붙으니 더 안 바뀔 때까지 뗀다. */
const PREFIXES: [RegExp, (match: string, bracket?: string) => string][] = [
  [LEADING_SYMBOLS, () => ''],
  [/^\[[^\]]*\]\s*/, () => ''], // [지마켓] 같은 말머리
  [LEADING_PAREN_TAG, () => ''],
  [CLOSING_PAREN_TAG, (_, bracket) => (bracket ? `${bracket} ` : '')],
  [STATUS_PREFIX, () => ''],
  [DATE_PREFIX, () => ''],
];

function stripPrefixes(title: string): string {
  let current = title.trim();
  for (let i = 0; i < 5; i++) {
    const next = PREFIXES.reduce((acc, [re, to]) => acc.replace(re, to), current);
    if (next === current) break;
    current = next;
  }
  return current;
}

export function deriveKeyword(title: string): string {
  // 글 전체가 상태 안내면 상품이 없다 → 빈 문자열(배너가 안 뜬다).
  if (/^종료된 (행사|딜|이벤트)/.test(title.trim())) return '';

  const stripped = stripPrefixes(title);

  const cleaned = stripped
    .split('(')[0]
    // 천 단위 쉼표 숫자(`12,000원`·`5,000mAh`)부터는 가격·용량이다 — 그 앞에서 자른다.
    // 쉼표를 구분자로 두면 `Rocoren 5` 가 되고, 이어 붙이면 `쉐이크쉑 12000원` 이 돼 원래 제목과도 안 맞는다.
    .replace(/\s*\S*\d,\d{3}.*$/, '')
    .replace(SEPARATORS, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleaned
    .split(' ')
    // 양끝 장식만 턴다. `1++` 처럼 뒤의 +가 의미인 경우가 있어 +는 끝에서 안 지운다.
    .map((w) => w.replace(EDGE_PUNCT, ''))
    .filter(Boolean);

  const picked = words.slice(0, 2);
  if (picked.length === 2 && QUANTITY_WORD.test(picked[1])) picked.pop();

  return picked.join(' ').slice(0, 20).trim();
}
