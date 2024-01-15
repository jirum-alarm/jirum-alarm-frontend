import { Registration } from '../../page';
import TermsOfServiceForm, { ConsentRequiredKey } from './TermsOfServiceForm';

const TermsOfService = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (consent: Partial<Pick<Registration, ConsentRequiredKey>>) => void;
  moveNextStep: () => void;
}) => {
  return (
    <div className="flex flex-col h-full">
      <Description />
      <TermsOfServiceForm
        registration={registration}
        handleRegistration={handleRegistration}
        moveNextStep={moveNextStep}
      />
    </div>
  );
};

export default TermsOfService;

const Description = () => {
  return (
    <p className="font-semibold text-2xl">
      지름알림 서비스 이용약관에
      <br />
      동의해주세요.
    </p>
  );
};
