import Button from '@/components/common/Button';
import { useCategoriesFormViewModel } from '../hooks/useCategoriesFormViewModel';
import CategoriesCheckboxGroup from '@/features/categories/components/CategoriesCheckboxGroup';
import { Registration } from '../../page';

const CategoriesForm = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (nickname: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  const { handleSubmit, handleCheckChange, categories } = useCategoriesFormViewModel({
    registration,
    handleRegistration,
    moveNextStep,
  });

  return (
    <fieldset>
      <form className="flex flex-1 flex-col justify-between pt-10" onSubmit={handleSubmit}>
        <CategoriesCheckboxGroup categories={categories} handleCheckChange={handleCheckChange} />
        <Description />
        <Button type="submit">다음</Button>
      </form>
    </fieldset>
  );
};

export default CategoriesForm;

const Description = () => {
  return (
    <p className="pb-4 pt-12 text-center text-sm text-gray-400">
      관심 분야는 나중에 다시 변경할 수 있어요!
    </p>
  );
};
