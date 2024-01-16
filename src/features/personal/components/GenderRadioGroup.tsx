import { User } from '@/types/user';
import { useId } from 'react';

interface GenderRadioGroupProps {
  handleRadioChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  gender?: User['gender'];
}

const GenderRadioGroup = ({ handleRadioChange, gender }: GenderRadioGroupProps) => {
  return (
    <fieldset>
      <legend className="text-sm text-gray-500">성별</legend>
      <div className="h-4" />
      <ul className="grid grid-cols-2 gap-2">
        <li>
          <Radio
            name="gender"
            value="FEMALE"
            checked={'FEMALE' === gender}
            handleRadioChange={handleRadioChange}
          >
            <div className="flex flex-col gap-2">
              <span className="text-2xl">👩</span>
              <span className="text-sm text-gray-700">여자</span>
            </div>
          </Radio>
        </li>
        <li>
          <Radio
            name="gender"
            value="MALE"
            checked={'MALE' === gender}
            handleRadioChange={handleRadioChange}
          >
            <div className="flex flex-col gap-2">
              <span className="text-2xl">👨</span>
              <span className="text-sm text-gray-700">남자</span>
            </div>
          </Radio>
        </li>
      </ul>
    </fieldset>
  );
};

export default GenderRadioGroup;

const Radio = ({
  value,
  name,
  checked,
  handleRadioChange,
  children,
}: {
  value: User['gender'];
  name: string;
  checked: boolean;
  children: React.ReactNode;
  handleRadioChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const id = useId();
  return (
    <>
      <input
        id={`${name}-${id}`}
        className="hidden peer"
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={handleRadioChange}
      />
      <label
        htmlFor={`${name}-${id}`}
        className="w-full inline-flex items-center justify-center border border-gray-300 h-[88px] rounded-lg peer-checked:border-primary-500 peer-checked:bg-primary-50"
      >
        {children}
      </label>
    </>
  );
};
