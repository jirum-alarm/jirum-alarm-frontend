import { useId } from 'react';

import { Gender } from '@/shared/api/gql/graphql';

interface GenderRadioGroupProps {
  handleRadioChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  gender?: Gender | null;
}

/**
 * 성별 선택. 이모지(👩/👨)를 쓰는 건 의도다 — 카테고리와 달리 대응하는 라인
 * 아이콘이 디자인 시스템에 없다. 앱(`features/mypage/ui/GenderRadioGroup`)도
 * 같은 이모지를 쓴다(표기가 갈리면 유저는 버그로 읽는다).
 */
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
            <div className="flex flex-col items-center gap-2">
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
            <div className="flex flex-col items-center gap-2">
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
