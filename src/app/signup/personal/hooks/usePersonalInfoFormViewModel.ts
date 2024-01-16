import { User } from '@/types/user';
import { Registration } from '../../page';

const usePersonalInfoFormViewModel = ({
  registration,
  handleRegistration,
  moveNextStep,
}: {
  registration: Registration;
  handleRegistration: (nickname: (registration: Registration) => Partial<Registration>) => void;
  moveNextStep: () => void;
}) => {
  const { birthYear, gender } = registration.personal;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    moveNextStep();
  };

  const handleSelectChange = (value: string) => {
    handleRegistration((prev) => ({
      personal: {
        ...prev.personal,
        birthYear: value,
      },
    }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget;

    handleRegistration((prev) => ({
      personal: {
        ...prev.personal,
        gender: value as User['gender'],
      },
    }));
  };

  return {
    birthYear,
    gender,
    handleSubmit,
    handleSelectChange,
    handleRadioChange,
  };
};

export default usePersonalInfoFormViewModel;
