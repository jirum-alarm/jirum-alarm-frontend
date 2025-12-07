import { Registration } from '@/app/(mobile)/signup/page';

const useInput = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (password: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  const password = registration.password;

  const validate = (value: string) => {
    if (value === '') {
      return { error: false, invalidType: false, invalidLength: false };
    }

    const isAlphabet = /[a-zA-Z]/.test(value);
    const isNumber = /\d/.test(value);
    const isSpecialCharacter = /[!@#$%^&*()_+{}[\]:;<>,.?~\\/-]/.test(value);

    const isValidType = [isAlphabet, isNumber, isSpecialCharacter].filter(Boolean).length >= 2;
    const isValidLength = /^(.{8,30})$/.test(value);

    return {
      error: !isValidType || !isValidLength,
      invalidType: !isValidType,
      invalidLength: !isValidLength,
    };
  };

  const value = password.value;

  const isInvalidType = password.invalidType;
  const isInvalidLength = password.invalidLength;
  const isValidInput = !!(password.value && !password.error);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const error = validate(value);

    if (id === 'password') {
      handleRegistration((prev) => ({
        [id]: { ...prev[id], value, ...error },
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    moveNextStep();
  };

  return {
    value,
    isInvalidType,
    isInvalidLength,
    isValidInput,
    handleInputChange,
    handleSubmit,
  };
};

export default useInput;
