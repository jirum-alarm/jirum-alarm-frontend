import { Registration } from '../../page';
import EmailForm from './EmailForm';

const Email = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (email: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  return (
    <div className="flex h-full flex-col">
      <Description />
      <EmailForm
        registration={registration}
        handleRegistration={handleRegistration}
        moveNextStep={moveNextStep}
      />
    </div>
  );
};

export default Email;

const Description = () => {
  return (
    <p className="text-2xl font-semibold">
      이메일을
      <br />
      입력해주세요.
    </p>
  );
};
