import {useMemo} from 'react';
import {StackActions} from '@react-navigation/native';
import {useQuery, type QueryClient} from '@tanstack/react-query';

import {MyPageQueries} from '@/entities/mypage';
import {ProductQueries} from '@/entities/product/product.queries';
import {navigationRef} from '@/navigations/navigation-ref';
import {tabStackNavigations} from '@/shared/constant/navigations';

/**
 * 내 키워드는 캐시가 **두 벌**이다 — 키워드 화면(mypage·keywords)과 상세 권유(user·notificationKeywords).
 * 한쪽에서 등록·삭제하고 한쪽만 무효화하면, 홈 추천 칩으로 등록한 키워드가 키워드 화면에
 * 안 보이는 식으로 어긋난다(추천 칩은 아무것도 무효화하지 않았다). 등록·삭제는 전부 이걸로.
 */
export const invalidateMyKeywords = (queryClient: QueryClient) =>
  Promise.all([
    queryClient.invalidateQueries({queryKey: MyPageQueries.keys.keywords()}),
    queryClient.invalidateQueries({queryKey: ProductQueries.keys.myKeywords()}),
  ]);

/** 서버는 소문자로 저장한다 — 비교도 소문자·앞뒤 공백 없이. */
export const normalizeKeyword = (keyword: string) =>
  keyword.trim().toLowerCase();

/**
 * 알림의 keyword 칸에서 그걸 보낸 **내 키워드**(정규화)를 찾는다. 없으면 undefined.
 * 칸은 키워드 그대로("햇반")이거나 가격 하락 문구("햇반 평소보다 54% 싸게 떴어요 📉")이고,
 * 관심사 알림은 묶음 제목("🥤 [생수·음료 쟁이기] 펩시 핫딜")이라 안 맞는다(2026-10-07 운영 실측).
 * 키워드에 공백이 있을 수 있어("에어팟 프로") 첫 낱말이 아니라 "내 키워드 + 공백" 접두로 보고, 가장 긴 것을 고른다.
 */
export function matchMyKeyword(
  notificationKeyword: string | null | undefined,
  mine: Set<string>,
): string | undefined {
  const k = normalizeKeyword(notificationKeyword ?? '');
  let best: string | undefined;
  for (const m of mine) {
    if ((k === m || k.startsWith(`${m} `)) && m.length > (best?.length ?? 0)) {
      best = m;
    }
  }
  return best;
}

/**
 * 이미 등록한 키워드 집합(정규화). 추천 칩·검색 알림이 "등록됨" 을 미리 보여주는 데 쓴다.
 * 메모한다 — 알림 목록 renderItem 의 의존성이라, 매 렌더 새 Set 이면 행 memo 가 무력해진다.
 */
export function useMyKeywordSet(): Set<string> {
  const {data} = useQuery(MyPageQueries.keywords());
  return useMemo(
    () => new Set((data ?? []).map(k => normalizeKeyword(k.keyword))),
    [data],
  );
}

/**
 * 키워드 알림 화면으로. 등록 성공 토스트의 "보기" 가 쓴다 — 등록한 뒤 갈 곳이 없던 자리에서
 * 조건(제외 단어·가격)을 바로 손볼 수 있게 잇는다.
 * ref 로 보내는 이유: 토스트는 화면이 사라진 뒤에도 눌릴 수 있고, 훅(useNavigation)을 쓰면
 * 네비게이터 밖에서 렌더되는 테스트·화면이 죽는다. 화면은 루트 스택이라 push 가 부모로 올라간다.
 */
export function openKeywordSettings() {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(StackActions.push(tabStackNavigations.MYPAGE_KEYWORD));
}
