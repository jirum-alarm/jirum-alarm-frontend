import SectionHeader from '../SectionHeader';

import Content from './ContentPage';

const ServiceIntroduction = () => {
  return (
    <section className="flex w-full flex-col items-center justify-center bg-gray-50">
      <SectionHeader
        keyword="서비스 소개"
        title={
          <>
            <span>필요한 정보만!</span>
            <br />
            <span>핫딜 쇼핑이 쉬워져요</span>
          </>
        }
        className="z-5 bg-gray-50 pt-10 pb-8 lg:pt-22 lg:pb-7"
        sticky
      />
      <Content>
        <Content.Image src="/assets/images/intro-1.png" alt="핫딜 카테고리" />
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
        <Content.Image src="/assets/images/intro-2.png" alt="키워드 알림" />
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
        <Content.Image src="/assets/images/intro-3.png" alt="AI요약" />
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
      <Content
        isLast
        className="relative z-1 before:absolute before:bottom-0 before:z-6 before:h-1/2 before:w-full before:bg-gray-50 before:content-['']"
      >
        <Content.Image src="/assets/images/intro-4.png" alt="최저가" />
        <Content.Wrapper>
          <Content.Keyword>최저가</Content.Keyword>
          <Content.Title>여기가 제일 저렴해요</Content.Title>
          <Content.Description>
            어디서 사야 가장 저렴할까? 고민할 필요 없어요.
            <br />
            할인 지수로 최저가를 확인해보세요.
          </Content.Description>
        </Content.Wrapper>
      </Content>
    </section>
  );
};

export default ServiceIntroduction;
