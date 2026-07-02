import {graphql} from '../shared/api/gql';

// 로그인 유저 식별용 — Mixpanel identify(distinct_id=userId) 에 쓸 id 만 조회.
// web 의 QueryMeDocument(me.id) 와 동일 키로 웹/앱 프로필을 병합한다.
export const QueryMe = graphql(`
  query QueryMe {
    me {
      id
    }
  }
`);
