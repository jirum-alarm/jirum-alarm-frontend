import { graphql } from 'msw/graphql';

// msw 3 의 GraphQL 핸들러는 엔드포인트(link)에 묶인다. 브라우저는 같은 origin 의 /api/graphql,
// dev:mock 서버(:9090)는 GRAPHQL_ENDPOINT=http://localhost:9090/graphql 로 들어오니 끝이 /graphql 인 주소 전부.
export const api = graphql.link(/\/graphql$/);
