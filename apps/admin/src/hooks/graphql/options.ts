import type { OperationVariables } from '@apollo/client';
import type { useQuery } from '@apollo/client/react';

/**
 * 래퍼 훅이 받는 useQuery 옵션(Apollo 3 의 QueryHookOptions 자리).
 * - returnPartialData 제외: Apollo 4 는 이 옵션이 켜질 수 있으면 data 를 DeepPartial 로 좁힌다 — 여기 훅들은 부분 데이터를 쓰지 않는다.
 * - variables 선택: 훅이 기본 variables 를 채우므로 호출부는 skip 같은 옵션만 넘겨도 된다.
 */
export type QueryOptions<
  TData = unknown,
  TVariables extends OperationVariables = OperationVariables,
> = Omit<useQuery.Options<TData, TVariables>, 'returnPartialData' | 'variables'> & {
  variables?: TVariables;
};

/**
 * Apollo 4 의 useLazyQuery execute 는 GraphQL 에러·같은 쿼리 재실행(AbortError)에 reject 한다(3 은 resolve).
 * 에러는 에러 링크 배너와 결과의 error 로 이미 보이니, 결과를 기다리지 않는 호출부는 이것으로 받아 unhandled rejection 을 막는다.
 */
export const ignoreLazyRejection = () => {};
