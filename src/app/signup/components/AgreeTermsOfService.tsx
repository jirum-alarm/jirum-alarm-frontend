import Link from 'next/link';
import Button from '@/components/common/Button';
import { CheckDefault, CheckboxSelected } from '@/components/common/icons';
import { Registration } from '../page';

const CONSENT_ALL = '모두 동의';
const CONSENT_REQUIRED = {
  termsOfService: '[필수] 서비스 이용약관 동의',
  privacyPolicy: '[필수] 개인정보 처리방침 동의',
} as const;

type ConsentRequiredKey = keyof typeof CONSENT_REQUIRED;
type ConsentRequired = (typeof CONSENT_REQUIRED)[ConsentRequiredKey];

const AgreeTermsOfService = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (consent: Partial<Pick<Registration, ConsentRequiredKey>>) => void;
  moveNextStep: () => void;
}) => {
  const toggleConsentAll = (isAllConsented: boolean) => {
    handleRegistration({ termsOfService: !isAllConsented, privacyPolicy: !isAllConsented });
  };

  const toggleConsent = (id: ConsentRequiredKey) => {
    const isConsentIncludes = registration[id];

    handleRegistration({ [id]: !isConsentIncludes });
  };

  const handleCTAButton = () => {
    moveNextStep();
  };

  return (
    <div className="grid h-full">
      <div>
        <Description />
        <div className="pt-[88px] select-none">
          <ConsentAll registration={registration} toggleConsentAll={toggleConsentAll} />
          <div className="grid items-center pt-6 gap-y-4">
            <ConsentRequired
              id="termsOfService"
              registration={registration}
              link={'https://seonkyo.notion.site/8edd5934ff8d4ec68d75bd136e6a3052'}
              toggleConsent={toggleConsent}
            />
            <ConsentRequired
              id="privacyPolicy"
              registration={registration}
              link={'https://seonkyo.notion.site/389d4f8ea8f741aca2ec5448fb86ac1f'}
              toggleConsent={toggleConsent}
            />
          </div>
        </div>
      </div>
      <Button
        onClick={handleCTAButton}
        disabled={!(registration.termsOfService && registration.privacyPolicy)}
        className="self-end"
      >
        다음
      </Button>
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

const ConsentAll = ({
  registration,
  toggleConsentAll,
}: {
  registration: Registration;
  toggleConsentAll: (isAllConsented: boolean) => void;
}) => {
  const isAllConsented = registration.termsOfService && registration.privacyPolicy;

  const handleCheckboxChange = () => {
    toggleConsentAll(isAllConsented);
  };

  return (
    <label
      onChange={handleCheckboxChange}
      className="flex gap-x-2 items-center font-semibold cursor-pointer"
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
  registration,
  link,
  toggleConsent,
}: {
  id: ConsentRequiredKey;
  registration: Registration;
  link: string;
  toggleConsent: (consent: ConsentRequiredKey) => void;
}) => {
  const handleCheckboxChange = () => {
    toggleConsent(id);
  };

  return (
    <div className="grid grid-flow-col">
      <label onChange={handleCheckboxChange} className="flex gap-x-2 items-center cursor-pointer">
        <input type="checkbox" id={id} className="hidden" />
        {registration[id] ? (
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
