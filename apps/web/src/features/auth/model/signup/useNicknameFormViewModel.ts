import { Registration } from '@/features/auth';

const MIN_NICKNAME_LENGTH = 2;
const MAX_NICKNAME_LENGTH = 12;

type NicknameValue = Registration['nickname']['value'];

const useInput = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (nickname: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  const validate = (value: NicknameValue) => {
    const valueLength = [...new Intl.Segmenter().segment(value)].length;
    const isValidLength = valueLength >= MIN_NICKNAME_LENGTH && valueLength <= MAX_NICKNAME_LENGTH;
    const isValidNoBlank = !value.includes(' ');

    return isValidLength && isValidNoBlank;
  };

  const isValidInput = !!(registration.nickname.value && !registration.nickname.error);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const error = validate(value) ? false : true;

    handleRegistration((prev) => ({
      nickname: { ...prev.nickname, value, error },
    }));
  };

  const handleInputFocus = () => {
    handleRegistration((prev) => ({
      nickname: { ...prev.nickname, focus: true },
    }));
  };

  const handleInputBlur = () => {
    handleRegistration((prev) => ({
      nickname: { ...prev.nickname, focus: false },
    }));
  };

  const reset = () => {
    handleRegistration(() => ({
      nickname: { value: '', error: false, focus: false },
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    moveNextStep();
  };

  return {
    isValidInput,
    handleInputChange,
    handleInputFocus,
    handleInputBlur,
    reset,
    handleSubmit,
  };
};

export default useInput;
