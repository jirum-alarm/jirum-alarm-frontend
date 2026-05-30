import { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { METADATA_SERVICE_URL } from '@/shared/config/env';

import { getPromotionSectionById } from '@/entities/promotion/api/getPromotionSections';

import CurationContainer from '../components/CurationContainer';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const section = await getPromotionSectionById(id);

  if (!section) {
    return {
      title: '페이지를 찾을 수 없습니다',
    };
  }

  const title = `${section.title} | 지름알림`;
  const description = section.subTitle || `${section.title} 모아보기`;
  const url = `${METADATA_SERVICE_URL}/curation/${id}`;
  const image = `${METADATA_SERVICE_URL}/opengraph-image.webp`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: '지름알림',
      locale: 'ko_KR',
      type: 'website',
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image,
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function CurationPage({ params }: PageProps) {
  const { id } = await params;
  const section = await getPromotionSectionById(id);

  if (!section) {
    notFound();
  }

  return <CurationContainer section={section} />;
}
