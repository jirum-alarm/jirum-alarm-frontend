type DeviceLike = {
  isMobileBrowser?: boolean;
  isApple?: boolean;
  isAndroid?: boolean;
} | null;

export type AppDownloadPlatform = 'apple' | 'android' | 'non-mobile';

/**
 * 앱 설치 안내에서 스토어 버튼 / QR 중 무엇을 보여줄지 결정한다.
 *
 * isApple 을 먼저 보면 안 된다: device.isApple 은 UA의 Macintosh 도 잡기 때문에
 * 맥 데스크톱이 'apple'로 분류돼 PC 유저가 App Store 웹페이지로 떨어진다(설치 불가).
 * 모바일 브라우저인지를 먼저 게이트하면 데스크톱은 OS와 무관하게 'non-mobile' = QR.
 */
export function resolveAppDownloadPlatform(device: DeviceLike): AppDownloadPlatform {
  if (!device?.isMobileBrowser) return 'non-mobile';
  if (device.isApple) return 'apple';
  if (device.isAndroid) return 'android';
  return 'non-mobile';
}
