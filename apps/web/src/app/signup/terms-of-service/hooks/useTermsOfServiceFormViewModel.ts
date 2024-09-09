import { Registration } from '../../page';
import { ConsentRequiredKey } from '../components/TermsOfServiceForm';

const useInput = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (consent: Partial<Pick<Registration, ConsentRequiredKey>>) => void;
  moveNextStep: () => void;
}) => {
  const isAllConsented = registration.termsOfService && registration.privacyPolicy;
  const isRequiredConsented = (id: ConsentRequiredKey) => registration[id];
  const isValidInput = isAllConsented;

  const handleConsentAllChange = () => {
    handleRegistration({ termsOfService: !isAllConsented, privacyPolicy: !isAllConsented });
  };

  const handleConsentRequiredChange = (id: ConsentRequiredKey) => {
    handleRegistration({ [id]: !isRequiredConsented(id) });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    moveNextStep();
  };

  return {
    isAllConsented,
    isRequiredConsented,
    isValidInput,
    handleConsentAllChange,
    handleConsentRequiredChange,
    handleSubmit,
  };
};

export default useInput;
