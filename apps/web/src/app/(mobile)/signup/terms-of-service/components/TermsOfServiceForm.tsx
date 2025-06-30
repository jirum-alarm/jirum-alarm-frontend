import Button from '@/components/common/Button';
import { CheckboxSelected, CheckDefault } from '@/components/common/icons';
import Link from '@/features/Link';

import { Registration } from '../../page';
import useTermsOfServiceFormViewModel from '../hooks/useTermsOfServiceFormViewModel';

const CONSENT_ALL = '모두 동의';
const CONSENT_REQUIRED = {
  termsOfService: '[필수] 서비스 이용약관 동의',
  privacyPolicy: '[필수] 개인정보 처리방침 동의',
} as const;

export type ConsentRequiredKey = keyof typeof CONSENT_REQUIRED;
type ConsentRequired = (typeof CONSENT_REQUIRED)[ConsentRequiredKey];

const TermsOfServiceForm = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (consent: Partial<Pick<Registration, ConsentRequiredKey>>) => void;
  moveNextStep: () => void;
}) => {
  const {
    isAllConsented,
    isRequiredConsented,
    isValidInput,
    handleConsentAllChange,
    handleConsentRequiredChange,
    handleSubmit,
  } = useTermsOfServiceFormViewModel({
    registration,
    handleRegistration,
    moveNextStep,
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between pt-22">
      <div>
        <ConsentAll
          isAllConsented={isAllConsented}
          handleConsetAllChange={handleConsentAllChange}
        />
        <div className="grid items-center gap-y-4 pt-6">
          <ConsentRequired
            id="termsOfService"
            link={'policies/terms/'}
            isRequiredConsented={isRequiredConsented}
            handleConsentRequiredChange={handleConsentRequiredChange}
          />
          <ConsentRequired
            id="privacyPolicy"
            link={'policies/privacy'}
            isRequiredConsented={isRequiredConsented}
            handleConsentRequiredChange={handleConsentRequiredChange}
          />
        </div>
      </div>
      <div className="fixed bottom-0 left-0 right-0 m-auto w-full max-w-[600px] px-5 pb-9">
        <Button type="submit" disabled={!isValidInput}>
          다음
        </Button>
      </div>
    </form>
  );
};

export default TermsOfServiceForm;

const ConsentAll = ({
  isAllConsented,
  handleConsetAllChange,
}: {
  isAllConsented: boolean;
  handleConsetAllChange: () => void;
}) => {
  return (
    <label
      onChange={handleConsetAllChange}
      className="flex cursor-pointer items-center gap-x-2 font-semibold"
    >
      <input type="checkbox" className="hidden" />
      {isAllConsented ? (
        <CheckboxSelected className="text-primary-600" />
      ) : (
        <CheckboxSelected className="text-gray-300" />
      )}
      {CONSENT_ALL}
    </label>
  );
};

const ConsentRequired = ({
  id,
  link,
  isRequiredConsented,
  handleConsentRequiredChange,
}: {
  id: ConsentRequiredKey;
  link: string;
  isRequiredConsented: (consent: ConsentRequiredKey) => boolean;
  handleConsentRequiredChange: (consent: ConsentRequiredKey) => void;
}) => {
  const handleChange = () => {
    handleConsentRequiredChange(id);
  };

  return (
    <div className="grid grid-flow-col">
      <label onChange={handleChange} className="flex cursor-pointer items-center gap-x-2">
        <input type="checkbox" id={id} className="hidden" />
        {isRequiredConsented(id) ? (
          <CheckDefault className="text-primary-600" />
        ) : (
          <CheckDefault className="text-gray-300" />
        )}
        {CONSENT_REQUIRED[id]}
      </label>
      <div className="justify-self-end">
        <Link href={link} className="text-link underline">
          보기
        </Link>
      </div>
    </div>
  );
};
