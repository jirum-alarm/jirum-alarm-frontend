import {MyPageService} from '@/shared/api/mypage';
import {StorageKey} from '@/shared/constant/storage-key';
import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';

/**
 * 첫 실행 「이런 거 싸게 뜨면 알려드릴까요?」 시트(features/keyword-prompt FirstAlertSheet)를 띄울 차례인가.
 *
 * 10/12 첫 화면 로그인 벽을 없애자(자동 게스트) 입구는 열렸는데 그다음 칸에서 막혔다 — 10/12~14 처음 연
 * 130명 중 게스트 104명, 키워드 등록 약 4명(3%), iOS 알림 권한 결과 0건. 게스트는 키워드가 없으면 받을
 * 알림이 없어 권한 안내도 건너뛰므로(PushPermissionPrePrompt), 들어온 사람 대부분이 알림 하나 없이 떠났다.
 *
 * 키워드 없는 게스트에게 한 번만. 회원은 키워드가 없어도 좋은 딜 푸시(마케팅 동의)가 있어 기존 안내가 맞다.
 * 조회 실패는 false — 앱을 막지 않는다(홈 추천 칩이 같은 일을 한다).
 */
export async function isFirstAlertDue(): Promise<boolean> {
  try {
    if (await getAsyncStorage(StorageKey.FIRST_ALERT_SHOWN)) return false;
    if ((await getAsyncStorage(StorageKey.IS_GUEST)) !== '1') return false;
    const mine = await MyPageService.getMyKeywords();
    return mine.length === 0;
  } catch {
    return false;
  }
}

export function markFirstAlertShown(): Promise<void> {
  return setAsyncStorage(StorageKey.FIRST_ALERT_SHOWN, true).catch(() => {});
}
