import { NextRequest, NextResponse } from 'next/server';

import { ANDROID_STORE_LINK, IOS_STORE_LINK } from '@/shared/config/appStore';

/**
 * PC에서 노출한 QR의 착지점. 스캔한 폰의 UA를 보고 해당 스토어로 302.
 *
 * QR 하나로 iOS/안드로이드를 모두 덮기 위한 라우트다. 스토어 URL을 QR에 직접 박으면
 * 플랫폼별로 QR을 2개 그려야 하고, PC 화면에서 사용자가 자기 폰 OS를 골라야 한다.
 *
 * isApple(agent.ts)을 쓰지 않는 이유: 그쪽은 Macintosh도 Apple로 잡아서
 * 맥 데스크톱이 App Store 앱 페이지로 떨어진다. 여기선 iOS 기기만 정확히 본다.
 */
export function GET(request: NextRequest) {
  const ua = request.headers.get('user-agent') ?? '';

  const isIOS = /iPhone|iPad|iPod/i.test(ua);

  // ponytail: iOS가 아니면 전부 Play 스토어. 데스크톱에서 이 URL을 직접 열었을 때를 위한
  // 별도 안내 페이지는 만들지 않는다 — QR 착지가 아닌 접근은 트래픽이 없는 경로.
  const target = isIOS ? IOS_STORE_LINK : ANDROID_STORE_LINK;

  return NextResponse.redirect(target, 302);
}
