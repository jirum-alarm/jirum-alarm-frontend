export {};

const mockNavigate = jest.fn();
let mockReady = true;

jest.mock('@react-navigation/native', () => ({
  createNavigationContainerRef: () => ({
    isReady: () => mockReady,
    navigate: mockNavigate,
  }),
}));

const {navigateToProductDetail} = require('../src/navigations/navigation-ref');

describe('푸시 알림 → 네이티브 상세', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockReady = true;
  });

  it('상품 상세 URL 은 네이티브가 처리한다', () => {
    expect(
      navigateToProductDetail('https://jirum-alarm.com/products/123'),
    ).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith('HomeTab', {
      screen: 'ProductDetail',
      params: {path: '/products/123'},
    });
  });

  it('쿼리스트링을 살려서 넘긴다', () => {
    navigateToProductDetail('https://jirum-alarm.com/products/123?utm=push');
    expect(mockNavigate).toHaveBeenCalledWith('HomeTab', {
      screen: 'ProductDetail',
      params: {path: '/products/123?utm=push'},
    });
  });

  // 상세가 아닌 알림(공지·이벤트 등)은 기존 웹뷰 주입이 맡아야 한다.
  it('상세가 아닌 URL 은 false 를 반환해 웹뷰로 넘긴다', () => {
    expect(navigateToProductDetail('https://jirum-alarm.com/alarm')).toBe(
      false,
    );
    expect(navigateToProductDetail('https://jirum-alarm.com/')).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // 콜드 스타트에서 네비게이터가 아직 안 떴을 때 무리하게 push 하면 안 된다.
  it('네비게이터가 준비 안 됐으면 false', () => {
    mockReady = false;
    expect(
      navigateToProductDetail('https://jirum-alarm.com/products/123'),
    ).toBe(false);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('navigate 가 던져도 false 로 삼켜 웹뷰 폴백을 살린다', () => {
    mockNavigate.mockImplementationOnce(() => {
      throw new Error('navigator not mounted');
    });
    expect(
      navigateToProductDetail('https://jirum-alarm.com/products/123'),
    ).toBe(false);
  });
});
