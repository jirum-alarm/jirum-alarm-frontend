'use client';
import Button from '@/components/common/Button';
import { useCategoriesFormViewModel } from '../hooks/useCategoriesFormViewModel';
import CategoriesCheckboxGroup from '@/features/categories/components/CategoriesCheckboxGroup';

const CategoriesForm = () => {
  const { handleSubmit, handleCheckChange, categories, canSubmit } = useCategoriesFormViewModel();

  return (
    <form className="flex-1 flex flex-col justify-between" onSubmit={handleSubmit}>
      <CategoriesCheckboxGroup categories={categories} handleCheckChange={handleCheckChange} />
      <Button type="submit" disabled={!canSubmit}>
        저장
      </Button>
    </form>
  );
};

export default CategoriesForm;
