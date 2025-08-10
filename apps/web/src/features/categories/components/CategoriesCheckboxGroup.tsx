import { useId } from 'react';

import { type ICategoryForm } from '../types';

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
              <span className="text-2xl">{category.icon}</span>
              <span className="text-sm text-gray-700">{category.text}</span>
            </div>
          </Checkbox>
        </li>
      ))}
    </ul>
  );
};

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
