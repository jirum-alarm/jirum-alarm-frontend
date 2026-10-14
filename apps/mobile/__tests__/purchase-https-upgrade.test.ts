import {httpsUpgradeOf} from '../src/screens/purchase/lib/purchase-navigation';

describe('httpsUpgradeOf — 앱 웹뷰는 평문 http 를 막는다(iOS ATS·안드 cleartext)', () => {
  it('페이지 본체의 http 만 https 로', () => {
    expect(
      httpsUpgradeOf({
        url: 'http://mitem.auction.co.kr/vip?itemno=C472046703',
        isTopFrame: true,
      }),
    ).toBe('https://mitem.auction.co.kr/vip?itemno=C472046703');
    expect(httpsUpgradeOf({url: 'HTTP://a.com/x'})).toBe('https://a.com/x');
  });

  it('https·앱 스킴·iframe 은 그대로', () => {
    expect(httpsUpgradeOf({url: 'https://a.com', isTopFrame: true})).toBe(null);
    expect(httpsUpgradeOf({url: 'coupang://mlp', isTopFrame: true})).toBe(null);
    expect(httpsUpgradeOf({url: 'http://ad.com', isTopFrame: false})).toBe(
      null,
    );
  });
});
