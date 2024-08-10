import BasicLayout from '@/components/layout/BasicLayout';
import React, { Suspense } from 'react';
import CategoriesForm from './components/CategoriesForm';

const CategoriesPage = () => {
  return (
    <BasicLayout hasBackButton title="관심 카테고리 수정">
      <div className="h-full px-5 pb-8 pt-6">
        <fieldset className="flex h-full flex-col">
          <legend>
            <p className="pb-7 text-sm text-gray-700">
              내 관심사는 최대 5개까지
              <br /> 선택할 수 있어요.
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
