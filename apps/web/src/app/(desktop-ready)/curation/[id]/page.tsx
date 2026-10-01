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

  // "뽐뿌 | 지름알림"·"뽐뿌 모아보기"(7~15자)로는 무슨 페이지인지 검색결과에서 안 읽힌다(2026-10-01 실측).
  const name = /핫딜/.test(section.title) ? section.title : `${section.title} 핫딜`;
  const title = `${name} 모음 | 지름알림`;
  const description = `${section.subTitle ? `${section.subTitle}. ` : ''}${name}을 실시간으로 모아 가격·커뮤니티 반응·종료 여부를 한눈에 보여드려요. 원하는 상품은 키워드 알림으로 받아보세요.`;
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
