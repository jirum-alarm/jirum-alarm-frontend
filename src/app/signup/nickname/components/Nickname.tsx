import { Registration } from '../../page';
import NickNameForm from './NicknameForm';

const Nickname = ({
  registration,
  handleRegistration,
  completeRegistration,
}: {
  registration: Registration;
  handleRegistration: (nickname: (registration: Registration) => Partial<Registration>) => void;
  completeRegistration: () => void;
}) => {
  return (
    <div className="flex flex-col h-full">
      <Description />
      <NickNameForm
        registration={registration}
        handleRegistration={handleRegistration}
        completeRegistration={completeRegistration}
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
