import { cn } from '@/shared/lib/cn';
import LogoLink from '@/shared/ui/common/Logo/LogoLink';

import SearchLinkButton from '@/features/search/ui/SearchLinkButton';

import BannerSwiper from './BannerSwiper';

/**
 * 홈 상단의 검은 배경.
 *
 * 높이는 순수 장식이다 — fixed·z-0 배경이고, 본문은 고정값 mt-[160px] 로
 * 띄우므로 이 값에 아무것도 의존하지 않는다.
 *
 * ⚠️ dvh 를 쓰지 않는다. iOS 는 스크롤로 주소창이 접히고 펴질 때 dvh 를 다시
 * 계산해서, 뒤로가기로 돌아와 스크롤이 복원되는 순간 이 배경이 위아래로
 * 흔들린다(헤드리스 브라우저엔 주소창이 없어 재현이 안 된다).
 *
 * 420px 근거: 본문이 160px 에서 시작하므로 그보다 크면 빈틈이 없다.
 * 기기별 50dvh 는 333(SE)~466(15 Pro Max), 아이폰14 가 422 라 거의 같다.
 */
const BackgroundHeader = async () => {
  return (
    <div className={cn('max-w-mobile-max fixed top-0 z-0 mx-auto h-[420px] w-full bg-gray-900')}>
      <div className="max-w-mobile-max mx-auto w-full">
        <header className="flex h-14 w-full items-center justify-between px-5 py-3">
          <LogoLink inverted />
          <SearchLinkButton color="#FFF" />
        </header>
        <BannerSwiper />
      </div>
    </div>
  );
};

export default BackgroundHeader;
