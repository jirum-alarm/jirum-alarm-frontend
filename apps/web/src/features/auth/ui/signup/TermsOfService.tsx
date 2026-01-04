import { Registration } from '@/features/auth';

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
    <div className="flex flex-col">
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
    <p className="text-2xl font-semibold">
      지름알림 서비스 이용약관에
      <br />
      동의해주세요.
    </p>
  );
};
