import React, { useId } from 'react';
import { type ICategoryForm } from '../hooks/useCategoriesFormViewModel';

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
            <div className="flex flex-col gap-2 items-center">
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
        className="hidden peer"
        type="checkbox"
        checked={checked}
        name={name}
        value={value}
        onChange={handleCheckChange}
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
