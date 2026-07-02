import Link from 'next/link';

import { getAccessToken } from '@/app/actions/token';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

import PreviewClient from './PreviewClient';

// 초안 미리보기 — 발행 전 실제 페이지 모양 검수. isPublished 무관 조회(@Roles ADMIN).
const DealPreviewPage = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const token = await getAccessToken();
  return (
    <DefaultLayout isLoggedIn={!!token}>
      <div className="mb-4">
        <Link href="/deals" className="text-sm text-bodydark2 hover:underline">
          ← 딜 페이지 목록
        </Link>
      </div>
      <PreviewClient slug={decodeURIComponent(slug)} />
    </DefaultLayout>
  );
};

export default DealPreviewPage;
