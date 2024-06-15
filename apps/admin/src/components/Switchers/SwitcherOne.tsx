import { useState } from 'react';

interface Props {
  isEnabled: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Switcher = ({ isEnabled, onChange }: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
  };

  return (
    <div>
      <label htmlFor="toggle1" className="flex cursor-pointer select-none items-center">
        <div className="relative">
          <input
            type="checkbox"
            id="toggle1"
            className="sr-only"
            checked={isEnabled}
            onChange={handleChange}
          />
          <div className="block h-8 w-14 rounded-full bg-meta-9 dark:bg-[#5A616B]"></div>
          <div
            className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition ${
              isEnabled && '!right-1 !translate-x-full !bg-primary dark:!bg-white'
            }`}
          ></div>
        </div>
      </label>
    </div>
  );
};

export default Switcher;
