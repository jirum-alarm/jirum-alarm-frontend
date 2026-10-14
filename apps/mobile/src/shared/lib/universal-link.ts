import {requireOptionalNativeModule} from 'expo';

type UniversalLinkNativeModule = {
  openAsync(url: string): Promise<boolean>;
};

// iOS 1.5.2 바이너리부터 있다. 그 전 바이너리·안드로이드는 null — 부르는 쪽이 웹으로 이어 간다.
const native =
  requireOptionalNativeModule<UniversalLinkNativeModule>('UniversalLink');

export const canOpenUniversalLinks = native != null;

/** Universal Link 로만 연다. 앱이 없거나 모듈이 없으면 false(사파리로 새지 않는다). */
export async function openUniversalLink(url: string): Promise<boolean> {
  if (!native) return false;
  try {
    return await native.openAsync(url);
  } catch {
    return false;
  }
}
