import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Cancel } from '@/components/common/icons';
import { Registration } from '../../page';
import useEmailFormViewModel from '../hooks/useEmailFormViewModel';

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
      <div className="fixed bottom-0 left-0 right-0 m-auto w-full max-w-[480px] px-5 pb-9">
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
        error={registration.email.error && '올바른 이메일 형식으로 입력해주세요.'}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
      />
    </label>
  );
};
