/**
 * 로그인이 필요해서 중단된 동작을 기억했다가, 로그인하고 돌아오면 이어서 실행한다.
 *
 * 왜 sessionStorage 인가: 로그인은 카카오·네이버 OAuth 리다이렉트든 /login/email 이든
 * 결국 페이지를 떠난다. 컴포넌트 상태(useState)는 그때 전부 날아가므로 "무엇을 하려
 * 했는지"를 문서 밖에 남겨야 한다. localStorage 가 아닌 이유는 탭을 닫으면 의도도
 * 같이 사라지는 게 맞기 때문 — 며칠 뒤 새 탭에서 갑자기 찜이 눌리면 곤란하다.
 *
 * 왜 함수가 아니라 문자열인가: 함수는 직렬화가 안 된다. 각 액션에 이름을 붙이고
 * 복귀 후 그 이름으로 핸들러를 찾아 실행한다.
 */

const STORAGE_KEY = 'pending-login-action';
/** 오래된 의도는 실행하지 않는다. 로그인 왕복은 길어야 몇 분이다. */
const MAX_AGE_MS = 10 * 60 * 1000;

export interface PendingAction {
  /** 핸들러를 찾는 키. 예: 'notification-keyword-add' */
  type: string;
  /** 핸들러에 넘길 값. 직렬화 가능해야 한다. */
  payload?: unknown;
  /** 저장 시각(ms). 만료 판정에 쓴다. */
  savedAt: number;
}

export function savePendingAction(type: string, payload?: unknown) {
  if (typeof window === 'undefined') return;
  try {
    const action: PendingAction = { type, payload, savedAt: Date.now() };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(action));
  } catch {
    // 시크릿 모드 등에서 sessionStorage 가 막힐 수 있다. 이어하기는 부가 기능이라
    // 실패해도 로그인 자체를 막지 않는다.
  }
}

/** 저장된 의도를 꺼내면서 지운다(한 번만 실행되도록). 만료됐으면 null. */
export function takePendingAction(): PendingAction | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(STORAGE_KEY);

    const action = JSON.parse(raw) as PendingAction;
    if (!action?.type) return null;
    if (Date.now() - action.savedAt > MAX_AGE_MS) return null;
    return action;
  } catch {
    return null;
  }
}

export function clearPendingAction() {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}
