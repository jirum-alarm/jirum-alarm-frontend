import { Registration } from '../../page';
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
    <div className="flex flex-col h-full">
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
    <p className="font-semibold text-2xl">
      닉네임을
      <br />
      입력해주세요.
    </p>
  );
};
