import { Metadata } from 'next';

import SearchPageComponent from '@/widgets/search/ui/SearchPage';

export const metadata: Metadata = {
  title: '검색 | 지름알림',
  description: '원하는 상품의 실시간 핫딜과 최저가 정보를 검색해보세요.',
  // 검색 결과 페이지는 중복/저품질 색인을 막기 위해 noindex (링크는 추적)
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return <SearchPageComponent />;
}
