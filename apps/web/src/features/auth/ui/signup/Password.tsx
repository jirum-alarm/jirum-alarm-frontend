import { Registration } from '@/features/auth';

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
    <div className="flex h-full flex-col">
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
    <p className="text-2xl font-semibold">
      비밀번호를
      <br />
      입력해주세요.
    </p>
  );
};
