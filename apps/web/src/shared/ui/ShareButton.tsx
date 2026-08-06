'use client';

import { EVENT } from '@/shared/config/mixpanel';
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
 * 앱·웹 모두 같은 채널 선택 시트. 앱에서도 카톡/X/스레드를 바로 고를 수 있어야 하고
 * (OS 시트만 띄우면 국내 1순위인 카톡이 두 탭 뒤로 밀린다), OS 시트는 시트 안
 * "기타" 채널로 남는다 — 이중으로 겹치지 않으면서 둘 다 닿는다.
 */
const ShareButton = ({ title, description, imageUrl }: Props) => (
  <ShareSheet title={title} description={description} imageUrl={imageUrl}>
    <Icon />
  </ShareSheet>
);

export default ShareButton;
