import { User } from '@/types/user';
import { Registration } from '../../page';
import { BIRTH_YEAR } from '@/constants/birthYear';

const _BIRTH_YEAR = BIRTH_YEAR.map((year) => ({ text: String(year), value: String(year) }));
const birthYearOptions = [{ text: '선택안함', value: null }, ..._BIRTH_YEAR];

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

  const handleSelectChange = (value?: string | null) => {
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
        gender: gender === value ? null : (value as User['gender']),
      },
    }));
  };

  return {
    birthYear,
    gender,
    handleSubmit,
    handleSelectChange,
    handleRadioChange,
    birthYearOptions,
  };
};

export default usePersonalInfoFormViewModel;
