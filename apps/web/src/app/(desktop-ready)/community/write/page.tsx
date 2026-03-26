import { redirect } from 'next/navigation';

import { checkDevice } from '@/app/actions/agent';
import { getAccessToken } from '@/app/actions/token';

import { PAGE } from '@/shared/config/page';
import BackButton from '@/shared/ui/layout/BackButton';
import BasicLayout from '@/shared/ui/layout/BasicLayout';

import { POST_FORM_ID } from '@/features/community/ui/PostForm';
import PostFormClient from '@/features/community/ui/PostFormClient';

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
          <header className="max-w-mobile-max fixed top-0 z-50 flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white px-3">
            <div className="flex items-center">
              <BackButton />
              <span className="ml-1 text-base font-semibold text-gray-900">
                {editPostId ? '글 수정' : '글쓰기'}
              </span>
            </div>
            <button
              type="submit"
              form={POST_FORM_ID}
              className="text-primary-500 pr-2 text-sm font-semibold"
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
      <h1 className="mb-6 text-xl font-bold text-gray-900">{editPostId ? '글 수정' : '글쓰기'}</h1>
      <PostFormClient editPostId={editPostId} />
    </div>
  );
}
