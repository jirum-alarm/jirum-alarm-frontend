'use client';

import { Link } from 'react-scroll';

import { Close } from '@/components/common/icons';
import { TERMS_CONTENT_DATA, TERMS_INDEX_DATA } from '@/constants/policy';
import useGoBack from '@/hooks/useGoBack';

const TermsOfUse = () => {
  const goBack = useGoBack();
  return (
    <div className="flex w-full flex-col items-center pt-[56px]">
      <header className="fixed top-0 z-50 flex h-[56px] w-full max-w-screen-layout-max items-center justify-between bg-white px-5 py-2">
        <h1 className="text-lg font-bold text-black">서비스 이용약관</h1>
        <button className="-m-2 flex items-center justify-center p-2" onClick={goBack}>
          <Close />
        </button>
      </header>
      <article className="flex w-full flex-col gap-[24px] p-[20px]">
        <div className="flex w-full flex-col gap-[8px] text-[13px] text-gray-500">
          <p>공고일자 : 2023년 12월 01일</p>
          <p>시행일자 : 2023년 12월 01일</p>
        </div>
        <section className="text-sm text-gray-600">
          <p>목차</p>
          <ol className="w-fit">
            {TERMS_INDEX_DATA.map((data) => (
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
        <section className="flex flex-col gap-[24px]">
          {TERMS_CONTENT_DATA.map((data) => (
            <div className="text-gray-900" key={data.idx} id={String(data.idx)}>
              <h2 className="mb-[12px] font-bold">{data.title}</h2>
              <div className="flex flex-col gap-[20px]">
                {data.content.map((content) => (
                  <p
                    className="text-sm"
                    key={data.idx}
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

export default TermsOfUse;
