import { MAX_SELECTION_COUNT } from '@/shared/config/categories';
import Button from '@/shared/ui/Button';

import { CategoriesCheckboxGroup } from '@/entities/category';

import { Registration, useCategoriesFormViewModel } from '@/features/auth';

const CategoriesForm = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (nickname: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  const { handleSubmit, handleCheckChange, categories, SELECTION_COUNT } =
    useCategoriesFormViewModel({
      registration,
      handleRegistration,
      moveNextStep,
    });

  return (
    <fieldset>
      <form className="flex flex-1 flex-col justify-between pt-10" onSubmit={handleSubmit}>
        <CategoriesCheckboxGroup categories={categories} handleCheckChange={handleCheckChange} />
        <Description />
        <Button type="submit">{`다음 (${SELECTION_COUNT}/${MAX_SELECTION_COUNT})`}</Button>
      </form>
    </fieldset>
  );
};

export default CategoriesForm;

const Description = () => {
  return (
    <p className="pt-12 pb-4 text-center text-sm text-gray-400">
      관심 분야는 나중에 다시 변경할 수 있어요!
    </p>
  );
};
