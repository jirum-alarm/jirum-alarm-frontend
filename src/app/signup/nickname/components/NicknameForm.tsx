import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import { Cancel } from '@/components/common/icons';
import { Registration } from '../../page';
import useNicknameFormViewModel from '../hooks/useNicknameFormViewModel';

const NickNameForm = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (nickname: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  const {
    isValidInput,
    handleInputChange,
    handleInputFocus,
    handleInputBlur,
    reset,
    handleSubmit,
  } = useNicknameFormViewModel({
    registration,
    handleRegistration,
    moveNextStep,
  });

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col justify-between pt-[88px]">
      <NicknameInput
        registration={registration}
        handleInputChange={handleInputChange}
        handleInputFocus={handleInputFocus}
        handleInputBlur={handleInputBlur}
        reset={reset}
      />
      <Button type="submit" disabled={!isValidInput}>
        다음
      </Button>
    </form>
  );
};

export default NickNameForm;

const NicknameInput = ({
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
    <Input
      type="text"
      id="nickname"
      placeholder="닉네임을 입력해주세요."
      value={registration.nickname.value}
      icon={registration.nickname.focus ? <Cancel id="cancel" onMouseDown={reset} /> : ''}
      error={registration.nickname.error && '공백없이 2~12자로 입력해주세요.'}
      onChange={handleInputChange}
      onFocus={handleInputFocus}
      onBlur={handleInputBlur}
    />
  );
};
