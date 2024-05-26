import Card from '@/components/Card';
import DefaultLayout from '@/components/Layouts/DefaultLayout';
import React from 'react';

const KeywordDetail = () => {
  return (
    <DefaultLayout>
      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex w-full justify-between">
            <h2 className=" text-3xl text-black">사다</h2>
            <button className="rounded-lg p-2 text-sm text-sky-700 hover:bg-slate-100">수정</button>
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 block text-xl font-medium text-black dark:text-white">매칭된 결과</h2>
          <div className="h-40 w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input">
            덕분에 잘 <span className="bg-green-300">샀어요</span> <br />
            바로 <span className="bg-green-300">샀네요</span>
            <br />
            삿어요
            <br />
            너무 비싸서 <span className="bg-red">안샀어요</span>
          </div>
        </Card>
        <Card>
          <div className=" mt-3">유의어</div>
          <ul className="border border-black">
            <li>샀어요</li>
            <li>샀네요</li>
          </ul>

          <div className=" mt-3">제외 유의어</div>
          <ul className="border border-black">
            <li>안샀어요</li>
          </ul>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default KeywordDetail;
