import {
  beautyRoomAssignment,
  BEAUTY_CATEGORY_ID,
  BEAUTY_ROOM_EXPERIMENT_ID,
} from '../src/screens/detail/lib/beauty-room-experiment';
import {trackOkachatEvent} from '../src/screens/detail/lib/okachat';
import {Analytics} from '../src/shared/lib/analytics/ga4';
import {experimentBucket} from '../src/shared/lib/experiment/experiment-bucket';
import {getAsyncStorage, setAsyncStorage} from '../src/shared/lib/persistence';
import {
  hasJoinedOkachat,
  markOkachatJoined,
  OKACHAT_BEAUTY_LINK,
} from '../src/shared/lib/okachat';

jest.mock('@/shared/lib/device/device-id', () => ({getDeviceId: jest.fn()}));
jest.mock('../src/shared/lib/analytics/ga4', () => ({
  Analytics: {track: jest.fn()},
}));
jest.mock('../src/shared/lib/persistence', () => ({
  getAsyncStorage: jest.fn(),
  setAsyncStorage: jest.fn(),
}));
jest.mock('../src/shared/lib/navigation', () => ({
  openInAppBrowser: jest.fn(),
}));

// web beauty-room-experiment.test.ts 와 같은 표 — 기대값은 crawling-server experimentBucket(node crypto sha256).
const SERVER_BUCKETS: [string, number][] = [
  ['device-1', 75],
  ['device-4', 38],
  ['device-6', 8],
  ['dd345da7-4944-419c-bce2-8af127b7b436', 99],
  ['0192d1a4-7c3e-7000-8000-000000000001', 42],
  ['기기', 69],
];

describe('beauty_detail_room_v1 — 화장품 상세 뷰티방 실험', () => {
  it('버킷 = 서버 experimentBucket (web 과 같은 값)', () => {
    for (const [id, bucket] of SERVER_BUCKETS) {
      expect(experimentBucket(id, BEAUTY_ROOM_EXPERIMENT_ID)).toBe(bucket);
    }
  });

  it('화장품 상세만, 비율을 주면 버킷 < 비율이 b(뷰티방)·나머지 a', () => {
    expect(beautyRoomAssignment('device-6', BEAUTY_CATEGORY_ID, 50)).toEqual({
      arm: 'b',
      exp: 'beauty_detail_room_v1:b',
    });
    expect(beautyRoomAssignment('device-1', BEAUTY_CATEGORY_ID, 50)).toEqual({
      arm: 'a',
      exp: 'beauty_detail_room_v1:a',
    });
    expect(beautyRoomAssignment('device-6', 1)).toBeNull();
    expect(beautyRoomAssignment(null, BEAUTY_CATEGORY_ID)).toBeNull();
    expect(beautyRoomAssignment('device-6', BEAUTY_CATEGORY_ID, 0)).toBeNull();
  });

  it('기본값(전면 적용 100) — 화장품 상세는 전부 b', () => {
    expect(beautyRoomAssignment('device-1', BEAUTY_CATEGORY_ID)?.arm).toBe('b');
  });

  it('okachat 이벤트에 room·exp 를 싣는다 (web 과 같은 파라미터)', () => {
    trackOkachatEvent('okachat_prompt_click', 'soft', {
      room: 'beauty',
      exp: 'beauty_detail_room_v1:b',
    });
    expect(Analytics.track).toHaveBeenLastCalledWith('okachat_prompt_click', {
      placement: 'soft',
      room: 'beauty',
      exp: 'beauty_detail_room_v1:b',
    });
    trackOkachatEvent('okachat_prompt_view', 'after_purchase');
    expect(Analytics.track).toHaveBeenLastCalledWith('okachat_prompt_view', {
      placement: 'after_purchase',
      room: 'hotdeal',
      exp: undefined,
    });
  });

  it('입장 기록은 방마다 따로 — 핫딜방은 옛 키 그대로', async () => {
    await markOkachatJoined('beauty');
    expect(setAsyncStorage).toHaveBeenLastCalledWith(
      'okachatJoined:beauty',
      true,
    );
    await markOkachatJoined();
    expect(setAsyncStorage).toHaveBeenLastCalledWith('okachatJoined', true);

    (getAsyncStorage as jest.Mock).mockImplementation(async (key: string) =>
      key === 'okachatJoined' ? true : null,
    );
    await expect(hasJoinedOkachat()).resolves.toBe(true);
    await expect(hasJoinedOkachat('beauty')).resolves.toBe(false);
  });

  it('뷰티방 링크는 오픈채팅 주소', () => {
    expect(OKACHAT_BEAUTY_LINK).toMatch(/^https:\/\/open\.kakao\.com\/o\//);
  });
});
