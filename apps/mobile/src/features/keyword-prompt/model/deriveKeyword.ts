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
 */

/** 토큰 사이 구분자로만 쓰이는 문자. 이것만 공백으로 바꾼다. */
const SEPARATORS = /[/|·ㆍ,~～·]+/g;

/** 토큰 가장자리에 붙은 장식 문자. 내부(m.2)는 건드리지 않고 양끝만 턴다. */
const EDGE_PUNCT = /^[.\-_+#*&']+|[.\-_#*&']+$/g;

export function deriveKeyword(title: string): string {
  const cleaned = title
    .replace(/^\[[^\]]*\]\s*/, '') // [지마켓] 같은 말머리 제거
    .split('(')[0]
    .replace(SEPARATORS, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleaned
    .split(' ')
    // 양끝 장식만 턴다. `1++` 처럼 뒤의 +가 의미인 경우가 있어 +는 끝에서 안 지운다.
    .map(w => w.replace(EDGE_PUNCT, ''))
    .filter(Boolean);

  const keyword =
    words.length > 2 ? words.slice(0, 2).join(' ') : words.join(' ');

  return keyword.slice(0, 20).trim();
}
