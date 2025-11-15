export class WindowLocation {
  /**
   * 도메인 + 포트를 반환
   * @example "localhost:3000", "dev.jirumalarm.com", "jirumalarm.com"
   */
  static getCurrentHost = (): string => {
    if (typeof window === 'undefined') return '';
    return window.location.host;
  };

  /**
   * 도메인만 반환 (포트 제외)
   * @example "localhost", "dev.jirumalarm.com", "jirumalarm.com"
   */
  static getCurrentHostname = (): string => {
    if (typeof window === 'undefined') return '';
    return window.location.hostname;
  };

  /**
   * Origin을 반환 (프로토콜 + 도메인 + 포트)
   * @example "http://localhost:3000", "https://dev.jirumalarm.com", "https://jirumalarm.com"
   */
  static getCurrentOrigin = (): string => {
    if (typeof window === 'undefined') return '';
    return window.location.origin;
  };

  /**
   * 현재 URL의 전체 경로를 반환
   * @example "http://localhost:3000/login", "https://jirumalarm.com/products/123"
   */
  static getCurrentUrl = (): string => {
    if (typeof window === 'undefined') return '';
    return window.location.href;
  };
}
