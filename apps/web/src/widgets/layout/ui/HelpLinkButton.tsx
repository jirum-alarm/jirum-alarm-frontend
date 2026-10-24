'use client';

import * as m from 'motion/react-m';

import { PAGE } from '@/shared/config/page';
import { Help } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

/**
 * 사용법 입구 — 모바일 홈 헤더 우측 맨 앞. 2026-10-24 화면 모드 버튼 자리를 넘겨받았다
 * (처음 온 사람이 가장 먼저 보는 곳에 사용법을, 한 번 정하면 다시 안 누르는 화면 모드는 마이페이지로). 앱 HomeHeader 와 같은 자리.
 * 모양·터치 영역은 CommunityLinkButton 과 맞춘다. Help 는 잉크가 28 틀의 2/3 라 size-7 이어야 옆 24 아이콘과 같은 크기로 보인다.
 */
const HelpLinkButton = ({ color }: { color: string }) => (
  <Link
    className="-m-2 flex items-center justify-center p-2 duration-300"
    href={PAGE.HELP}
    data-track="home-help-link"
    aria-label="사용법"
  >
    <m.div
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="flex h-full w-full items-center justify-center rounded-full"
    >
      <Help color={color} className="size-7" />
    </m.div>
  </Link>
);

export default HelpLinkButton;
