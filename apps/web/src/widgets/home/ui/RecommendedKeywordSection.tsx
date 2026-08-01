'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';

import useIsLoggedIn from '@/shared/hooks/useIsLoggedIn';
import useRedirectIfNotLoggedIn from '@/shared/hooks/useRedirectIfNotLoggedIn';
import { useFcmPermission } from '@/shared/lib/firebase/useFcmPermission';
import { useToast } from '@/shared/ui/common/Toast';

import { AuthQueries } from '@/entities/auth';

import { useUpdateKeyword } from '@/features/mypage/model';

/**
 * 홈의 인기 키워드 추천 섹션. `under-10000`(만원이하템) 뒤에 들어간다.
 *
 * 왜 홈인가: 등록 병목은 전환이 아니라 모수다. 검색→등록 전환은 16.6%로 낮지 않은데
 * 30일간 검색한 로그인 유저가 163명뿐이라 신규 등록이 월 90건에서 안 움직인다.
 * 마이페이지 키워드 화면은 이미 등록하러 온 사람만 보므로 모수를 못 늘린다.
 *
 * 왜 이 자리인가: 상위 세 섹션(핫딜·취향저격·만원이하)을 지나 딜을 충분히 둘러본
 * 뒤라 "이런 거 놓치기 싫으면 알림" 제안이 맥락에 맞는다.
 *
 * 게스트 처리: 홈 트래픽 대부분이 비로그인이라 게스트에게도 노출하고, 누르면
 * 로그인으로 보낸다(PostPurchaseKeywordPrompt 와 같은 checkAndRedirect 패턴).
 */

const MAX_CHIPS = 5;

/**
 * GraphQL 에러에서 서버가 준 메시지를 꺼낸다. graphql-request 는 응답 에러를
 * `response.errors[].message` 에 담고, 그 외 예외는 Error.message 에 담는다.
 */
function getErrorMessage(error: unknown): string {
  const gql = error as { response?: { errors?: { message?: string }[] } };
  const fromResponse = gql?.response?.errors?.[0]?.message;
  if (fromResponse) return fromResponse;
  return error instanceof Error ? error.message : '';
}

export default function RecommendedKeywordSection() {
  const { toast } = useToast();
  const { isLoggedIn } = useIsLoggedIn();
  const { checkAndRedirect } = useRedirectIfNotLoggedIn();
  const { requestPermission } = useFcmPermission();

  const { data } = useQuery(AuthQueries.recommendedKeywords());
  // ★enabled: isLoggedIn 이 필수다. notificationKeywordsByMe 는 게스트에게 403 을
  // 주는데, AuthService.getMyKeyword 는 인증 에러를 만나면 redirect(PAGE.LOGIN) 을
  // 호출한다. 홈 트래픽 대부분이 게스트라 이 가드가 없으면 홈에서 로그인으로 튄다.
  // useQuery(useSuspenseQuery 아님) — 홈 렌더를 이 섹션이 붙잡으면 안 된다.
  const { data: keywordData } = useQuery({
    ...AuthQueries.myKeywords({ limit: 20 }),
    enabled: isLoggedIn,
    retry: false,
  });

  const { mutate: addNotificationKeyword, isPending } = useUpdateKeyword({
    onSuccess: () => {
      toast('알림 키워드로 등록했어요.');
      requestPermission();
    },
    onError: (error) => {
      // 서버가 '이미 등록된 키워드', '최대 20개 초과' 같은 구체적 이유를 준다.
      toast(getErrorMessage(error) || '키워드 저장에 실패했습니다.');
    },
  });

  // 이미 등록한 키워드는 뺀다 — 눌러도 '이미 등록됨' 에러만 나기 때문.
  // 서버가 소문자로 저장하므로 비교도 소문자로 맞춘다.
  const registered = new Set(
    keywordData?.notificationKeywordsByMe?.map((item) => item.keyword.toLowerCase()) ?? [],
  );
  const keywords = (data?.recommendedNotificationKeywords ?? [])
    .filter((keyword) => !registered.has(keyword.toLowerCase()))
    .slice(0, MAX_CHIPS);

  // 추천이 없으면 섹션을 통째로 숨긴다. 홈은 딜을 보러 오는 곳이라 빈 박스나
  // 스켈레톤이 오히려 노이즈다 (TossHomeSection 과 같은 판단).
  if (keywords.length === 0) return null;

  const handleSelect = (keyword: string) => {
    if (isPending) return;
    // 게스트면 로그인으로 보낸다. checkAndRedirect 가 true 를 반환하면 이동한 것.
    if (checkAndRedirect()) return;
    addNotificationKeyword({ keyword, fromRecommendation: true });
  };

  return (
    <section
      aria-labelledby="home-recommended-keywords"
      // 위는 흰색(앞 섹션과 이어짐) → 아래로 갈수록 연두. 아래쪽에서 빛이 올라오는 느낌이라
      // 딜 목록 사이에 끼어도 색 블록처럼 튀지 않는다.
      //
      // ★/srgb 를 붙여 보간 공간을 고정한다. Tailwind v4 는 그라데이션을 oklab 으로
      // 보간하는데, 흰색→연두 구간에서 중간톤이 탁한 회색빛으로 뜬다.
      className="bg-linear-to-b/srgb from-white to-[#eaf7d9] px-5 py-7"
    >
      <h2
        id="home-recommended-keywords"
        className="text-center text-[15px] font-semibold text-gray-900"
      >
        인기 키워드로 알림 받아보세요!
      </h2>
      {/* 칩 5개는 데스크톱 layout-max(1240px) 를 못 채워서 그대로 두면 휑하게 흩어진다.
          묶음 자체에 최대 폭을 줘 가운데로 모으고, 모바일에선 2줄로 접히게 둔다. */}
      <ul className="mx-auto mt-4 flex max-w-[32rem] flex-wrap justify-center gap-2">
        {keywords.map((keyword) => (
          <li key={keyword}>
            <motion.button
              type="button"
              disabled={isPending}
              onClick={() => handleSelect(keyword)}
              aria-label={`${keyword} 키워드 알림 등록`}
              // 눌림 인터랙션은 레포 공통값(상품 카드·탭과 동일): scale 0.95 / 0.1s
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.1 }}
              // 칩 자체는 내용에 맞춰 36px 로 두고(그래야 안 붕 뜬다), 터치 타겟 44px 는
              // before 의 투명 영역으로 채운다. 보이는 높이와 누를 수 있는 높이를 분리.
              className="relative flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow-[0_1px_2px_rgba(0,0,0,0.04)] before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] disabled:opacity-50"
            >
              {keyword}
              <span aria-hidden className="text-base leading-none font-normal text-gray-400">
                +
              </span>
            </motion.button>
          </li>
        ))}
      </ul>
    </section>
  );
}
