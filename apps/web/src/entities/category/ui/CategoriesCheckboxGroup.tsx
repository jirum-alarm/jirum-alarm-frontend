import { useId } from 'react';

import { CATEGORIES } from '@/shared/config/categories';

import { type ICategoryForm } from '../model/types';

/**
 * value → 카테고리 아이콘. `ICategoryForm` 은 아이콘 컴포넌트를 들고 있지 않고
 * (가입 흐름도 같은 타입을 쓴다) config 가 정본이라 여기서 번호로 찾는다.
 * 앱(`NoImage.CATEGORY_ICON`)도 같은 방식이다 — 번호가 어긋나면 엉뚱한 그림이 뜬다.
 */
const ICON_BY_VALUE = new Map<number, (typeof CATEGORIES)[number]['iconComponent']>(
  CATEGORIES.map((c) => [c.value, c.iconComponent]),
);

interface CategoriesCheckboxGroupProps {
  handleCheckChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  categories: ICategoryForm[];
}
const CategoriesCheckboxGroup = ({
  handleCheckChange,
  categories,
}: CategoriesCheckboxGroupProps) => {
  return (
    <ul className="grid grid-cols-3 gap-[10px]">
      {categories.map((category) => (
        <li key={category.text}>
          <Checkbox
            value={category.value}
            name="category"
            checked={category.isChecked}
            handleCheckChange={handleCheckChange}
          >
            <div className="flex flex-col items-center gap-2">
              {/* 이모지 대신 config 가 이미 들고 있는 카테고리 아이콘을 쓴다.
                  이모지는 OS·폰트마다 모양이 달라지고 나머지 라인 아이콘과
                  섞였다(특히 상품권=💵, 기타=🔍 는 뜻이 어긋난다).
                  선택 상태는 기존대로 테두리·배경으로만 가른다. */}
              <CategoryIcon value={category.value} />
              <span className="text-sm text-gray-700">{category.text}</span>
            </div>
          </Checkbox>
        </li>
      ))}
    </ul>
  );
};

function CategoryIcon({ value }: { value: number }) {
  const Icon = ICON_BY_VALUE.get(value);
  return Icon ? <Icon width={32} height={32} /> : null;
}

export default CategoriesCheckboxGroup;

const Checkbox = ({
  value,
  name,
  checked,
  handleCheckChange,
  children,
}: {
  value: number;
  name: string;
  checked: boolean;
  children: React.ReactNode;
  handleCheckChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const id = useId();
  return (
    <>
      <input
        id={`${name}-${id}`}
        className="peer hidden"
        type="checkbox"
        checked={checked}
        name={name}
        value={value}
        onChange={handleCheckChange}
      />
      <label
        htmlFor={`${name}-${id}`}
        className="peer-checked:border-primary-500 peer-checked:bg-primary-50 mouse-hover:hover:border-primary-500 inline-flex h-22 w-full cursor-pointer items-center justify-center rounded-lg border border-gray-300"
      >
        {children}
      </label>
    </>
  );
};
