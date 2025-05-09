import { Registration } from '../../page';

const useInput = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (email: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  const validate = (value: string) => {
    if (value === '') {
      return true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(value);
  };

  const isValidInput = registration.email.value && !registration.email.error;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const error = validate(value) ? false : true;

    if (id === 'email') {
      handleRegistration((prev) => ({ [id]: { ...prev[id], value, error } }));
    }
  };

  const handleInputFocus = () => {
    handleRegistration((prev) => ({
      email: { ...prev['email'], focus: true },
    }));
  };

  const handleInputBlur = () => {
    handleRegistration((prev) => ({
      email: { ...prev['email'], focus: false },
    }));
  };

  const reset = () => {
    handleRegistration(() => ({
      email: { value: '', error: false, focus: false },
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
