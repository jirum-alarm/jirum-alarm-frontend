import {Linking} from 'react-native';

import {StorageKey} from '@/shared/constant/storage-key';
import {openInAppBrowser} from '@/shared/lib/navigation';
import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';

export const OKACHAT_LINK = 'https://open.kakao.com/o/gJZTWAAg';

/**
 * 뷰티 핫딜 방. web 은 런타임 env(NEXT_PUBLIC_KAKAO_BEAUTY_ROOM_URL, gitops configmap)지만 앱엔 원격 설정이
 * 없어 상수로 둔다 — 바꾸려면 여기 고쳐 OTA.
 */
export const OKACHAT_BEAUTY_LINK = 'https://open.kakao.com/o/pQ6ZAhSi';

/** web shared/lib/okachat OkachatRoom 과 같은 값 — GA4 room 파라미터. */
export type OkachatRoom = 'hotdeal' | 'beauty';

/** 방마다 입장 기록을 따로 둔다 — 핫딜방에 들어간 사람에게도 뷰티방 권유는 보여야 한다. 핫딜방은 옛 키 그대로. */
const joinedKey = (room: OkachatRoom) =>
  room === 'hotdeal'
    ? StorageKey.OKACHAT_JOINED
    : StorageKey.OKACHAT_JOINED_BEAUTY;

export async function hasJoinedOkachat(
  room: OkachatRoom = 'hotdeal',
): Promise<boolean> {
  try {
    return (await getAsyncStorage(joinedKey(room))) === true;
  } catch {
    return false;
  }
}

export async function markOkachatJoined(
  room: OkachatRoom = 'hotdeal',
): Promise<void> {
  try {
    await setAsyncStorage(joinedKey(room), true);
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
export async function openOkachat(
  link: string = OKACHAT_LINK,
  room: OkachatRoom = 'hotdeal',
): Promise<void> {
  await markOkachatJoined(room);
  try {
    await Linking.openURL(link);
  } catch {
    openInAppBrowser(link);
  }
}
