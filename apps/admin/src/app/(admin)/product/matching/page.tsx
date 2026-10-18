import { Suspense } from 'react';

import ProductMatching from './components/ProductMatching';

// useSearchParams 는 Suspense 안에서만 정적 빌드가 된다
const ProductMatchingPage = () => (
  <Suspense>
    <ProductMatching />
  </Suspense>
);

export default ProductMatchingPage;
