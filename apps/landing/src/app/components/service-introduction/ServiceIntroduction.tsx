import Content from './ContentWrapper';
import IntroductionHeader from './IntroductionHeader';

const ServiceIntroduction = () => {
  return (
    <>
      <IntroductionHeader />
      <Content>
        <Content.Image src="/images/intro-1.png" alt="핫딜 카테고리" />
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
        <Content.Image src="/images/intro-2.png" alt="키워드 알림" />
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
        <Content.Image src="/images/intro-3.png" alt="AI요약" />
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
        <Content.Image src="/images/intro-4.png" alt="최저가" />
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
    </>
  );
};

export default ServiceIntroduction;
