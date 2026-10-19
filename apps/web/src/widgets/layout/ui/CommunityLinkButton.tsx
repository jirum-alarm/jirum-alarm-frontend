'use client';

import * as m from 'motion/react-m';

import { PAGE } from '@/shared/config/page';
import { BubbleChat } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

/**
 * 커뮤니티 입구 — 홈 헤더 우측(검색과 알림 사이). 2026-10-20 하단 탭의 커뮤니티 자리를 키워드에 주면서 여기로 옮겼다
 * (발견 탭 안은 「지금 뭐가 싸나」 화면이라 글 목록을 섞지 않는다 — 사용자 판단). 앱 HomeHeader 와 같은 자리.
 * 모양·터치 영역은 AlarmLinkButton 과 맞춘다.
 */
const CommunityLinkButton = ({ color, background }: { color: string; background?: string }) => (
  <Link
    className="-m-2 flex items-center justify-center p-2 duration-300"
    href={PAGE.COMMUNITY}
    data-track="home-community-link"
    aria-label="커뮤니티"
  >
    <m.div
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
      className="flex h-full w-full items-center justify-center rounded-full"
    >
      {/* 앞 말풍선 속채움이 var(--color-white) 라 바탕이 테마와 무관한 자리(검은 홈 띠)에선 그 변수를 바탕색으로 덮는다 —
          안 덮으면 흰 덩어리가 된다. 바탕이 white 인 자리는 넘기지 않는다(자기 자신을 가리키면 변수가 무효가 된다). */}
      <BubbleChat
        style={background ? { color, ['--color-white' as string]: background } : { color }}
        className="size-6"
      />
    </m.div>
  </Link>
);

export default CommunityLinkButton;
