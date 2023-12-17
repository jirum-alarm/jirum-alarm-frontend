'use client'
import { Close } from '@/components/common/icons'
import React from 'react'
import { Link } from 'react-scroll'
import { PRIVACY_CONTENT_DATA, PRIVACY_INDEX_DATA } from '@/constants/policy'
import { nanoid } from 'nanoid'
import * as S from '../../styles/Policy.styled'
import { goBackHandler } from '@/util/common'
const PrivacyPolicy = () => {
  return (
    <S.PolicyWrapper>
      <S.PolicyHeader>
        <h1>개인정보 처리방침</h1>
        <S.CloseBtn onClick={goBackHandler}>
          <Close />
        </S.CloseBtn>
      </S.PolicyHeader>
      <S.PolicyBody>
        <S.PolicyDate>
          <p>공고일자 : 2023년 12월 01일</p>
          <p>시행일자 : 2023년 12월 01일</p>
        </S.PolicyDate>
        <S.PolicyIndex>
          <p>목차</p>
          <ol>
            {PRIVACY_INDEX_DATA.map((data) => (
              <Link to={String(data.idx)} spy={true} smooth={true} key={nanoid()}>
                <li style={{ textDecoration: 'underline', cursor: 'pointer' }}>{data.text}</li>
              </Link>
            ))}
          </ol>
        </S.PolicyIndex>
        <S.PolicyContent>
          {PRIVACY_CONTENT_DATA.map((data) => (
            <S.PolicyContentItem key={nanoid()} id={String(data.idx)}>
              <h2>{data.title}</h2>
              <div>
                {data.content.map((content) => (
                  <p
                    key={nanoid()}
                    dangerouslySetInnerHTML={{ __html: content.text.replace(/\n/g, '<br/>') }}
                  ></p>
                ))}
              </div>
            </S.PolicyContentItem>
          ))}
        </S.PolicyContent>
      </S.PolicyBody>
    </S.PolicyWrapper>
  )
}

export default PrivacyPolicy
