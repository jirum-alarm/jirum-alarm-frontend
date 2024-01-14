import { Registration } from '../page';
import AgreeTermsOfServiceForm, { ConsentRequiredKey } from './AgreeTermsOfServiceForm';

const AgreeTermsOfService = ({
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
      <AgreeTermsOfServiceForm
        registration={registration}
        handleRegistration={handleRegistration}
        moveNextStep={moveNextStep}
      />
    </div>
  );
};

export default AgreeTermsOfService;

const Description = () => {
  return (
    <p className="font-semibold text-2xl">
      지름알림 서비스 이용약관에
      <br />
      동의해주세요.
    </p>
  );
};
