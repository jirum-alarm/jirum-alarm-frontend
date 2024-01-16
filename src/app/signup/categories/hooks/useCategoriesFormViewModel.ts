import { MAX_SELECTION_COUNT } from '@/constants/categories';
import { Registration } from '../../page';

export const useCategoriesFormViewModel = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (nickname: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  const categories = registration.categories;

  const isMaxSelection = () =>
    MAX_SELECTION_COUNT >= categories.filter((category) => category.isChecked).length + 1;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    moveNextStep();
  };

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.currentTarget;
    if (checked && !isMaxSelection()) return;

    handleRegistration((prev) => ({
      categories: prev.categories.map((category) => ({
        ...category,
        ...(category.value === Number(value)
          ? { isChecked: checked }
          : { isChecked: category.isChecked }),
      })),
    }));
  };

  return { handleSubmit, handleCheckChange, categories };
};
