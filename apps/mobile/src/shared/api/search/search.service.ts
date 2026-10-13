import {
  QueryKeywordHubs,
  QuerySearchProducts,
  QuerySearchSuggestions,
} from '@/graphql/search';
import {HttpClient} from '@/shared/lib/client';
import type {
  SearchProductsQueryVariables,
  SearchSuggestionsQueryVariables,
} from '@/shared/api/gql/graphql.ts';

/**
 * 검색 데이터 접근. web: widgets/search 가 쓰는 두 경로를 합친 것
 * (`ProductService.getProducts` + `SearchService.getSuggestions`).
 *
 * 목록은 access token 을 실어 보낸다 — 서버가 응답을 바꾸지 않더라도 조회
 * 기록이 랭킹 신호에 정확하게 남는다(HomeService 와 같은 판단).
 * 제안어는 개인화가 없어 무인증으로 보낸다(web 도 토큰을 안 붙인다).
 */
export class SearchService {
  static async getProducts(variables: SearchProductsQueryVariables) {
    const res = await HttpClient.withAccessToken().execute(
      QuerySearchProducts,
      variables,
    );
    return res.data?.products ?? [];
  }

  static async getSuggestions(variables: SearchSuggestionsQueryVariables) {
    const res = await HttpClient.withNoAuth().execute(
      QuerySearchSuggestions,
      variables,
    );
    return res.data?.searchSuggestions ?? [];
  }

  /** 공개 키워드 허브 목록. 개인화가 없어 무인증. 실패하면 요약 줄만 안 뜬다. */
  static async getKeywordHubs() {
    const res = await HttpClient.withNoAuth().execute(QueryKeywordHubs);
    return res.data?.keywordHubs ?? [];
  }
}
