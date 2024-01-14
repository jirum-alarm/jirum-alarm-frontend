import BasicLayout from '@/components/layout/BasicLayout';
import Link from 'next/link';

const TermsPoliciesPage = () => {
  return (
    <BasicLayout hasBackButton title="약관 및 정책">
      <div className="py-6 h-full">
        <Link href={'/policies/terms'}>
          <div className="px-5 py-4">서비스 이용약관</div>
        </Link>
        <Link className="w-full" href={'/policies/privacy'}>
          <div className="px-5 py-4">개인정보 처리방침</div>
        </Link>
      </div>
    </BasicLayout>
  );
};

export default TermsPoliciesPage;
