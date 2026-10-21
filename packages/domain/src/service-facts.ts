/**
 * 서비스 소개 숫자 — web /help·llms.txt 와 소개 페이지(about-us, apps/landing)가 같은 값을 쓴다.
 * 전엔 화면마다 따로 적어 소개 페이지는 「9개 커뮤니티」, /help 는 「13곳」으로 갈렸고 둘 다 실제와 달랐다(2026-10-21).
 *
 * 값은 운영 DB 실측(2026-10-21, 최근 3주): 크롤러 출처 중 커뮤니티(직접 등록·쇼핑몰이 운영하는 게시판 제외)가 14곳,
 * 그 딜이 하루 1,000건 안팎(평일이 많고 주말이 적다). 크롤러를 더하거나 빼면 여기를 고친다 — 쓰는 곳은 모두 따라온다.
 * 이미지에 박힌 숫자는 따라오지 않는다 — 공유 미리보기(web public/opengraph-image.webp·landing opengraph-image.png + alt)와
 * 소개 영상은 다시 굽는다(영상은 vault runbook/landing-about-us-site.md).
 */

/** 모으는 커뮤니티 — 이름이 알려진 순서. 화면엔 앞 몇 개만 보이고 「등」이 붙을 수 있다. */
export const SOURCE_COMMUNITIES = [
  '뽐뿌',
  '에펨코리아',
  '아카라이브',
  '이토랜드',
  '맘이베베',
  '퀘이사존',
  '루리웹',
  '쿨엔조이',
  '어미새',
  '딜바다',
  '다모앙',
  '클리앙',
  '개드립',
  '시티',
] as const;

/** 커뮤니티 밖에서 따로 모으는 쇼핑몰 특가. */
export const SHOPPING_SOURCES = ['토스쇼핑', '네이버쇼핑', '오늘의집'] as const;

/** 「커뮤니티 14곳」의 숫자 부분 — 목록 길이에서 나온다. */
export const COMMUNITY_COUNT = `${SOURCE_COMMUNITIES.length}곳`;

/** 커뮤니티 핫딜 하루 건수 — 「하루 1,000건 안팎」처럼 어림으로 쓴다(요일마다 오르내린다). */
export const DAILY_COMMUNITY_DEALS = '1,000건';

/** 첫 화면 숫자 3개(web /help 첫 화면·소개 페이지 히어로). */
export const SERVICE_STATS = [
  { value: COMMUNITY_COUNT, label: '모아 보는 커뮤니티' },
  { value: DAILY_COMMUNITY_DEALS, label: '하루 커뮤니티 핫딜' },
  { value: '0원', label: '보기·알림 모두 무료' },
] as const;
