import { ArrowRight } from '@/shared/ui/common/icons';
import BasicLayout from '@/shared/ui/layout/BasicLayout';
import Link from '@/shared/ui/Link';

const TermsPoliciesPage = () => {
  return (
    <BasicLayout hasBackButton title="약관 및 정책">
      {/* 이동하는 행은 chevron 을 준다 — 마이페이지의 다른 행들과 같은 규칙. */}
      <div className="h-full py-6">
        <Link className="w-full" href={'/policies/terms'}>
          <div className="flex items-center px-5 py-4">
            <span className="flex-1 text-left">서비스 이용약관</span>
            <ArrowRight />
          </div>
        </Link>
        <Link className="w-full" href={'/policies/privacy'}>
          <div className="flex items-center px-5 py-4">
            <span className="flex-1 text-left">개인정보 처리방침</span>
            <ArrowRight />
          </div>
        </Link>
      </div>
    </BasicLayout>
  );
};

export default TermsPoliciesPage;
