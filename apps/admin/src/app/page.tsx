import { Metadata } from 'next';
import DefaultLayout from '@/components/Layouts/DefaultLayout';

export const metadata: Metadata = {
  title: '지름알림 어드민',
  description: '어드민 프로젝트입니다.',
};
export default function Home() {
  return (
    <>
      <DefaultLayout>어드민 배포!!{/* <ECommerce /> */}</DefaultLayout>
    </>
  );
}
