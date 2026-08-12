/**
 * 상세 링크 클릭을 웹 라우터보다 먼저 가로채는 주입 스크립트.
 *
 * ★ 왜 필요한가: 웹이 Next.js(SPA)라 카드를 누르면 pushState 로 URL 만 바뀐다.
 * onShouldStartLoadWithRequest 는 "문서 로드"에만 발화하므로 그 시점엔 이미
 * 웹이 상세를 그린 뒤다. 그래서 예전 구현은
 *   웹이 상세를 그림 → 뒤늦게 네이티브 push → 웹뷰 goBack
 * 순서가 되어, 웹 상세가 한 프레임 보였다 사라지는 이중 전환이 보였다.
 *
 * 캡처 단계(3번째 인자 true)에서 클릭을 잡으면 React 의 이벤트 핸들러와
 * Next 라우터보다 먼저 실행된다. preventDefault 로 웹 이동을 막고 네이티브에만
 * 알리므로 웹은 아예 안 움직인다 — goBack 도 필요 없다.
 *
 * 막지 못하는 경우(웹이 코드로 router.push 하는 버튼 등)는 여전히
 * onNavigationStateChange 폴백이 받는다. 두 경로는 같은 dedup 키를 쓴다.
 */
export const INTERCEPT_DETAIL_LINK_SCRIPT = `
  (function() {
    if (window.__jirumDetailIntercept) { return; }
    window.__jirumDetailIntercept = true;

    // 클릭 훅과 pushState 가드가 같은 이동을 각각 보내면 상세가 두 번 쌓인다
    // (로고를 눌러도 한 겹만 벗겨져 상세가 또 보이던 원인).
    var lastSent = {path: '', at: 0};
    function send(path) {
      var now = Date.now();
      if (path === lastSent.path && now - lastSent.at < 700) { return; }
      lastSent = {path: path, at: now};
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'OPEN_PRODUCT_DETAIL',
          payload: {data: {path: path}},
        }));
      }
    }

    document.addEventListener('click', function(e) {
      // 새 탭·다운로드·수정키 조합은 웹 기본 동작을 존중한다.
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) { return; }
      if (e.button !== undefined && e.button !== 0) { return; }

      var el = e.target;
      while (el && el.tagName !== 'A') { el = el.parentElement; }
      if (!el) { return; }
      if (el.target === '_blank' || el.hasAttribute('download')) { return; }

      var href = el.getAttribute('href') || '';
      // 절대/상대 모두 허용. 쿼리·해시는 살려서 넘긴다.
      var m = href.match(/^(?:https?:\\/\\/[^\\/]+)?(\\/products\\/\\d+(?:[\\/?#][^\\s]*)?)$/);
      if (!m) { return; }

      e.preventDefault();
      e.stopPropagation();
      send(m[1]);
    }, true);

    // ★ 2차 방어: Next 의 클라이언트 라우팅 자체를 막는다.
    // 카드가 <a> 가 아니거나(버튼·div + router.push), Next 가 자기 리스너를
    // 먼저 처리해 버리는 경우 위 클릭 훅만으로는 못 막는다. 그때 웹이 상세를
    // 그렸다가 네이티브가 덮어써서 "뭔가 생겼다가 상세가 뜨는" 잔상이 남는다.
    // history.pushState 를 감싸 상세 경로면 웹 이동을 취소하고 네이티브에만 알린다.
    var origPush = history.pushState;
    history.pushState = function(state, title, url) {
      try {
        var u = String(url || '');
        var m = u.match(/^(?:https?:\/\/[^\/]+)?(\/products\/\d+(?:[\/?#][^\s]*)?)$/);
        if (m) {
          send(m[1]);
          return; // 웹은 이동하지 않는다 — 화면이 바뀌지 않으므로 잔상이 없다.
        }
      } catch (err) {}
      return origPush.apply(history, arguments);
    };
  })();
  true;
`;
