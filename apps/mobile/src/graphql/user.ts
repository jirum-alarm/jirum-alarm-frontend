import {graphql} from '../shared/api/gql';

// 로그인 유저 식별용 — GA4 identify(user_id=userId) 에 쓸 id 만 조회.
// web 의 QueryMeDocument(me.id) 와 동일 키로 웹/앱 프로필을 병합한다.
// isGuest: 게스트(로그인 없이 알림만 받는 기기 계정)는 회원으로 치지 않는다(fetchMyId 가 null).
export const QueryMe = graphql(`
  query QueryMe {
    me {
      id
      isGuest
    }
  }
`);
