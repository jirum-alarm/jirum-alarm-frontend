import {
  COMMUNITY_COUNT,
  DAILY_COMMUNITY_DEALS,
  SHOPPING_SOURCES,
  SOURCE_COMMUNITIES,
} from '@jirum/domain/service-facts';

import { cn } from '@/shared/libs/cn';

import Icon, { type IconName } from '../icons';
import SectionHeader from '../SectionHeader';

/**
 * 하는 일 세 가지 — 카드마다 말 한 줄 + 실제 화면 조각 하나(말보다 실물). web /help 「핵심 개념」과 같은 세 가지다.
 * 가운데(진짜 싼지)만 짙은 카드 — 다른 핫딜 모음과 갈리는 지점이라 눈이 먼저 가게 한다.
 * 화면 조각의 숫자는 예시다(web /help 근거 예시와 같은 값).
 */

const SHOWN_COMMUNITIES = 6;

const Card = ({
  step,
  icon,
  iconTone,
  title,
  text,
  dark,
  children,
}: {
  step: string;
  icon: IconName;
  iconTone: string;
  title: string;
  text: string;
  dark?: boolean;
  children: React.ReactNode;
}) => (
  <li
    className={cn(
      'relative flex flex-col overflow-hidden rounded-3xl p-6 break-keep lg:p-8',
      dark ? 'bg-fixed-900' : 'bg-gray-50',
    )}
  >
    <span
      aria-hidden
      className={cn(
        'absolute top-4 right-6 text-[56px] leading-none font-bold',
        dark ? 'text-fixed-800' : 'text-gray-200',
      )}
    >
      {step}
    </span>
    <span className={cn('relative flex size-10 items-center justify-center rounded-xl', iconTone)}>
      <Icon name={icon} className="size-5" />
    </span>
    <h3
      className={cn('relative mt-5 text-xl font-bold', dark ? 'text-fixed-white' : 'text-gray-900')}
    >
      {title}
    </h3>
    <p
      className={cn(
        'text-15 relative mt-2 leading-relaxed',
        dark ? 'text-fixed-300' : 'text-gray-600',
      )}
    >
      {text}
    </p>
    <div className="relative mt-6 lg:mt-auto lg:pt-6">{children}</div>
  </li>
);

const Concepts = () => (
  <section className="flex w-full flex-col items-center bg-white py-20 lg:py-32">
    <SectionHeader
      keyword="지름알림이 하는 일"
      title={
        <>
          모으고, 따지고,
          <br className="md:hidden" /> 알려드려요
        </>
      }
      sub="핫딜을 찾아다니고 가격을 비교하는 일을 대신해요"
    />
    <ul className="mt-12 grid w-full max-w-6xl gap-4 px-5 md:grid-cols-3 lg:mt-16 lg:gap-6 lg:px-8">
      <Card
        step="01"
        icon="layers"
        iconTone="bg-secondary-50 text-secondary-600"
        title="흩어진 핫딜을 한곳에"
        text={`커뮤니티 ${COMMUNITY_COUNT}에 하루 ${DAILY_COMMUNITY_DEALS} 안팎 올라오는 핫딜을 모아요. ${SHOPPING_SOURCES.join('·')} 특가도 함께요.`}
      >
        <ul className="flex flex-wrap gap-1.5">
          {SOURCE_COMMUNITIES.slice(0, SHOWN_COMMUNITIES).map((name) => (
            <li
              key={name}
              className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-700"
            >
              {name}
            </li>
          ))}
          <li className="bg-secondary-50 text-secondary-600 rounded-full px-3 py-1 text-xs font-semibold">
            +{SOURCE_COMMUNITIES.length - SHOWN_COMMUNITIES}곳
          </li>
        </ul>
      </Card>

      <Card
        step="02"
        icon="tag"
        iconTone="bg-error-500 text-fixed-white"
        title="진짜 싼지 근거부터"
        text="같은 상품이 예전에 핫딜로 올라온 가격, 다나와 최저가, 쿠팡의 같은 상품 가격과 비교해요. 근거가 없으면 억지로 싸다고 하지 않아요."
        dark
      >
        <div className="rounded-2xl bg-white p-4">
          <p className="text-xs text-gray-500">제주 삼다수 2L 24병</p>
          <p className="mt-0.5 text-lg font-bold text-gray-900">
            <span className="text-error-600 mr-1.5">19%</span>12,900원
          </p>
          <div className="mt-2.5 rounded-xl bg-gray-50 px-3 py-2.5">
            <p className="text-sm font-semibold text-gray-900">
              보통가보다 <b className="text-error-600 font-bold">3,100원</b> 싸요
            </p>
            <p className="mt-0.5 text-xs text-gray-500">지난 1년 핫딜 14건 중 85%보다 싸요</p>
          </div>
        </div>
      </Card>

      <Card
        step="03"
        icon="bell"
        iconTone="bg-primary-500 text-fixed-900"
        title="원하는 상품만 알림"
        text={`키워드 하나로 커뮤니티 ${COMMUNITY_COUNT}을 지켜봐요. 제외 단어와 가격 범위를 정해 필요 없는 알림은 걸러요.`}
      >
        <div className="rounded-2xl bg-white p-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="bg-primary-500 text-fixed-900 rounded-full px-3 py-1 text-xs font-semibold">
              콜라
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 line-through">
              콜라겐
            </span>
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              2만 원 이하
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2.5 border-t border-gray-100 pt-3">
            <span className="bg-primary-100 text-primary-800 flex size-8 shrink-0 items-center justify-center rounded-lg">
              <Icon name="bell" className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-gray-900">콜라 키워드 알림 💌</p>
              <p className="truncate text-xs text-gray-500">코카콜라 제로 355ml 24캔 15,900원</p>
            </div>
          </div>
        </div>
      </Card>
    </ul>
  </section>
);

export default Concepts;
