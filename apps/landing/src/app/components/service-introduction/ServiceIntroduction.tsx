import SectionHeader from '../SectionHeader';

import Content from './ContentPage';

const ServiceIntroduction = () => {
  return (
    <section className="flex w-full flex-col items-center justify-center bg-gray-50 pt-20 pb-12 lg:pt-32 lg:pb-24">
      <SectionHeader
        keyword="서비스 소개"
        title={
          <>
            <span>필요한 정보만!</span>
            <br />
            <span>핫딜 쇼핑이 쉬워져요</span>
          </>
        }
        className="pb-4 lg:pb-10"
      />
      <Content>
        <Content.Image src="/assets/images/intro-1.webp" alt="핫딜 카테고리" />
        <Content.Wrapper>
          <Content.Keyword>핫딜 카테고리</Content.Keyword>
          <Content.Title>원하는 상품만 간편하게</Content.Title>
          <Content.Description>
            필요한 핫딜만 딱 골라서!
            <br />
            관심 있는 카테고리만 모아 보세요.
          </Content.Description>
        </Content.Wrapper>
      </Content>
      <Content>
        <Content.Image src="/assets/images/intro-2.webp" alt="키워드 알림" />
        <Content.Wrapper>
          <Content.Keyword>키워드 알림</Content.Keyword>
          <Content.Title>찾던 상품 실시간 알림으로</Content.Title>
          <Content.Description>
            검색없이 키워드를 설정하면
            <br />
            핫딜을 가장 빠르게 만나볼 수 있어요!
          </Content.Description>
        </Content.Wrapper>
      </Content>
      <Content>
        <Content.Image src="/assets/images/intro-3.webp" alt="AI요약" />
        <Content.Wrapper>
          <Content.Keyword>AI요약</Content.Keyword>
          <Content.Title>생생한 반응을 한눈에</Content.Title>
          <Content.Description>
            이 핫딜, 진짜 인기 있는 걸까?
            <br />
            사람들의 반응을 AI 요약으로 한눈에 확인하세요!
          </Content.Description>
        </Content.Wrapper>
      </Content>
      <Content>
        <Content.Image src="/assets/images/intro-4.webp" alt="가격 추이" />
        <Content.Wrapper>
          <Content.Keyword>가격 추이</Content.Keyword>
          <Content.Title>지금 가격, 싼 편일까?</Content.Title>
          {/* 상세의 가격 추이는 "비슷한 상품 핫딜을 모아 참고용" 이다 — 최저가를 단정하지 않는다. */}
          <Content.Description>
            비슷한 상품의 지난 핫딜 가격을 모아
            <br />
            최저가·최고가와 지금 가격을 비교해 드려요.
          </Content.Description>
        </Content.Wrapper>
      </Content>
    </section>
  );
};

export default ServiceIntroduction;
