import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { checkDevice } from '@/app/actions/agent';
import { getAccessToken } from '@/app/actions/token';

import { PAGE } from '@/shared/config/page';
import BackButton from '@/shared/ui/layout/BackButton';
import BasicLayout from '@/shared/ui/layout/BasicLayout';

import { POST_FORM_ID } from '@/features/community/ui/PostForm';
import PostFormClient from '@/features/community/ui/PostFormClient';

export const metadata: Metadata = {
  title: '글쓰기 | 지름알림 커뮤니티',
  // 로그인 필요 + 작성 페이지이므로 색인 제외
  robots: { index: false, follow: false },
};

export default async function CommunityWritePage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>;
}) {
  const token = await getAccessToken();
  if (!token) redirect(PAGE.LOGIN);

  const { isMobile } = await checkDevice();
  const { edit } = await searchParams;
  const editPostId = edit ? Number(edit) : undefined;

  if (isMobile) {
    return (
      <BasicLayout
        hasBackButton
        header={
          <header className="max-w-mobile-max border-border-subtle bg-surface-default fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b px-3">
            <div className="flex items-center">
              <BackButton />
              <span className="typography-title-16sb text-fg-primary ml-1">
                {editPostId ? '글 수정' : '글쓰기'}
              </span>
            </div>
            <button
              type="submit"
              form={POST_FORM_ID}
              className="text-primary-500 typography-body-14sb pr-2"
            >
              {editPostId ? '수정 완료' : '올리기'}
            </button>
          </header>
        }
      >
        <PostFormClient editPostId={editPostId} />
      </BasicLayout>
    );
  }

  return (
    <div className="max-w-2xl py-8">
      <h1 className="text-fg-primary mb-6 text-xl font-bold">
        {editPostId ? '글 수정' : '글쓰기'}
      </h1>
      <PostFormClient editPostId={editPostId} />
    </div>
  );
}
