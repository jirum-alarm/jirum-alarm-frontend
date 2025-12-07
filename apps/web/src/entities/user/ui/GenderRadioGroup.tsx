import { useId } from 'react';

import { Gender } from '@/shared/api/gql/graphql';

interface GenderRadioGroupProps {
  handleRadioChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  gender?: Gender | null;
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
            value={Gender.Female}
            checked={gender === Gender.Female}
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
            value={Gender.Male}
            checked={gender === Gender.Male}
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
  value: Gender;
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
        className="peer hidden"
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={handleRadioChange}
      />
      <label
        htmlFor={`${name}-${id}`}
        className="peer-checked:border-primary-500 peer-checked:bg-primary-50 inline-flex h-22 w-full cursor-pointer items-center justify-center rounded-lg border border-gray-300"
      >
        {children}
      </label>
    </>
  );
};
