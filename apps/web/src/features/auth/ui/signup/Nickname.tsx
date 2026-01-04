import { Registration } from '@/features/auth';

import NickNameForm from './NicknameForm';

const Nickname = ({
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
      <NickNameForm
        registration={registration}
        handleRegistration={handleRegistration}
        moveNextStep={moveNextStep}
      />
    </div>
  );
};

export default Nickname;

const Description = () => {
  return (
    <p className="text-2xl font-semibold">
      닉네임을
      <br />
      입력해주세요.
    </p>
  );
};
