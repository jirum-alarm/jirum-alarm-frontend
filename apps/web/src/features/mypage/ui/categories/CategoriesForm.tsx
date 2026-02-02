'use client';

import CategoriesCheckboxGroup from '@/entities/category/ui/CategoriesCheckboxGroup';

import { MAX_SELECTION_COUNT } from '@/shared/config/categories';
import Button from '@/shared/ui/common/Button';


import { useCategoriesFormViewModel } from '../../model/useCategoriesFormViewModel';

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
