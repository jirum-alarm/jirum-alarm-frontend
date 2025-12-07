import Button from '@shared/ui/Button';

import PasswordInput from '../../components/PasswordInput';
import useCurrentPasswordFormViewModel from '../hooks/useCurrentPasswordFormViewModel';

interface CurrentPasswordFormProps {
  nextStep: () => void;
}

const CurrentPasswordForm = ({ nextStep }: CurrentPasswordFormProps) => {
  const { handleSubmit, currentPassword, handleCurrentPasswordChange } =
    useCurrentPasswordFormViewModel({ nextStep });

  return (
    <form className="flex flex-1 flex-col justify-between pt-22" onSubmit={handleSubmit}>
      <PasswordInput
        autoFocus
        labelText="현재 비밀번호"
        placeholder="비밀번호를 입력해주세요."
        value={currentPassword.value}
        helperText={<HelperText value={currentPassword.value} isInValid={currentPassword.error} />}
        handleInputChange={handleCurrentPasswordChange}
      />
      <Button type="submit">다음</Button>
    </form>
  );
};

export default CurrentPasswordForm;

const HelperText = ({ value, isInValid }: { value: string; isInValid: boolean }) => {
  return (
    <>{value && isInValid && <p className="text-error-500">올바른 비밀번호를 입력해주세요.</p>}</>
  );
};
