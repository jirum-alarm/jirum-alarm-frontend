import Button from '@/shared/ui/common/Button';
import { ErrorIllust } from '@/shared/ui/common/icons/Illust';
import IllustEmpty from '@/shared/ui/common/icons/IllustEmpty';
import { emptyText, text } from '@jirum/design-system/recipes';

import type { Meta, StoryObj } from '@storybook/nextjs-vite';

/**
 * 비었을 때 · 실패했을 때 — 부품이 아니라 패턴이다. 문구·그림·다음 동작이 화면마다 달라 컴포넌트로 묶지 않고
 * 조각(그림 + text.display + text.muted / emptyText + 다음 동작 버튼)을 이 순서로 놓는다.
 * 참고 예시: web widgets/search/ui/ProductNotFound · 앱 screens/search/ui/SearchNotFound · 앱 features/comment/ui/CommentEmpty.
 * 섹션 단위 실패는 앱 SectionErrorRow(한 줄 + 「다시 시도」), 화면 전체 실패는 web ApiErrorBoundary(ServerError).
 */
const States = () => (
  <div className="flex max-w-3xl flex-col gap-10">
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-gray-900">
        화면이 비었을 때 — 그림 + 큰 제목 + 설명 + 다음 동작
      </h2>
      <div className="flex w-[360px] flex-col items-center rounded-xl border border-gray-200 py-10 text-center">
        <ErrorIllust className="size-25" />
        <p className={`pt-4 pb-2 ${text.display}`}>검색 결과가 없어요</p>
        <p className={text.muted}>키워드를 등록하고 알림을 받아보세요</p>
        <div className="pt-6">
          <Button size="md">키워드 알림 받기</Button>
        </div>
      </div>
    </section>
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-gray-900">목록이 비었을 때 — 그림 없이 한 줄</h2>
      <div className="w-[360px] rounded-xl border border-gray-200">
        <p className={`py-6 text-center ${emptyText}`}>아직 등록한 키워드가 없어요.</p>
      </div>
    </section>
    <section className="flex flex-col gap-2">
      <h2 className="text-sm font-semibold text-gray-900">작은 빈 그림</h2>
      <div className="flex w-[360px] flex-col items-center gap-3 rounded-xl border border-gray-200 py-8">
        <IllustEmpty />
        <p className={emptyText}>찜한 상품이 없어요</p>
      </div>
    </section>
  </div>
);

const meta = { title: '패턴/빈·오류 상태', parameters: { layout: 'padded' } } satisfies Meta;
export default meta;

export const All: StoryObj = { name: '전체', render: () => <States /> };
