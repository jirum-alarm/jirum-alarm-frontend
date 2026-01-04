import { Registration } from '@/features/auth';

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
    <div className="flex h-full flex-col">
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
      <p className="text-2xl font-semibold">
        출생년도와 성별을
        <br />
        알려주세요.<span className="pl-2 text-base text-gray-500">(선택)</span>
      </p>
      <p className="pt-4 text-sm text-gray-700">
        나와 비슷한 사람들이 좋아하는
        <br />
        물건들을 추천해줘요
      </p>
    </div>
  );
};
