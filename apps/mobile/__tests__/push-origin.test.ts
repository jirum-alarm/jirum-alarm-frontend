import {
  peekPushOrigin,
  pickPushNid,
  rememberPushOpen,
  resetPushOriginForTest,
  resolvePushProductId,
} from '@/shared/lib/analytics/push-origin';

// 푸시 nid 가 상세 조회·구매 클릭 기록에 붙는 조건. 엉뚱한 상세에 붙으면 알림 귀속이 부풀고,
// 모양이 틀린 nid 를 보내면 서버 검증에 걸려 조회 기록째 잃는다.
describe('push-origin — 푸시 nid 를 상세 기록에 싣는 조건', () => {
  const now = 1_800_000_000_000;
  const nid = 'aB3_x-9QzK1m';

  beforeEach(() => resetPushOriginForTest());

  it('푸시 링크·target_id 에서 상품 id 를 꺼낸다', () => {
    expect(
      resolvePushProductId({
        link: 'https://jirum-alarm.com/products/123?nid=aB3_x-9QzK1m',
      }),
    ).toBe(123);
    expect(resolvePushProductId({link: '/products/9'})).toBe(9);
    expect(resolvePushProductId({link: '/alarm', target_id: '77'})).toBe(77);
    expect(resolvePushProductId({link: '/alarm'})).toBeNull();
    expect(resolvePushProductId({target_id: 'abc'})).toBeNull();
  });

  it('같은 상품 푸시를 30분 안에 열었으면 nid 를 돌려준다(여러 번 꺼내도 남는다)', () => {
    rememberPushOpen({nid, productId: 7, at: now - 60_000});
    expect(peekPushOrigin(7, now)).toBe(nid);
    // 상세 조회 뒤 구매 클릭에도 붙어야 한다.
    expect(peekPushOrigin(7, now + 1_000)).toBe(nid);
  });

  it('다른 상품·30분 넘음·미래 시각이면 붙이지 않는다', () => {
    const open = {nid, productId: 7, at: now};
    expect(pickPushNid(open, 8, now)).toBeUndefined();
    expect(pickPushNid(open, 7, now + 30 * 60 * 1000 + 1)).toBeUndefined();
    expect(pickPushNid(open, 7, now - 1)).toBeUndefined();
    expect(pickPushNid(null, 7, now)).toBeUndefined();
  });

  it('nid 가 없거나 서버 검증 모양이 아니면 적지 않는다', () => {
    rememberPushOpen({nid: undefined, productId: 7, at: now});
    expect(peekPushOrigin(7, now)).toBeUndefined();
    rememberPushOpen({nid: 'short', productId: 7, at: now});
    expect(peekPushOrigin(7, now)).toBeUndefined();
    rememberPushOpen({nid: 'has space 12', productId: 7, at: now});
    expect(peekPushOrigin(7, now)).toBeUndefined();
    rememberPushOpen({nid, productId: null, at: now});
    expect(peekPushOrigin(7, now)).toBeUndefined();
  });

  it('다른 푸시를 열면 덮인다', () => {
    rememberPushOpen({nid, productId: 7, at: now});
    rememberPushOpen({nid: 'zzzzzzzzzzzz', productId: 8, at: now});
    expect(peekPushOrigin(7, now)).toBeUndefined();
    expect(peekPushOrigin(8, now)).toBe('zzzzzzzzzzzz');
  });
});
