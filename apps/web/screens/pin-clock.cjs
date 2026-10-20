// web 서버(next dev·start)의 시계를 녹화 시각으로 옮긴다 — NODE_OPTIONS=--require 로 하네스가 넣는다(SCREENS_PIN_NOW=ms).
// 왜: 화면이 «오늘»을 쓰는 곳(랭킹 startDate = N일 전 자정, 커뮤니티 섹션을 날마다 돌려 고르기)은 날이 바뀌면 녹화에 없는
// 쿼리를 부른다(10/21 자정 넘어 커뮤니티가 녹화 안 된 섹션을 불렀다). 시계를 녹화 시각에 맞추면 날짜가 늘 녹화와 같다.
// 시간은 흐른다(시작 순간만 옮김) — 타이머·만료 계산은 그대로 돈다. 브라우저 쪽은 screens.spec.ts 가 context.clock 으로 맞춘다.
const pin = Number(globalThis.process.env.SCREENS_PIN_NOW);
if (pin > 0) {
  const RealDate = Date;
  const offset = pin - RealDate.now();
  // 함수로 만든다 — class 면 new 없이 부른 Date()(문자열 반환)가 던진다. prototype 을 같이 써서 instanceof Date 는 그대로.
  function PinnedDate(...args) {
    if (!new.target) return new RealDate(RealDate.now() + offset).toString();
    return args.length === 0 ? new RealDate(RealDate.now() + offset) : new RealDate(...args);
  }
  PinnedDate.prototype = RealDate.prototype;
  Object.setPrototypeOf(PinnedDate, RealDate);
  PinnedDate.now = () => RealDate.now() + offset;
  // 정적 메서드는 자기 속성으로도 — 서버 렌더 쪽이 Date 를 자기 속성만 보고 옮겨 Date.parse 가 사라졌다.
  PinnedDate.parse = RealDate.parse;
  PinnedDate.UTC = RealDate.UTC;
  globalThis.Date = PinnedDate;
}
