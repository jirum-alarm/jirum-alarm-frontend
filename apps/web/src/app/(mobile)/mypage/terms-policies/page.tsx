import BasicLayout from '@/components/layout/BasicLayout';

import Link from '@shared/ui/Link';

const TermsPoliciesPage = () => {
  return (
    <BasicLayout hasBackButton title="약관 및 정책">
      <div className="h-full py-6">
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
