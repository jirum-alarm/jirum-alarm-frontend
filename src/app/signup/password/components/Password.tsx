import { Registration } from '../../page';
import PasswordForm from './PasswordForm';

const Password = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (password: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  return (
    <div className="flex flex-col h-full">
      <Description />
      <PasswordForm
        registration={registration}
        handleRegistration={handleRegistration}
        moveNextStep={moveNextStep}
      />
    </div>
  );
};

export default Password;

const Description = () => {
  return (
    <p className="font-semibold text-2xl">
      비밀번호를
      <br />
      입력해주세요.
    </p>
  );
};
