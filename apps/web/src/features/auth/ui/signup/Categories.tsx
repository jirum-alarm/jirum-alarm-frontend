import { Registration } from '../../model/signup/registration';

import CategoriesForm from './CategoriesForm';

const Categories = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (nickname: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  return (
    <div className="flex h-full flex-col">
      <fieldset>
        <Description />
        <CategoriesForm
          registration={registration}
          handleRegistration={handleRegistration}
          moveNextStep={moveNextStep}
        />
      </fieldset>
    </div>
  );
};

export default Categories;

const Description = () => {
  return (
    <legend>
      <p className="text-2xl font-semibold">
        관심사를 알려주세요.
        <span className="pl-2 text-base text-gray-500">(선택)</span>
      </p>
      <p className="pt-4 text-sm text-gray-700">
        관심분야 핫딜이 올라오면
        <br /> 알림으로 알려드려요.
      </p>
    </legend>
  );
};
