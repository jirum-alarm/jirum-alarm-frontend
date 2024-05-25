import DefaultLayout from '@/components/Layouts/DefaultLayout';
import React from 'react';

const KeywordDetail = () => {
  return (
    <DefaultLayout>
      <div className="text-black">
        <h1 className=" text-3xl text-black">키워드 : 사다</h1>

        <div className=" mt-3">유의어</div>
        <ul className="border border-black">
          <li>샀어요</li>
          <li>샀네요</li>
        </ul>

        <div className=" mt-3">제외 유의어</div>
        <ul className="border border-black">
          <li>안샀어요</li>
        </ul>

        <div className=" mt-3">댓글 목록</div>
        <div className="h-40 w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input">
          덕분에 잘 <span className="bg-green-300">샀어요</span> <br />
          바로 <span className="bg-green-300">샀네요</span>
          <br />
          삿어요
          <br />
          너무 비싸서 <span className="bg-red">안샀어요</span>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default KeywordDetail;
