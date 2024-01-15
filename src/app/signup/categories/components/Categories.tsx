import { Registration } from '../../page';
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
    <div className="flex flex-col h-full">
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
      <p className="font-semibold text-2xl">
        관심사를 알려주세요.<span className="text-gray-500 text-base pl-2">(선택)</span>
      </p>
      <p className="text-gray-700 pt-4 text-sm">
        관심분야 핫딜이 올라오면
        <br /> 알림으로 알려드려요.
      </p>
    </legend>
  );
};
