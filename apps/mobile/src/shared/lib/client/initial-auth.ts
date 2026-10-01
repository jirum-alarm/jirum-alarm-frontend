/**
 * 콜드 스타트의 첫 토큰 갱신이 끝났는가 — access token 을 쓰는 요청은 이걸 기다린다.
 *
 * 앱은 저장된 refresh token 이 있으면 갱신 응답을 기다리지 않고 바로 메인을 그린다
 * (스플래시가 네트워크 왕복을 기다리지 않게). 그 사이 화면 쿼리가 **만료된 access token** 으로
 * 나가 401 로 굳지 않도록, 갱신이 끝나(성공·실패 무관) 새 토큰이 저장될 때까지 여기서 줄 세운다.
 * 화면엔 그동안 디스크에 저장해 둔 캐시가 보인다.
 *
 * ponytail: 8초 안전핀 — 갱신이 끝났다는 신호가 어떤 이유로 안 와도 요청이 영영 멈추지 않게.
 */
let settle: () => void = () => {};
const settled = new Promise<void>(resolve => {
  settle = resolve;
  setTimeout(resolve, 8000);
});

export const waitForInitialAuth = () => settled;
export const settleInitialAuth = () => settle();
