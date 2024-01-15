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
    <div className="flex flex-col h-full">
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
    <p className="font-semibold text-2xl">
      이메일을
      <br />
      입력해주세요.
    </p>
  );
};
