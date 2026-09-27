import { useTransition } from 'react';
import { useInView } from 'react-intersection-observer';

type Row = { searchAfter?: ReadonlyArray<string> | null };

type FetchMore<TData> = (options: {
  variables: { searchAfter: string[] };
  updateQuery: (prev: TData, result: { fetchMoreResult: TData }) => TData;
}) => unknown;

/**
 * searchAfter 커서 목록의 무한 스크롤. 리스트 끝의 ref 가 보이면 다음 페이지를 가져와 field 에 이어붙인다.
 * 목록 화면 6곳에 손으로 반복되던 것 — 로딩 중·빈 목록·마지막 페이지 가드가 곳마다 달랐다.
 * 나머지 변수(키워드·필터)는 원 쿼리 것이 fetchMore 에 병합된다.
 */
export const useLoadMoreOnView = <TData, K extends keyof TData>({
  field,
  data,
  loading,
  fetchMore,
}: {
  field: K;
  data: TData | undefined;
  loading: boolean;
  fetchMore: FetchMore<TData>;
}) => {
  const [, startTransition] = useTransition();
  const { ref } = useInView({
    threshold: 0,
    onChange: (inView) => {
      const rows = data?.[field] as Row[] | undefined;
      const searchAfter = rows?.at(-1)?.searchAfter;
      if (!inView || loading || !searchAfter) return;
      startTransition(() => {
        fetchMore({
          variables: { searchAfter: [...searchAfter] },
          updateQuery: (prev, { fetchMoreResult }) =>
            fetchMoreResult
              ? {
                  ...prev,
                  [field]: [...(prev[field] as Row[]), ...(fetchMoreResult[field] as Row[])],
                }
              : prev,
        });
      });
    },
  });
  return ref;
};
