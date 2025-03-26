'use client';

import Button from '@/components/common/Button';
import { MAX_SELECTION_COUNT } from '@/constants/categories';
import CategoriesCheckboxGroup from '@/features/categories/components/CategoriesCheckboxGroup';

import { useCategoriesFormViewModel } from '../hooks/useCategoriesFormViewModel';

const CategoriesForm = () => {
  const { handleSubmit, handleCheckChange, categories, SELECTION_COUNT } =
    useCategoriesFormViewModel();
  return (
    <form className="flex flex-1 flex-col justify-between" onSubmit={handleSubmit}>
      <CategoriesCheckboxGroup categories={categories} handleCheckChange={handleCheckChange} />
      <Button type="submit">{`저장 (${SELECTION_COUNT}/${MAX_SELECTION_COUNT})`}</Button>
    </form>
  );
};

export default CategoriesForm;
