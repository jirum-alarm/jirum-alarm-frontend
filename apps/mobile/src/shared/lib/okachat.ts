import {Linking} from 'react-native';

import {StorageKey} from '@/shared/constant/storage-key';
import {openInAppBrowser} from '@/shared/lib/navigation';
import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';

export const OKACHAT_LINK = 'https://open.kakao.com/o/gJZTWAAg';

export async function hasJoinedOkachat(): Promise<boolean> {
  try {
    return (await getAsyncStorage(StorageKey.OKACHAT_JOINED)) === true;
  } catch {
    return false;
  }
}

export async function markOkachatJoined(): Promise<void> {
  try {
    await setAsyncStorage(StorageKey.OKACHAT_JOINED, true);
  } catch {
    // ignore
  }
}

/**
 * 오카방을 카카오톡으로 바로 연다. 인앱 브라우저로 열면 open.kakao.com 웹 페이지가 뜨고
 * 거기서 「참여하기」를 한 번 더 눌러야 카톡이 열렸다 — 시스템에 넘기면 유니버설/앱 링크로
 * 카카오톡이 곧장 뜬다. 넘기지 못하면(카톡 미설치 등) 예전처럼 인앱 브라우저.
 * 입장 여부는 알 수 없으니 누른 순간 입장으로 친다(web 과 같은 기준) — 권유가 다시 뜨지 않게.
 */
export async function openOkachat(link: string = OKACHAT_LINK): Promise<void> {
  await markOkachatJoined();
  try {
    await Linking.openURL(link);
  } catch {
    openInAppBrowser(link);
  }
}
