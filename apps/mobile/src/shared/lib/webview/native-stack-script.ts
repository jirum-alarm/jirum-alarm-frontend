/**
 * 웹뷰가 **네이티브 스택 위에** 올라가 있다고 웹에 알려주는 주입 스크립트.
 *
 * ★왜 필요한가 — web `useGoBack` 은 세 갈래로 갈린다:
 *   1. `dataset.nativeStack === 'true'` → `PRESS_BACKBUTTON` 브릿지(네이티브가 pop)
 *   2. history 가 쌓여 있으면 → `router.back()`
 *   3. 둘 다 아니면 → **`router.push('/')`**
 *
 * 탭 스택에 새로 push 된 웹뷰는 history 가 비어 있어 3번으로 떨어진다.
 * 그러면 뒤로가기를 눌러도 **그 웹뷰 안에 홈이 그려지고** 원래 화면으로
 * 못 돌아온다(iOS 스와이프 말고는 탈출구가 없다).
 *
 * 웹뷰 탭 시절에는 같은 웹뷰 안 SPA 이동이라 history 가 쌓여 2번이 동작했다 —
 * 즉 이 주입은 **네이티브 전환이 만든 필요**다.
 */
export const NATIVE_STACK_SCRIPT = `
  (function() {
    document.documentElement.dataset.nativeStack = 'true';
    // ★중복 등록 가드를 **DOM(dataset)** 에 둔다.
    //
    // 이 스크립트는 injectedJavaScriptBeforeContentLoaded(문서 로드 전)와
    // injectedJavaScript(로드 후) 두 곳에서 주입된다 — 전자는 하이드레이션
    // 전에 dataset 을 깔기 위해, 후자는 SPA 재진입 대비.
    // 그런데 window 플래그는 **문서 로드가 window 를 새로 만들면서 날아간다**
    // → 두 번째 주입이 리스너를 또 붙여 PRESS_BACKBUTTON 이 2번 가고
    // **pop 이 2번 일어나 탭 밖(홈)으로 튄다**(실측: canGoBack=true 로그 2줄).
    // dataset 은 같은 document 에 남으므로 한 번만 등록된다.
    if (document.documentElement.dataset.jirumBackHooked === '1') { return; }
    document.documentElement.dataset.jirumBackHooked = '1';
    document.addEventListener('click', function(e) {
      var t = e.target;
      if (!t || !t.closest) { return; }
      var btn = t.closest('button[aria-label="뒤로 가기"]');
      if (!btn) { return; }
      e.preventDefault();
      e.stopPropagation();
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PRESS_BACKBUTTON',
          payload: null
        }));
      }
    }, true);
  })();
  true;
`;
