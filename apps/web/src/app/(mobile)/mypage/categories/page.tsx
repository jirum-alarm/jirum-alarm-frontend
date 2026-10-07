import { Suspense } from 'react';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import CategoriesForm from '@/features/mypage/ui/categories/CategoriesForm';

const CategoriesPage = () => {
  return (
    <BasicLayout hasBackButton title="관심 카테고리">
      <div className="pc:pt-0 h-full px-5 pt-6 pb-8">
        <fieldset className="flex h-full flex-col">
          <legend>
            <p className="pb-7 text-sm text-gray-700">
              내 관심사는 최대 5개까지
              <br className="pc:hidden" /> 선택할 수 있어요.
            </p>
          </legend>
          <Suspense>
            <CategoriesForm />
          </Suspense>
        </fieldset>
      </div>
    </BasicLayout>
  );
};

export default CategoriesPage;
