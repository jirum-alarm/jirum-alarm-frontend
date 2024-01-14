import { Registration } from '../../page';

const MIN_NICKNAME_LENGTH = 5;
const MAX_NICKNAME_LENGTH = 20;

type NicknameValue = Registration['nickname']['value'];

const useInput = ({
  registration,
  handleRegistration,
  completeRegistration,
}: {
  registration: Registration;
  handleRegistration: (nickname: (registration: Registration) => Partial<Registration>) => void;
  completeRegistration: () => void;
}) => {
  const validate = (value: NicknameValue) => {
    const isValidLength =
      value.length >= MIN_NICKNAME_LENGTH && value.length <= MAX_NICKNAME_LENGTH;
    const isValidNoBlank = !value.includes(' ');

    return isValidLength && isValidNoBlank;
  };

  const isValidInput = !!(registration.nickname.value && !registration.nickname.error);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const error = validate(value) ? false : true;

    handleRegistration((prev) => ({ nickname: { ...prev.nickname, value, error } }));
  };

  const handleInputFocus = () => {
    handleRegistration((prev) => ({ nickname: { ...prev.nickname, focus: true } }));
  };

  const handleInputBlur = () => {
    handleRegistration((prev) => ({ nickname: { ...prev.nickname, focus: false } }));
  };

  const reset = () => {
    handleRegistration(() => ({ nickname: { value: '', error: false, focus: false } }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    completeRegistration();
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
