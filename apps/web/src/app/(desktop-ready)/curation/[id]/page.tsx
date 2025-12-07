import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPromotionSectionById } from '@entities/promotion';

import CurationContainer from '@/widgets/curation/ui/CurationContainer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const section = getPromotionSectionById(id);

  if (!section) {
    return {
      title: '페이지를 찾을 수 없습니다',
    };
  }

  return {
    title: `${section.title} | 지름알림`,
    description: section.subTitle || `${section.title} 모아보기`,
  };
}

export default async function CurationPage({ params }: PageProps) {
  const { id } = await params;
  const section = getPromotionSectionById(id);

  if (!section) {
    notFound();
  }

  return <CurationContainer section={section} />;
}
