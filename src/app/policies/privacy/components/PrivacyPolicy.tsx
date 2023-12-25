'use client'
import { Close } from '@/components/common/icons'
import React from 'react'
import { Link } from 'react-scroll'
import { PRIVACY_CONTENT_DATA, PRIVACY_INDEX_DATA } from '@/constants/policy'
import { goBackHandler } from '@/util/common'
const PrivacyPolicy = () => {
  return (
    <div className="flex flex-col items-center w-full pt-[44px]">
      <header className="fixed top-0 bg-white w-full h-[44px] flex items-center justify-center py-[10px] px-[20px] font-semibold">
        <h1>개인정보 처리방침</h1>
        <button className="p-2 absolute right-[18px]" onClick={goBackHandler}>
          <Close />
        </button>
      </header>
      <article className="flex flex-col gap-[24px] p-[20px] w-full">
        <div className="flex flex-col gap-[8px] w-full text-[13px] text-gray-500">
          <p>공고일자 : 2023년 12월 01일</p>
          <p>시행일자 : 2023년 12월 01일</p>
        </div>
        <section className="text-sm text-gray-600">
          <p>목차</p>
          <ol className="w-fit">
            {PRIVACY_INDEX_DATA.map((data, i) => (
              <Link
                className="w-fit cursor-pointer"
                to={String(data.idx)}
                spy={true}
                smooth={true}
                key={data.idx}
              >
                <li style={{ textDecoration: 'underline', cursor: 'pointer' }}>{data.text}</li>
              </Link>
            ))}
          </ol>
        </section>
        <section className="flex flex-col gap-[24px]">
          {PRIVACY_CONTENT_DATA.map((data) => (
            <div className="text-gray-900" key={data.idx} id={String(data.idx)}>
              <h2 className="font-bold mb-[12px]">{data.title}</h2>
              <div className="flex flex-col gap-[20px]">
                {data.content.map((content) => (
                  <p
                    className="text-sm"
                    key={data.idx}
                    dangerouslySetInnerHTML={{ __html: content.text.replace(/\n/g, '<br/>') }}
                  ></p>
                ))}
              </div>
            </div>
          ))}
        </section>
      </article>
    </div>
  )
}

export default PrivacyPolicy
