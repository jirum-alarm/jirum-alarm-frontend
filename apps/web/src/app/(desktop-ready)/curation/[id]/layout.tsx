import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

import { checkDevice } from '@/app/actions/agent';

import BasicLayout from '@/shared/ui/layout/BasicLayout';
import SectionHeader from '@/shared/ui/SectionHeader';

import { getPromotionSectionById } from '@/entities/promotion/api/getPromotionSections';

import Footer from '@/widgets/layout/ui/desktop/Footer';

import CurationPageHeader from '../components/CurationPageHeader';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { isMobile } = await checkDevice();
  const { id } = await params;
  const section = await getPromotionSectionById(id);

  if (!section) {
    notFound();
  }

  const renderMobile = () => {
    return (
      <BasicLayout header={<CurationPageHeader title={section.title} />}>
        {children}
        <Footer />
      </BasicLayout>
    );
  };

  const renderDesktop = () => {
    return (
      <div className="mt-14 pt-8">
        {/* 헤더(h1)는 모바일 분기에만 있다 — 크롤러는 데스크톱 UA 라 여기에도 둔다. */}
        <h1 className="sr-only">{section.title} 핫딜 모음</h1>
        <SectionHeader title={section.title} />
        <div className="max-w-layout-max mx-auto">{children}</div>
      </div>
    );
  };

  return isMobile ? renderMobile() : renderDesktop();
}
