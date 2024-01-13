import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Registration } from '../page';
import { Cancel } from '@/components/common/icons';

const Email = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (email: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    validate: (value: string) => boolean,
  ) => {
    const { id, value } = e.target;
    const error = validate(value) ? false : true;

    if (id === 'email') {
      handleRegistration((prev) => ({ [id]: { ...prev[id], value, error } }));
    }
  };

  const handleInputFocus = () => {
    handleRegistration((prev) => ({ email: { ...prev['email'], focus: true } }));
  };

  const handleInputBlur = () => {
    handleRegistration((prev) => ({ email: { ...prev['email'], focus: false } }));
  };

  const reset = () => {
    handleRegistration(() => ({ email: { value: '', error: false, focus: false } }));
  };

  const handleCTAButton = () => {
    moveNextStep();
  };

  const isValidInput = !!(registration.email.value && !registration.email.error);

  return (
    <div className="grid h-full">
      <div>
        <Description />
        <div className="grid items-end">
          <form className="grid gap-y-8 pt-[88px]">
            <EmailInput
              registration={registration}
              handleInputChange={handleInputChange}
              handleInputFocus={handleInputFocus}
              handleInputBlur={handleInputBlur}
              reset={reset}
            />
          </form>
        </div>
      </div>
      <Button onClick={handleCTAButton} disabled={!isValidInput} className="self-end">
        다음
      </Button>
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

const EmailInput = ({
  registration,
  handleInputChange,
  handleInputFocus,
  handleInputBlur,
  reset,
}: {
  registration: Registration;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    validate: (value: string) => boolean,
  ) => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
  reset: () => void;
}) => {
  const validate = (value: string) => {
    if (value === '') {
      return true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(value);
  };

  return (
    <label>
      <Input
        type="email"
        id="email"
        autoComplete="email"
        placeholder="이메일을 입력해주세요."
        required
        value={registration.email.value}
        icon={registration.email.focus ? <Cancel onMouseDown={reset} /> : ''}
        error={registration.email.error && '올바른 이메일 형식으로 입력해주세요.'}
        onChange={(e) => handleInputChange(e, validate)}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
    </label>
  );
};
