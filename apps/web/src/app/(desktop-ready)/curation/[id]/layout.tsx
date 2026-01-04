import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

import { checkDevice } from '@/app/actions/agent';

import BasicLayout from '@/shared/ui/layout/BasicLayout';
import SectionHeader from '@/shared/ui/SectionHeader';

import { getPromotionSectionById } from '@/entities/promotion';

import CurationPageHeader from '@/widgets/curation/ui/CurationPageHeader';
import Footer from '@/widgets/layout/ui/desktop/Footer';

interface LayoutProps {
  children: ReactNode;
  params: Promise<{ id: string }>;
}

export default async function Layout({ children, params }: LayoutProps) {
  const { isMobile } = await checkDevice();
  const { id } = await params;
  const section = getPromotionSectionById(id);

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
        <SectionHeader title={section.title} />
        <div className="max-w-layout-max mx-auto">{children}</div>
      </div>
    );
  };

  return isMobile ? renderMobile() : renderDesktop();
}
