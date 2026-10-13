import { SERVICE_TAG } from './beauty';

/** web shared/config/gtm.ts 와 같은 컨테이너 — 이벤트 이름·태그를 같이 쓴다. */
export const GTM_ID = 'GTM-NHQWS9LL';

/**
 * <head> 인라인 — 운영 도메인에서만 dataLayer 를 만들고 서비스 구분값을 **gtm.js 이벤트보다 먼저** 넣는다.
 * GA4 구성 태그가 페이지뷰를 쏠 때 이 값이 dataLayer 에 이미 있어야 데이터 영역 변수(service·content_group)로 읽힌다.
 * 그 변수를 GA4 파라미터로 매핑하는 건 GTM 쪽 일 — 매핑 전에도 페이지 경로(/beauty/…)로는 갈라 볼 수 있다.
 * 컨테이너 스크립트(gtm.js)는 load 이후 GtmLoader 가 붙인다(web 과 같은 lazyOnload).
 */
export const GTM_BOOTSTRAP_SCRIPT = `(function(){if(location.hostname!=='jirum-alarm.com')return;var d=window.dataLayer=window.dataLayer||[];d.push({service:'${SERVICE_TAG}',content_group:'${SERVICE_TAG}'});d.push({'gtm.start':Date.now(),event:'gtm.js'});})();`;
