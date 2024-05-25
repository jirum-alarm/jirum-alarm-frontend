'use client';
import Chip from '@/components/Chip';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import React from 'react';

const KeywordPage = () => {
  return (
    <DefaultLayout>
      <div className="rounded-lg bg-white p-5">
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
          키워드 입력
        </label>
        <div className="mb-2 flex gap-2">
          <Chip
            onClick={() => console.log('click')}
            onDelete={() => console.log('delete')}
            closable
          >
            태그
          </Chip>
          <Chip>태그</Chip>
        </div>
        <input
          type="text"
          placeholder="추가할 키워드를 입력해주세요"
          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
        />
      </div>
      <div className="my-6">
        <h1 className="mb-2 text-black">매칭된 댓글 목록 결과</h1>
        <div className="h-40 w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input">
          덕분에 잘 샀어요 <br />
          바로 샀네요 <br />
          삿어요
        </div>
      </div>
      <div>
        <h1 className="text-black">1.부정적인지 긍정적인지 선택</h1>
        <button className="mr-3 inline-flex items-center justify-center bg-black px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
          부정
        </button>
        <button className="inline-flex items-center justify-center bg-black px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
          긍정
        </button>
        <h1 className="text-black">
          2. 대표 키워드를 선택(현재 등록되어 있는 대표 키워드 리스트를 보고 선택) 또는 입력을
          해주세요
        </h1>
        <div>
          <button className="inline-flex items-center justify-center bg-black px-10 py-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
            대표 키워드 선택
          </button>
          <div className="mt-3"></div>
          <input
            type="text"
            placeholder="대표 키워드 입력"
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        <h1 className="text-black">3.추가할 유의어를 등록해주세요</h1>
        <div>
          <input
            type="text"
            placeholder="유의어 제거"
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
        <h1 className="text-black">4.제외할 유의어를 등록해주세요</h1>
        <div>
          <input
            type="text"
            placeholder="유의어 입력"
            className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          />
        </div>
      </div>
    </DefaultLayout>
  );
};

export default KeywordPage;
