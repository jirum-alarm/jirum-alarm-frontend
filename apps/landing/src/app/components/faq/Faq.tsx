import { MAX_EXCLUDE_KEYWORDS } from '@jirum/domain/keyword-options';
import { MAX_KEYWORD_COUNT } from '@jirum/domain/mypage';
import {
  COMMUNITY_COUNT,
  DAILY_COMMUNITY_DEALS,
  SHOPPING_SOURCES,
  SOURCE_COMMUNITIES,
} from '@jirum/domain/service-facts';

import { PAGE } from '@/shared/constants/page';

import Icon from '../icons';
import SectionHeader from '../SectionHeader';

/**
 * 설치 전에 망설이게 하는 질문 — 무엇인지·어디서 모으는지·진짜 싼지·알림 공해·돈·앱 필요 여부.
 * 답의 사실(키워드·제외 단어 상한·야간 시간 — 정본 @jirum/domain, 제휴 링크)은 web /help 자주 묻는 질문과 같다 — 거기가 전체 목록이고,
 * 맨 아래 링크로 보낸다. 접고 펴기는 <details> 라 스크립트가 없어도 된다.
 */
const FAQ = [
  {
    q: '지름알림은 어떤 서비스인가요?',
    a: `커뮤니티 ${COMMUNITY_COUNT}과 쇼핑몰 특가의 핫딜을 한곳에 모아, 이 가격이 진짜 싼지 따져 보고, 원하는 상품이 올라오면 알려주는 무료 서비스예요.`,
  },
  {
    q: '어디에 올라온 핫딜을 모으나요?',
    a: `${SOURCE_COMMUNITIES.join('·')}의 핫딜 게시판을 읽어요. 커뮤니티 핫딜만 하루 ${DAILY_COMMUNITY_DEALS} 안팎이에요. ${SHOPPING_SOURCES.join('·')} 특가도 따로 모아요.`,
  },
  {
    q: '진짜 싼지 어떻게 알려주나요?',
    a: '상품 가격 바로 아래에 같은 상품이 예전에 핫딜로 올라온 가격, 다나와 최저가, 쿠팡의 같은 상품 가격 중 가장 확실한 근거를 보여드려요. 근거가 없으면 싸다고 하지 않아요. 키워드 알림으로 받은 딜에 나중에 확실히 싸다는 근거가 나오면 한 번 더 알려드려요.',
  },
  {
    q: '알림이 너무 많이 오지 않나요?',
    a: `키워드는 ${MAX_KEYWORD_COUNT}개까지, 키워드마다 빼고 싶은 단어 ${MAX_EXCLUDE_KEYWORDS}개와 가격 범위를 정할 수 있어요. 「콜라」에서 「콜라겐」을 빼는 식이에요. 알림 설정에서 「핫딜이 되면만 받기」를 켜면 반응이 뜨거워지거나 확실히 싸다고 확인된 딜만 알려드려요. 밤에 쉬고 싶으면 방해금지 시간을 정해 두세요. 그 사이 알림은 끝나는 시각에 모아서 보내드려요.`,
  },
  {
    q: '이용료가 있나요?',
    a: '보기와 알림 모두 무료예요. 일부 구매 링크는 제휴 링크라 그 링크로 사면 지름알림이 판매처에서 수수료를 받아요. 사는 가격은 똑같아요.',
  },
  {
    q: '앱을 꼭 깔아야 하나요?',
    a: '웹(jirum-alarm.com)에서도 같은 핫딜과 근거를 볼 수 있어요. 알림은 앱 푸시가 가장 확실하게 오고, 핫딜 카톡방에서 좋은 딜을 받아 볼 수도 있어요.',
  },
];

const Faq = () => (
  <section className="flex w-full flex-col items-center bg-gray-50 py-20 lg:py-32">
    <SectionHeader keyword="자주 묻는 질문" title="궁금한 점이 있나요?" />
    <ul className="mt-10 w-full max-w-3xl space-y-3 px-5 lg:mt-14">
      {FAQ.map((f) => (
        <li key={f.q}>
          <details className="group rounded-2xl bg-white">
            <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 font-semibold text-gray-900 lg:px-6 lg:py-5 [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 flex-1 break-keep">{f.q}</span>
              <Icon
                name="plus"
                className="text-secondary-600 size-5 shrink-0 transition-transform group-open:rotate-45"
              />
            </summary>
            <p className="text-15 px-5 pb-5 leading-relaxed break-keep text-gray-600 lg:px-6 lg:pb-6">
              {f.a}
            </p>
          </details>
        </li>
      ))}
    </ul>
    <a
      href={`${PAGE.BASE}/help`}
      className="text-secondary-600 mt-8 text-sm font-semibold underline underline-offset-4"
    >
      사용법·자주 묻는 질문 전체 보기
    </a>
  </section>
);

export default Faq;
