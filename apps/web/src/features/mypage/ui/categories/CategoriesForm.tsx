'use client';

import { MAX_SELECTION_COUNT } from '@/shared/config/categories';
import Button from '@/shared/ui/common/Button';

import CategoriesCheckboxGroup from '@/entities/category/ui/CategoriesCheckboxGroup';

import { useCategoriesFormViewModel } from '../../model/useCategoriesFormViewModel';

const CategoriesForm = () => {
  const { handleSubmit, handleCheckChange, categories, SELECTION_COUNT } =
    useCategoriesFormViewModel();
  return (
    <form className="flex flex-1 flex-col justify-between" onSubmit={handleSubmit}>
      <CategoriesCheckboxGroup categories={categories} handleCheckChange={handleCheckChange} />
      {/* 0개는 저장할 게 없다 — 형제 화면(키워드 `등록`)은 이미 비활성을 쓴다. */}
      <Button type="submit" disabled={SELECTION_COUNT === 0}>
        {`저장 (${SELECTION_COUNT}/${MAX_SELECTION_COUNT})`}
      </Button>
    </form>
  );
};

export default CategoriesForm;
