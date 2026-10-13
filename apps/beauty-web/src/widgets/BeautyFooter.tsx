import { SERVICE_ROUTE } from '@/shared/config/beauty';
import ServiceLink from '@/shared/ui/ServiceLink';

/** 본 서비스로 돌아가는 문 + 약관. 뷰티는 지름알림의 일부라 회사 정보·약관은 본 서비스 것을 가리킨다. */
export default function BeautyFooter() {
  return (
    <footer className="mt-6 border-t border-gray-100 px-5 py-8 text-xs text-gray-500">
      <p>
        지름알림 뷰티는{' '}
        <ServiceLink href={SERVICE_ROUTE.HOME} className="font-semibold text-gray-700 underline">
          지름알림
        </ServiceLink>
        이 커뮤니티 핫딜 중 화장품·스킨케어만 골라 보여 드리는 곳이에요.
      </p>
      <nav aria-label="약관" className="mt-3 flex gap-3">
        <ServiceLink href={SERVICE_ROUTE.TERMS}>이용약관</ServiceLink>
        <ServiceLink href={SERVICE_ROUTE.PRIVACY} className="font-semibold text-gray-700">
          개인정보처리방침
        </ServiceLink>
      </nav>
    </footer>
  );
}
