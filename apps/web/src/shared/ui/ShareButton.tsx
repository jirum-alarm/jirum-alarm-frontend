'use client';

import { useEffect, useState } from 'react';

import { EVENT } from '@/shared/config/mixpanel';
import { buildShareMessage, buildShareUrl } from '@/shared/lib/share';
import { isInApp, shareNative, triggerHaptic } from '@/shared/lib/webview';
import { Share } from '@/shared/ui/common/icons';
import ShareSheet from '@/shared/ui/ShareSheet';

type Props = {
  title: string;
  /** 계측이 GTM DOM 트리거였던 시절의 잔재(미사용) — 호출처 호환용. */
  page?: keyof typeof EVENT.PAGE;
  description?: string;
  imageUrl?: string;
};

// ★일반 <button> 이어야 한다. motion.button 은 Drawer.Trigger asChild 의 props/ref
// forwarding 과 호환되지 않아 트리거 속성이 안 붙고 시트가 열리지 않는다(2026-07-29 실측).
// 기존 정상 사례(HotdealGuideModal)도 평범한 button 을 넘긴다.
const Icon = ({ onClick, ...rest }: React.ComponentPropsWithoutRef<'button'>) => (
  <button
    type="button"
    onClick={onClick}
    className="-m-2 rounded-full p-2 transition-transform hover:cursor-pointer active:scale-95"
    aria-label="공유하기"
    title="공유하기"
    {...rest}
  >
    <Share />
  </button>
);

/**
 * 앱(RN 웹뷰)은 OS 네이티브 공유 시트를 그대로 쓴다 — 앱에서 자체 시트를 띄우면
 * 네이티브 공유 위에 웹 시트가 겹쳐 이중이 된다. 웹만 채널 선택 시트.
 */
const ShareButton = ({ title, description, imageUrl }: Props) => {
  // SSR 에선 window 가 없어 항상 false → 마운트 후에 판정해야 hydration mismatch 가 안 난다.
  const [inApp, setInApp] = useState(false);
  useEffect(() => setInApp(isInApp()), []);

  if (inApp) {
    const handleNativeShare = () => {
      triggerHaptic('light');
      const url = buildShareUrl(window.location.href, 'native');
      shareNative({ title, url, message: buildShareMessage(title, url, description) });
    };
    return <Icon onClick={handleNativeShare} />;
  }

  return (
    <ShareSheet title={title} description={description} imageUrl={imageUrl}>
      <Icon />
    </ShareSheet>
  );
};

export default ShareButton;
