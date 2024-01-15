import { Registration } from '../../page';
import PersonalForm from './PersonalForm';

const Personal = ({
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
      <Description />
      <PersonalForm
        registration={registration}
        handleRegistration={handleRegistration}
        moveNextStep={moveNextStep}
      />
    </div>
  );
};

export default Personal;

const Description = () => {
  return (
    <div>
      <p className="font-semibold text-2xl">
        출생년도와 성별을
        <br />
        알려주세요.<span className="text-gray-500 text-base pl-2">(선택)</span>
      </p>
      <p className="text-gray-700 pt-4 text-sm">
        나와 비슷한 사람들이 좋아하는
        <br />
        물건들을 추천해줘요
      </p>
    </div>
  );
};
