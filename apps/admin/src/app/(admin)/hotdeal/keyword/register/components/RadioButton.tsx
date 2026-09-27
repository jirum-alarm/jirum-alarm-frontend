'use client';
import { useState } from 'react';

interface Props {
  text: string;
  value: string;
  id: string;
  name: string;
  checked: boolean;
  onChange: (value: string) => void;
}

const RadioButton = ({ text, value, name, checked, onChange, id }: Props) => {
  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer select-none items-center">
        <div className="relative">
          <input
            type="radio"
            id={id}
            name={name}
            className="sr-only"
            onChange={() => {
              onChange(value);
            }}
          />
          <div
            className={`mr-4 flex h-5 w-5 items-center justify-center rounded-full border ${
              checked && 'border-primary'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full bg-transparent ${checked && '!bg-primary'}`}
            ></span>
          </div>
        </div>
        <span className="text-black">{text}</span>
      </label>
    </div>
  );
};

export default RadioButton;
