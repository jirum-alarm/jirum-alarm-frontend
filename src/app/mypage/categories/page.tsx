import BasicLayout from '@/components/layout/BasicLayout';
import React from 'react';
import CategoriesForm from './components/CategoriesForm';

const CategoriesPage = () => {
  return (
    <BasicLayout hasBackButton title="관심카테고리 수정">
      <div className="h-full px-5 pt-6 pb-8">
        <fieldset className="flex flex-col h-full">
          <legend>
            <p className="pb-7 text-sm text-gray-700">
              내 관심사는 최대 5개까지
              <br /> 선택할 수 있어요.
            </p>
          </legend>
          <CategoriesForm />
        </fieldset>
      </div>
    </BasicLayout>
  );
};

export default CategoriesPage;
