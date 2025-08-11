'use client';

import { Link } from 'react-scroll';

import { Close } from '@/components/common/icons';
import useGoBack from '@/hooks/useGoBack';
import { cn } from '@/lib/cn';

type TermsIndexData = {
  idx: number;
  text: string;
}[];

type TermsContentData = {
  idx: number;
  title: string;
  content: {
    text: string;
  }[];
}[];

const TermsLayout = ({
  termsIndexData,
  termsContentData,
}: {
  termsIndexData: TermsIndexData;
  termsContentData: TermsContentData;
}) => {
  const goBack = useGoBack();
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center pt-14',
        'mobile-max:before:fixed mobile-max:before:left-1/2 mobile-max:before:top-0 mobile-max:before:-ml-[300px] mobile-max:before:h-full mobile-max:before:w-px mobile-max:before:-translate-x-1/2 mobile-max:before:bg-gray-200',
        'mobile-max:after:fixed mobile-max:after:left-1/2 mobile-max:after:top-0 mobile-max:after:ml-[300px] mobile-max:after:h-full mobile-max:after:w-px mobile-max:after:-translate-x-1/2 mobile-max:after:bg-gray-200',
      )}
    >
      <header className="max-w-mobile-max fixed top-0 z-50 flex h-14 w-full items-center justify-between bg-white px-5 py-2">
        <h1 className="text-lg font-bold text-black">서비스 이용약관</h1>
        <button className="-m-2 flex items-center justify-center p-2" onClick={goBack}>
          <Close />
        </button>
      </header>
      <article className="max-w-mobile-max flex w-full flex-col gap-6 p-5">
        <div className="flex w-full flex-col gap-[8px] text-[13px] text-gray-500">
          <p>공고일자 : 2023년 12월 01일</p>
          <p>시행일자 : 2023년 12월 01일</p>
        </div>
        <section className="text-sm text-gray-600">
          <p>목차</p>
          <ol className="w-fit">
            {termsIndexData.map((data) => (
              <Link
                className="w-fit cursor-pointer"
                to={String(data.idx)}
                spy={true}
                smooth={true}
                key={data.idx}
              >
                <li style={{ textDecoration: 'underline' }}>{data.text}</li>
              </Link>
            ))}
          </ol>
        </section>
        <section className="flex flex-col gap-6">
          {termsContentData.map((data) => (
            <div className="text-gray-900" key={data.idx} id={String(data.idx)}>
              <h2 className="mb-[12px] font-bold">{data.title}</h2>
              <div className="flex flex-col gap-5">
                {data.content.map((content, idx) => (
                  <p
                    className="text-sm"
                    key={idx}
                    dangerouslySetInnerHTML={{
                      __html: content.text.replace(/\n/g, '<br/>'),
                    }}
                  ></p>
                ))}
              </div>
            </div>
          ))}
        </section>
      </article>
    </div>
  );
};

export default TermsLayout;
