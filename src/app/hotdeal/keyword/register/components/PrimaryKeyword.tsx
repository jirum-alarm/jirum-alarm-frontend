import Card from '@/components/Card';
import React from 'react';
import RadioButton from './RadioButton';
import { useAddHotDealKeyword } from '@/hooks/graphql/keyword';

const PrimaryKeyword = () => {
  return (
    <Card>
      <h2 className="mb-3 block text-xl font-medium text-black dark:text-white">대표 키워드</h2>
      <div className="flex h-10">
        <button className="inline-flex h-full w-12 items-center justify-center rounded-l-lg bg-black text-center font-medium text-white hover:bg-opacity-90">
          <svg
            viewBox="64 64 896 896"
            focusable="false"
            data-icon="search"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z"></path>
          </svg>
        </button>
        <input
          type="text"
          placeholder="대표 키워드 입력"
          className="h-full w-full rounded-r-lg border-[1.5px] border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
      </div>
      <div>
        <h2 className="mt-4 text-xl text-black">유형</h2>
        <div>
          <RadioButton text="부정" />
          <RadioButton text="긍정" />
        </div>
      </div>
    </Card>
  );
};

export default PrimaryKeyword;
