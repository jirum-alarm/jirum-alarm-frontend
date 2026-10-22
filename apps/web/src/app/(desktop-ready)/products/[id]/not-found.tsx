import { text } from '@jirum/design-system/recipes';

import { PAGE } from '@/shared/config/page';
import Button from '@/shared/ui/common/Button';
import { IllustWarning } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

/**
 * 없는 상품(삭제·비공개) — page.tsx 의 notFound(). 전역 not-found(「페이지를 찾을 수 없어요」)는 주소를 잘못 친 것처럼
 * 읽혀서, 공유·알림 링크로 온 사람에게 딜이 내려갔다는 이유와 갈 곳(홈·검색)을 준다. 앱은 MissingDealView 가 같은 문구.
 * 상태 코드는 그대로 404 라 검색 색인 정책(동일 title 다수 방지)은 바뀌지 않는다.
 */
export const metadata = {
  title: '판매가 끝났거나 내려간 딜이에요 | 지름알림',
  robots: { index: false, follow: true },
};

const ProductNotFound = () => {
  return (
    <div className="max-w-mobile-max mx-auto flex h-[calc(100dvh)] flex-col items-center justify-center">
      <div className="flex -translate-y-1/3 flex-col items-center px-6">
        <div className="pb-6.5">
          <IllustWarning />
        </div>
        <div className="pb-7 text-center">
          <div className={text.display}>판매가 끝났거나 내려간 딜이에요</div>
          <div className="text-gray-500">
            지금 진행 중인 핫딜을 둘러보거나 찾던 상품을 검색해 보세요
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={PAGE.HOME}>
            <Button size="md">다른 핫딜 보기</Button>
          </Link>
          <Link href={PAGE.SEARCH}>
            <Button size="md" variant="outlined">
              검색하기
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductNotFound;
