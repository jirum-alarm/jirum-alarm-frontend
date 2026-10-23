/**
 * 문구·상호작용 규칙 — 토큰이 "무슨 색", 레시피가 "무슨 모양"이면 이 파일은 "무슨 말로, 어떻게 묻고 알리나"다.
 * 토스 UX 라이팅 원칙(말하듯이·짧게·핵심부터·강요 말고 제안·쉬운 말)을 지름알림 화면에 맞춰 고정했다.
 * 규칙 설명·예시는 README 「사용성 — 말과 흐름」. 여기엔 **기계가 볼 수 있는 것**만 둔다.
 *
 * eslint.js 가 이 목록을 no-restricted-syntax 에 합친다(설정끼리 합쳐지지 않아 한 배열이어야 한다).
 * 보는 곳: 한글이 든 문자열·템플릿·JSX 글자. 안 보는 곳: 주석, console.*·new Error(개발자용),
 * `description:` 값(검색 결과 설명 — SEO 실험과 얽혀 문체를 따로 정한다), aria-label·accessibilityLabel(화면 읽기 라벨).
 *
 * 법률 문서·법정 고지문처럼 문체를 바꾸면 안 되는 자리는 이유를 적고 끈다:
 *   // eslint-disable-next-line no-restricted-syntax -- 쿠팡 파트너스 법정 고지 문구
 */

// 받침 ㅂ 으로 끝나는 모든 글자(합·입·됩·쌉·갑…) — 「ㅂ니다」 를 빠짐없이 잡는다.
const B_FINAL = Array.from({length: 19 * 21}, (_, i) => String.fromCharCode(0xac00 + i * 28 + 17)).join('');

const words = [
  {
    // 합니다체 → 해요체. 토스는 화면 전부를 해요체 한 가지로 말한다 — 한 화면에 두 말투가 섞이면 다른 사람이 쓴 것처럼 읽힌다.
    pattern: `(?:[${B_FINAL}]니[다까]|십시오)`,
    message: '해요체로 — 「저장했습니다」→「저장했어요」, 「없습니다」→「없어요」, 「입니다」→「이에요/예요」.',
  },
  {
    // 실패는 사용자를 탓하는 말처럼 읽힌다. 동사로, 무엇을 못 했는지 말한다(토스 「~하지 못했어요」).
    pattern: '실패(?:했|하였|하셨)',
    message: '「~에 실패했어요」 대신 동사로 — 「키워드를 저장하지 못했어요」. 할 수 있는 다음 동작이 있으면 뒤에 붙인다(「다시 시도해 주세요」).',
  },
  {
    pattern: '에러',
    message: '「에러」는 개발자 말 — 무엇이 안 됐는지 말한다(「저장하지 못했어요」). 꼭 필요하면 「오류」.',
  },
  {
    // 수동형은 누가 했는지 흐린다. 서비스가 한 일은 서비스가 주어, 사용자가 한 일은 결과로.
    pattern: '되었',
    message: '수동형 대신 능동형 — 「삭제되었어요」→「삭제했어요」, 「추가되었어요」→「찜했어요」. 상태면 「됐어요」.',
  },
  {
    pattern: '(?:하시겠|하시기 바랍|바랍니|요청하신)',
    message: '지나친 높임 대신 말하듯이 — 「삭제하시겠습니까?」→「삭제할까요?」, 「요청하신 페이지」→「찾는 페이지」.',
  },
  {
    // 내용을 기다리는 자리는 올 모양(스켈레톤)을 먼저 보여 준다 — 글자 「불러오는 중...」은 화면이 멈춘 것처럼 보인다.
    // 버튼 안 진행 글자(「등록 중…」「여는 중…」)는 무엇을 하는지 말하므로 괜찮다.
    pattern: '(?:불러오는|로딩) ?중',
    message:
      '「불러오는 중」 글자 대신 올 모양 — 상품 목록은 ProductGridListSkeleton, 그 밖엔 Skeleton(recipes skeleton), 목록 끝 다음 쪽은 LoadingSpinner. 버튼 안이면 「로그인 중…」처럼 하는 일을 말한다.',
  },
];

// 브라우저·OS 기본 창은 앱과 다른 모양·버튼 순서로 튀고(web 은 주소까지 찍힌다), 다크모드·문구 규칙을 못 따른다.
const nativeDialogs = [
  {
    selector: "CallExpression[callee.object.name='window'][callee.property.name=/^(?:alert|confirm|prompt)$/]",
    message: '브라우저 기본 창 대신 확인 창(web AlertDialog) — 되돌릴 수 있는 동작이면 묻지 말고 실행 + 토스트 「되돌리기」.',
  },
  {
    selector: "CallExpression[callee.object.name='Alert'][callee.property.name='alert']",
    message: 'OS 기본 Alert 대신 확인 시트(앱 ConfirmSheet) — 되돌릴 수 있는 동작이면 묻지 말고 실행 + 토스트 「되돌리기」.',
  },
];

// 개발자에게만 보이는 글자, 검색 결과 설명, 화면 읽기 라벨(「불러오는 중」은 스켈레톤의 정당한 이름이다)은 뺀다.
const NOT_UI =
  ":not(CallExpression[callee.object.name='console'] *)" +
  ":not(JSXAttribute[name.name=/^(?:aria-label|accessibilityLabel)$/] > Literal)" +
  ":not(NewExpression[callee.name='Error'] *)" +
  ":not(Property[key.name='description'] > Literal)" +
  ":not(Property[key.name='description'] > TemplateLiteral > TemplateElement)";

const GUIDE = ' (문구·흐름 규칙: packages/design-system/README.md 「사용성 — 말과 흐름」)';

module.exports = {
  // 테스트용(정규식이 잡을 것만 잡는지).
  patterns: words.map(({pattern}) => pattern),
  syntax: [
    ...words.flatMap(({pattern, message}) => [
      {selector: `Literal[value=/${pattern}/]${NOT_UI}`, message: message + GUIDE},
      {selector: `TemplateElement[value.raw=/${pattern}/]${NOT_UI}`, message: message + GUIDE},
      {selector: `JSXText[value=/${pattern}/]`, message: message + GUIDE},
    ]),
    ...nativeDialogs.map(({selector, message}) => ({selector, message: message + GUIDE})),
  ],
};
