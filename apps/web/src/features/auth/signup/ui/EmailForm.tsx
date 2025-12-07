import { Registration } from '@/app/(mobile)/signup/page';

import Button from '@shared/ui/Button';
import { Cancel } from '@shared/ui/icons';
import Input from '@shared/ui/Input';

import useEmailFormViewModel from '@features/auth/signup/model/useEmailFormViewModel';

const EmailForm = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (email: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  const {
    isValidInput,
    handleInputChange,
    handleInputFocus,
    handleInputBlur,
    reset,
    handleSubmit,
  } = useEmailFormViewModel({
    registration,
    handleRegistration,
    moveNextStep,
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between pt-22">
      <EmailInput
        registration={registration}
        handleInputChange={handleInputChange}
        handleInputFocus={handleInputFocus}
        handleInputBlur={handleInputBlur}
        reset={reset}
      />
      <div className="h-32" />
      <div className="fixed right-0 bottom-0 left-0 m-auto w-full max-w-[600px] bg-white px-5 pt-3 pb-9">
        <Button type="submit" disabled={!isValidInput}>
          다음
        </Button>
      </div>
    </form>
  );
};

export default EmailForm;

const EmailInput = ({
  registration,
  handleInputChange,
  handleInputFocus,
  handleInputBlur,
  reset,
}: {
  registration: Registration;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleInputFocus: () => void;
  handleInputBlur: () => void;
  reset: () => void;
}) => {
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
        error={registration.email.error}
        helperText={registration.email.error && '올바른 이메일 형식으로 입력해주세요.'}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
    </label>
  );
};
