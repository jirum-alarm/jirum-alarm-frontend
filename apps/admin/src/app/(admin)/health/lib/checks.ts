import { getHealthLevel } from '@/app/(admin)/crawling/components/ProviderHealthGrid';
import { ProfitLinkProviderHealthQuery } from '@/generated/gql/graphql';
import { shortWon } from '@/lib/format';
import { sourceName } from '@/lib/labels';
import { ProviderHealthOutput } from '@/types/stats';

/**
 * 서비스 점검표 — 기능마다 「지금 상태 / 깨지면 보이는 것 / 확인 / 고치기」.
 * 화면이 읽을 신호가 있는 항목은 상태를 계산하고, 없는 항목은 'manual'(직접 확인)로 둔다.
 * ⚠️ 이 레포는 공개라 내부 IP·명령은 적지 않는다 — 명령이 필요한 절차는 jirum vault 런북 경로로 보낸다.
 */
export type Level = 'danger' | 'warn' | 'ok' | 'manual';

export type Check = {
  id: string;
  title: string;
  /** undefined = 아직 불러오는 중 */
  level: Level | undefined;
  /** 지금 값 한 줄 */
  now?: string;
  symptom: string;
  check: string[];
  fix: string[];
  href?: string;
};

export type Section = { title: string; why: string; checks: Check[] };

type ProviderRow = ProfitLinkProviderHealthQuery['profitLinkProviderHealth'][number];

export type Signals = {
  toss?: boolean;
  naverBc?: boolean;
  ohou?: boolean;
  kakao?: boolean;
  profit?: ProviderRow[];
  queue?: { eligibleNow: number; parked: number };
  /** 그저께까지 7일 수익(세후). 어제·오늘은 집계 중이라 뺀다 */
  revenue7d?: number;
  community?: ProviderHealthOutput[];
  mall?: ProviderHealthOutput[];
  danawa?: ProviderHealthOutput[];
  thumbnail?: { total: number; missing: number };
  /** null = 검색 쿼리 에러 */
  searchHits?: number | null;
  pendingMatches?: number;
  /** serviceHealthSignals — undefined = 불러오는 중 */
  backend?: {
    /** null = matching-api 응답 없음 */
    coverage: { products: number; mapped: number; verified: number; verdict: string } | null;
    llmMinutesSinceLastDone: number | null;
    llmReadyPending: number;
    llmFailed24h: number;
    pushMinutesSinceLast: number | null;
  };
};

/** 발급 헬스 일일 리포트(EXPECTED_PROVIDERS)와 같은 목록 — 24시간 0건이면 사고 */
const ISSUING_PROVIDERS = ['toss', 'adpick', 'link_price', 'naver', 'ali_express', 'coupang'];

const sessionLevel = (has: boolean | undefined, missing: Level): Level | undefined =>
  has === undefined ? undefined : has ? 'ok' : missing;

const hoursAgo = (minutes?: number | null) =>
  minutes == null ? '7일+' : minutes < 60 ? `${minutes}분` : `${Math.floor(minutes / 60)}시간`;

/**
 * 스토어 피드·다나와는 주기가 3~48시간이라 커뮤니티(90분) 기준을 쓰면 늘 빨갛다.
 * 7일 무수집(null)은 일시정지된 피드(오늘의집 등)라 색을 칠하지 않고 이름만 알린다.
 */
const feedLevel = (
  rows: ProviderHealthOutput[] | undefined,
  warnMin: number,
  dangerMin: number,
): Pick<Check, 'level' | 'now'> => {
  if (!rows) return { level: undefined };
  if (rows.length === 0) return { level: 'manual', now: '집계 대상 없음' };
  const live = rows.filter((r) => r.minutesSinceLatest != null);
  const late = live.filter((r) => (r.minutesSinceLatest ?? 0) >= warnMin);
  const level: Level = late.some((r) => (r.minutesSinceLatest ?? 0) >= dangerMin)
    ? 'danger'
    : late.length > 0
      ? 'warn'
      : 'ok';
  const stopped = rows.filter((r) => r.minutesSinceLatest == null).map((r) => r.providerName);
  const parts = [
    late.length > 0
      ? `늦음: ${late.map((r) => `${r.providerName} ${hoursAgo(r.minutesSinceLatest)}`).join(', ')}`
      : `${live.length}곳 정상`,
    stopped.length > 0 && `7일 무수집(일시정지?): ${stopped.join(', ')}`,
  ].filter(Boolean);
  return { level, now: parts.join(' · ') };
};

const coverageCheck = (b: Signals['backend']): Pick<Check, 'level' | 'now'> => {
  if (!b) return { level: undefined };
  const c = b.coverage;
  if (!c) return { level: 'danger', now: 'matching-api 응답 없음' };
  const pct = c.products > 0 ? Math.round((c.mapped / c.products) * 100) : 0;
  const now = `수집 2~3일 전 게이트 카테고리 ${c.mapped}/${c.products}건 매핑(${pct}%) · 노출 ${c.verified}건`;
  // 판정은 서버(감시 배치와 같은 judgeCoverage) — 여기서 다시 계산하지 않는다
  if (c.verdict === 'low') return { level: 'danger', now: `${now} — 60% 미만` };
  if (c.verdict === 'too_few') return { level: 'ok', now: `${now} (표본 적어 판정 생략)` };
  return { level: 'ok', now };
};

/** 일괄 작업으로 대기가 수만 건 쌓이는 건 정상(10/9 토스 가이드 5.7만) — 생존은 「마지막 처리」로 본다 */
const llmCheck = (b: Signals['backend']): Pick<Check, 'level' | 'now'> => {
  if (!b) return { level: undefined };
  const m = b.llmMinutesSinceLastDone;
  const waiting = b.llmReadyPending > 0;
  const level: Level =
    m == null || (waiting && m >= 60) ? 'danger' : waiting && m >= 20 ? 'warn' : 'ok';
  return {
    level,
    now: [
      m == null ? '처리 이력 없음' : `마지막 처리 ${hoursAgo(m)} 전`,
      `대기 ${b.llmReadyPending.toLocaleString()}`,
      `24시간 실패 ${b.llmFailed24h.toLocaleString()}`,
    ].join(' · '),
  };
};

/** 발송은 08~20시(야간 정지) — 저녁 마지막 발송부터 아침까지 ~12시간 공백이 정상 */
const pushCheck = (b: Signals['backend']): Pick<Check, 'level' | 'now'> => {
  if (!b) return { level: undefined };
  const m = b.pushMinutesSinceLast;
  return {
    level: m == null || m >= 26 * 60 ? 'danger' : m >= 14 * 60 ? 'warn' : 'ok',
    now: m == null ? '발송 이력 없음' : `마지막 발송 ${hoursAgo(m)} 전`,
  };
};

const communityCheck = (rows: ProviderHealthOutput[] | undefined): Pick<Check, 'level' | 'now'> => {
  if (!rows) return { level: undefined };
  const by = (lv: string) => rows.filter((r) => getHealthLevel(r) === lv);
  const critical = by('critical');
  const stale = by('stale');
  const dead = by('dead');
  const level: Level = critical.length > 0 ? 'danger' : stale.length > 0 ? 'warn' : 'ok';
  const names = (list: ProviderHealthOutput[]) => list.map((r) => r.providerName).join(', ');
  const parts = [
    critical.length > 0 && `6시간+ 멈춤: ${names(critical)}`,
    stale.length > 0 && `지연: ${names(stale)}`,
    critical.length + stale.length === 0 && `${rows.length - dead.length}곳 정상`,
    dead.length > 0 && `7일 무수집: ${names(dead)}`,
  ].filter(Boolean);
  return { level, now: parts.join(' · ') };
};

const issuingCheck = (rows: ProviderRow[] | undefined): Pick<Check, 'level' | 'now'> => {
  if (!rows) return { level: undefined };
  const byProvider = new Map(rows.map((r) => [r.provider, r]));
  const zero = ISSUING_PROVIDERS.filter((p) => (byProvider.get(p)?.issued24h ?? 0) === 0);
  return {
    level: zero.length > 0 ? 'danger' : 'ok',
    now:
      zero.length > 0
        ? `24시간 0건: ${zero.map(sourceName).join(', ')}`
        : ISSUING_PROVIDERS.map((p) => `${sourceName(p)} ${byProvider.get(p)?.issued24h}`).join(
            ' · ',
          ),
  };
};

const salesCheck = (rows: ProviderRow[] | undefined): Pick<Check, 'level' | 'now'> => {
  if (!rows) return { level: undefined };
  const silent = rows.filter((r) => r.salesHealth === 'silent');
  const sparse = rows.filter((r) => r.salesHealth === 'sparse');
  return {
    level: silent.length > 0 ? 'danger' : 'ok',
    now: [
      silent.length > 0
        ? `14일+ 판매 소식 없음: ${silent.map((r) => sourceName(r.provider)).join(', ')}`
        : '판매 수신 중',
      sparse.length > 0 && `원래 드묾: ${sparse.map((r) => sourceName(r.provider)).join(', ')}`,
    ]
      .filter(Boolean)
      .join(' · '),
  };
};

export const buildSections = (s: Signals): Section[] => [
  {
    title: '수익',
    why: '깨지면 그날 커미션이 0원이 된다. 대부분 에러 없이 조용히 0건이 되는 구조라 여기서 먼저 본다.',
    checks: [
      {
        id: 'toss-session',
        title: '토스 세션',
        level: sessionLevel(s.toss, 'danger'),
        now: s.toss === false ? '만료 — 토스 발급·정산 멈춤' : undefined,
        symptom:
          '토스 딜(최대 수익원) 구매 버튼이 제휴 링크 없이 나간다. 정산 수치가 멈춘다. 토스 스토어 피드도 "수집 스킵"으로 빈다.',
        check: [
          '이 칸이 초록이면 실제 토스 API 로 검증된 세션이다(만료면 서버가 키를 지운다).',
          '격일 06:00 자동 재발급 배치가 있다 — 이게 실패하면 만료가 이어진다.',
        ],
        fix: [
          '수익 링크 › 발급·세션 › 토스 카드에 TBIZAUTH 를 붙여넣는다(디코드하지 말고 원문 그대로). 저장하면 그동안 못 만든 링크가 재시도 큐로 돌아간다.',
          '403 IP_NOT_ALLOWED 라면 세션이 아니라 토스 콘솔의 허용 IP 문제.',
          '상세: jirum vault runbook/toss-session-tbizauth-recovery.md',
        ],
        href: '/profit-link',
      },
      {
        id: 'naver-session',
        title: '네이버 브랜드커넥트 세션',
        level: sessionLevel(s.naverBc, 'danger'),
        now: s.naverBc === false ? '없음 — 네이버 발급·스토어 피드·판매 수집 멈춤' : undefined,
        symptom:
          '스마트스토어·브랜드스토어 딜에 제휴 링크가 안 붙는다. 네이버BC 스토어 피드와 네이버 판매 수집도 같이 멈춘다(쿠키 하나를 셋이 같이 쓴다).',
        check: [
          '자동 갱신이 없다. 만료(401/403)되면 서버가 키를 지우고 알림을 한 번 보낸다.',
          '쿠키가 있어도 하루 발급 한도(1,000건)를 다 쓰면 그날은 nv:daily_limit 로 멈춘다 — 수익 링크 › 대시보드의 미발급 사유에서 보인다.',
        ],
        fix: [
          'brandconnect.naver.com 로그인 → 아무 요청 Copy as cURL → 수익 링크 › 발급·세션 › 네이버 브랜드커넥트 카드에 붙여넣기.',
        ],
        href: '/profit-link',
      },
      {
        id: 'kakao-session',
        title: '카카오쇼핑 세션',
        level: sessionLevel(s.kakao, 'danger'),
        now: s.kakao === false ? '없음 — 카카오 딜 발급 멈춤(대체 경로 없음)' : undefined,
        symptom: '카카오 스토어 딜이 제휴 링크 없이 나간다. 대체 발급 경로가 없다.',
        check: [
          '서버 매일 감시 대상이 아니다 — 이 칸이 유일한 감시다.',
          '판매 수집 경로가 없어 실제 수익은 카카오 추천리워드 콘솔에서만 보인다.',
        ],
        fix: [
          'store.kakao.com/share/ranking 로그인 → 공유하기 → affiliate-link 요청 Copy as cURL → 카카오쇼핑 카드에 붙여넣기.',
        ],
        href: '/profit-link',
      },
      {
        id: 'ohou-session',
        title: '오늘의집 세션',
        level: sessionLevel(s.ohou, 'warn'),
        now: s.ohou === false ? '없음 — 애드픽·링크프라이스로 대신 발급 중' : undefined,
        symptom:
          '오늘의집 딜이 큐레이터 링크(?af) 대신 애드픽·링크프라이스로 나간다. 0원은 아니지만 수수료가 다르다.',
        check: [
          '이 칸은 실제로 ?af 링크를 한 번 발급해 보고 판정한다.',
          '서버 매일 감시 대상이 아니고, 판매 수집도 없다(오늘의집 콘솔에서만 확인).',
        ],
        fix: [
          'ohou.se 큐레이터 로그인 → 상품 공유하기 → sharelink 요청 Copy as cURL → 오늘의집 카드에 붙여넣기.',
        ],
        href: '/profit-link',
      },
      {
        id: 'issuing',
        title: '몰별 링크 발급 (최근 24시간)',
        ...issuingCheck(s.profit),
        symptom:
          '특정 몰의 발급이 0건 — 그 몰 딜이 전부 커미션 없이 나간다. 과거: 애드픽 리미터 고장 11일, 알리 요청 무한대기 5일, 쿠팡 11자리 상품번호 오인.',
        check: [
          '수익 링크 › 대시보드의 「미발급 사유」에서 그 몰의 에러 코드를 본다: *:no_token=세션, nv:daily_limit=쿼터, cp:fail_429=쿠팡 시간당 한도, lp:no_merchant=링크프라이스 미제휴 몰.',
          '세션이 멀쩡한데 0건이면 워커(상품 후처리) 쪽 — 로그에 ECONNREFUSED·timeout 이 있는지.',
        ],
        fix: [
          '세션 문제면 위 세션 칸에서 다시 넣는다(저장 시 자동 재큐잉).',
          '워커·리미터 문제면 원인 수정 배포 후 재시도 배치가 따라잡게 둔다.',
          '상세: jirum vault domain/profit-link-timeout-hang-and-forbid-zombie.md',
        ],
        href: '/profit-link',
      },
      {
        id: 'retry-queue',
        title: '발급 재시도 대기열',
        // ponytail: 기준은 재시도 배치 한 번 처리량(15,000건). 쌓이는 추세까지 보려면 일별 기록이 필요
        level: s.queue ? (s.queue.eligibleNow > 15_000 ? 'warn' : 'ok') : undefined,
        now: s.queue
          ? `지금 재시도 가능 ${s.queue.eligibleNow.toLocaleString()}건 · 포기 ${s.queue.parked.toLocaleString()}건`
          : undefined,
        symptom:
          '30분마다 도는 재시도 배치가 멈추면 처음에 실패한 딜이 영영 링크 없이 남는다. 과거: 배치가 5일간 좀비로 걸려 1.2만 건 적체.',
        check: [
          '「지금 재시도 가능」이 계속 늘기만 하면 배치가 안 돌고 있다.',
          '「포기」가 갑자기 늘면 일시적 사유(쿼터·세션)로 시도 3회를 다 쓴 것 — 되살릴 수 있다.',
        ],
        fix: [
          '배치 Job 이 걸려 있으면 원인 고친 이미지를 먼저 배포한 뒤 걸린 Job 을 지운다(동시 실행 금지라 그래야 새로 뜬다).',
          '일시적 사유로 포기된 딜은 attempts 를 0으로 되돌려 재큐잉.',
          '상세: jirum vault domain/profit-link-retry-cap-recovery-zero.md',
        ],
        href: '/profit-link',
      },
      {
        id: 'sales',
        title: '판매·정산 수신',
        ...salesCheck(s.profit),
        symptom:
          '수익 대시보드 숫자가 멈춘다. 수집 배치는 몰별 실패를 로그로만 남기고 성공으로 끝나서 알람이 안 운다 — 14일 무소식이 유일한 신호. 과거: 알리 콜백 주소가 http 로 등록돼 8주 0건.',
        check: [
          '수익 링크 › 대시보드의 몰별 「마지막 판매」. 쿠팡은 원래 드물고(정상 최대 공백 17일) 정산이 늦게 확정된다.',
          '오늘의집·카카오는 판매 수집 자체가 없다 — 각 제휴 콘솔에서 본다.',
        ],
        fix: [
          '콜백형(알리·링크프라이스·토스 웹훅): 제휴 콘솔의 postback 주소가 https 운영 API 로 돼 있는지.',
          '조회형(토스·네이버·애드픽): 세션을 다시 넣고 매일 15:30 수집 배치를 기다리거나 수동 실행.',
          '상세: jirum vault domain/affiliate-provider-tracking-coverage-audit.md',
        ],
        href: '/profit-link',
      },
      {
        id: 'revenue',
        title: '최근 7일 수익',
        level: s.revenue7d === undefined ? undefined : s.revenue7d > 0 ? 'ok' : 'danger',
        now: s.revenue7d === undefined ? undefined : `그저께까지 7일 ${shortWon(s.revenue7d)}`,
        symptom: '위 칸이 전부 초록인데 이게 0원이면 집계 쪽(정산 배치·수익 계산) 문제다.',
        check: ['홈의 수익 차트에서 출처별로 어디가 빠졌는지 본다. 어제·오늘은 원래 덜 찬 값.'],
        fix: ['빠진 출처의 「판매·정산 수신」 칸 절차를 따른다.'],
        href: '/',
      },
      {
        id: 'redirect',
        title: '구매 링크 이동·단축 URL',
        level: 'manual',
        symptom:
          '구매 버튼이 중간 리다이렉트 페이지(unsafelink 등)로 튀거나, 카톡에 보낸 단축 링크가 안 열린다.',
        check: [
          '최근 딜 몇 개의 구매 버튼을 직접 눌러 몰 페이지로 바로 가는지.',
          '단축 URL 서버는 외부 감시(blackbox)가 있다 — 알림 채널 확인.',
        ],
        fix: [
          '래퍼가 남은 딜은 detailUrl 에서 래퍼를 벗기는 백필(운영 DB 쓰기 — 대상 수부터 센다).',
          '상세: jirum vault domain/profit-link-detailurl-wrapper-leak.md',
        ],
      },
      {
        id: 'kakao-bot',
        title: '카톡 단톡방 발송봇',
        level: 'manual',
        symptom: '단톡방에 딜이 안 올라온다. 구매 전환 1위 채널(utm=kakao)이라 수익 직격.',
        check: ['단톡방에 최근 몇 시간 안에 올라온 딜이 있는지. 봇 루프의 생존 핑(healthchecks).'],
        fix: [
          '봇이 도는 윈도우 VM 에 원격 접속해 루프를 다시 켠다(서비스로 돌리면 카톡 창을 못 찾는다).',
          '상세: jirum vault runbook/kakaotalk-broadcast-bot-systemization.md',
        ],
      },
      {
        id: 'ads',
        title: '애드센스·자체 광고',
        level: 'manual',
        symptom:
          '애드센스는 상세·검색에만 있다(홈엔 없음). 자체 광고 슬롯은 크리에이티브가 다 꺼지면 빈다.',
        check: [
          '애드센스 수익은 애드센스 콘솔이 정본(GA4 광고 지표 0 ≠ 수익 0).',
          '광고 › 목록에서 켜진 크리에이티브가 있는지.',
        ],
        fix: ['광고 › 등록에서 크리에이티브를 넣거나 켠다.'],
        href: '/advertisement',
      },
    ],
  },
  {
    title: '크롤러',
    why: '딜이 안 들어오면 발급할 링크도, 보낼 알림도 없다. 크롤러 Job 은 0건을 모아도 성공으로 끝나서 「초록불인데 비어 있음」이 흔하다.',
    checks: [
      {
        id: 'community',
        title: '커뮤니티 수집',
        ...communityCheck(s.community),
        symptom:
          '특정 커뮤니티 딜이 피드에서 사라진다. 과거: 접속 IP 차단(430/403)으로 fmkorea·zod 두 달 0건, VPN 사이드카 고착으로 클리앙·맘이베베 6일 정지, 뽐뿌 Referer·댓글 구조 변경.',
        check: [
          '크롤링 화면에서 멈춘 곳의 마지막 수집 시각과 사이트 최신 글을 비교한다(사이트도 조용하면 오탐).',
          '여러 곳이 한꺼번에 멈췄으면 크롤러가 아니라 상품 파이프라인(아래) 쪽이다.',
          '한 곳만이면: 그 크롤러 Job 을 수동 실행해 로그에서 403/430·「Collected 0」을 본다.',
        ],
        fix: [
          '차단: VPN 경유로 바꾸거나 일시정지. 구조 변경: 크롤러 셀렉터 수정.',
          '파드가 PodInitializing 으로 며칠째면 VPN 사이드카 고착 — 걸린 Job 을 지운다.',
          '상세: jirum vault runbook/crawler-silent-failure-checkup.md · runbook/crawler-killswitch-netns-stuck-and-deadline.md',
        ],
        href: '/crawling',
      },
      {
        id: 'store-feed',
        title: '스토어 피드 (토스·네이버BC·알리 등)',
        ...feedLevel(s.mall, 12 * 60, 48 * 60),
        symptom:
          '스토어 상품 신규 유입이 0이 된다. 서버 신선도 알람 대상이 아니라 여기서만 보인다. 과거: 토스 신규 유입 정지(업데이트 시각만 갱신), 토스 일괄 수집이 1.5만 건을 쏟아 상품 파이프라인 정지.',
        check: [
          '토스 3시간·네이버BC·알리 6시간 주기 — 12시간 넘게 없으면 늦은 것.',
          '토스가 멈췄으면 위 토스 세션부터, 네이버BC 면 네이버 세션부터.',
        ],
        fix: [
          '세션 문제면 수익 칸에서 다시 넣는다. 파이프라인 적체면 아래 「상품 파이프라인」.',
          '상세: jirum vault domain/toss-best-ranking-crawler.md',
        ],
        href: '/crawling',
      },
      {
        id: 'danawa',
        title: '다나와 수집',
        ...feedLevel(s.danawa, 2 * 24 * 60, 4 * 24 * 60),
        symptom:
          '가격 비교·다나와 최저가 근거가 낡는다. 과거: 브라우저 좀비 프로세스 6,570개 누적, 몰 목록 한글 깨짐(euc-kr 섞임).',
        check: ['격일 수집이라 2일 넘게 없으면 늦은 것. 다나와 HTML 이 바뀌면 조용히 0건이 된다.'],
        fix: ['다나와 크롤러 파드 메모리·프로세스 수 확인 후 재시작, 파싱 0건이면 셀렉터 수정.'],
        href: '/crawling',
      },
      {
        id: 'thumbnail',
        title: '썸네일',
        // ponytail: 50% 는 감으로 정한 바닥선. 평소 수집률이 쌓이면 그 값 근처로 올린다
        level: s.thumbnail
          ? s.thumbnail.total > 0 && s.thumbnail.missing / s.thumbnail.total > 0.5
            ? 'warn'
            : 'ok'
          : undefined,
        now:
          s.thumbnail && s.thumbnail.total > 0
            ? `최근 2일 수집률 ${(((s.thumbnail.total - s.thumbnail.missing) / s.thumbnail.total) * 100).toFixed(0)}% (${s.thumbnail.total.toLocaleString()}건 중)`
            : undefined,
        symptom:
          '카드에 회색 빈 상자. 과거: 뽐뿌 CDN 이 요청을 403 으로 막았는데 에러를 삼켜 3주간 몰랐다, 썸네일 워커가 큐 에러로 죽음.',
        check: ['크롤링 › 썸네일 탭에서 출처별로 어디가 빠졌는지.'],
        fix: [
          '썸네일 워커 재시작, 원인 수정 후 빠진 기간만 백필(10건 먼저).',
          '상세: jirum vault domain/썸네일-수집-파이프라인.md',
        ],
        href: '/crawling',
      },
      {
        id: 'pipeline',
        title: '상품 파이프라인 (Kafka·후처리 워커)',
        level: 'manual',
        symptom:
          '모든 출처의 신규 딜이 한꺼번에 끊기거나 늦어진다. 파드는 Running 인데 로그가 멈춰 있다. 단계별 에러를 삼켜서 일부 단계(썸네일·발급·알림)만 빠질 수도 있다.',
        check: [
          'Kafka 소비 지연 알람(LagHigh/Stalled)이 울렸는지.',
          '위 커뮤니티 칸이 동시에 여러 곳 빨갛다면 이쪽.',
        ],
        fix: [
          '워커 재시작 후 원인(브라우저 무한대기 등) 수정.',
          '상세: jirum vault verification/2026-09-27-kafka-common-worker-stall.md',
        ],
      },
    ],
  },
  {
    title: '매칭·검색',
    why: '딜은 들어오는데 「가격 비교·지금 살까」 근거와 검색이 비는 층.',
    checks: [
      {
        id: 'search',
        title: '검색',
        level:
          s.searchHits === undefined
            ? undefined
            : s.searchHits === null
              ? 'danger'
              : s.searchHits > 0
                ? 'ok'
                : 'warn',
        now:
          s.searchHits === null
            ? '검색 쿼리 에러'
            : s.searchHits === 0
              ? '「노트북」 검색 결과 0건'
              : undefined,
        symptom:
          '검색이 에러를 내거나 결과가 빈다. 과거: 검색 서버(LXC) 재부팅 후 IP 가 바뀌어 전면 장애.',
        check: ['이 칸은 「노트북」을 실제로 검색해 본다.'],
        fix: [
          '검색 서버 주소(MEILI_HOST)가 실제 IP 와 같은지 → 다르면 env 수정 후 API 재시작.',
          '상세: 메모리 meilisearch-ip-drift · jirum vault runbook/meilisearch-key-management.md',
        ],
      },
      {
        id: 'matching',
        title: '상품 매칭 커버리지',
        ...coverageCheck(s.backend),
        symptom:
          '가격 비교·다나와 배지가 사라진다. 과거: 매핑률 91%→16% 급락(8,520건 고착), LLM 결제 실패(402)를 「불일치」로 삼켜 오판정.',
        check: [
          '이 칸은 매일 09:00 감시 배치와 같은 기준(수집 2~3일 전 게이트 카테고리 딜 중 매핑 60% 이상)으로 지금 잰다.',
          s.pendingMatches !== undefined
            ? `검수 대기 ${s.pendingMatches.toLocaleString()}건은 평소 수만 건 — 할 일이지 장애가 아니다.`
            : '검수 대기 건수는 할 일이지 장애가 아니다.',
        ],
        fix: [
          'LLM 키·잔액 확인 → 빠진 구간만 unmapped 배치로 다시 돌린다.',
          '상세: 메모리 matching-coverage-outage-aug5-and-recovery · jirum vault domain/deepseek-402-silent-outage.md',
        ],
        href: '/product/matching',
      },
      {
        id: 'llm',
        title: 'LLM 워커 (댓글 요약·가이드·카테고리)',
        ...llmCheck(s.backend),
        symptom: '댓글 요약·구매 가이드가 새 딜에 안 붙는다. 실패를 삼켜 결과만 빈다.',
        check: [
          '대기가 있는데 20분 넘게 처리가 없으면 워커가 멈춘 것. 대기가 수만 건인 건 일괄 작업이라 정상.',
          '24시간 실패가 갑자기 늘면 LLM 키·잔액(402) 문제.',
        ],
        fix: ['LLM 잔액·키 확인 후 워커 재시작. 오래 잡힌 작업은 15분 뒤 자동 회수된다.'],
      },
      {
        id: 'similar',
        title: '추천·유사상품',
        level: 'manual',
        symptom: '상세의 유사상품·추천이 빈다. 실패를 빈 결과로 넘기던 구조(9/26 에러로 올림).',
        check: ['상세 하단 유사상품이 나오는지. 벡터 DB(Qdrant) 알람.'],
        fix: [
          '벡터 DB 메모리·디스크 확인(재기동 직후 9분 준비는 정상).',
          '상세: 메모리 qdrant-search-total-outage-and-backup-coupling',
        ],
      },
    ],
  },
  {
    title: '알림·앱·웹',
    why: '사용자에게 닿는 마지막 구간. 북극성(알림 경유 재방문)이 여기서 끊긴다.',
    checks: [
      {
        id: 'push',
        title: '푸시 알림 발송',
        ...pushCheck(s.backend),
        symptom: '키워드 알림이 안 오거나 두 번 온다. 대상별 발송 실패는 로그만 남고 건너뛴다.',
        check: [
          '이 칸은 키워드·좋은 딜 푸시를 포함한 마지막 발송 시각(push_history). 08~20시만 보내서 아침까지의 공백은 정상.',
          '발송은 되는데 「안 온다」는 제보면 기기 쪽 — 토큰 연결·포그라운드 표시 문제.',
        ],
        fix: [
          '상세: 메모리 push-pipeline-four-silent-gaps · notification-keyword-field-three-shapes',
        ],
        href: '/notification',
      },
      {
        id: 'app',
        title: '앱 OTA·스토어 출시',
        level: 'manual',
        symptom:
          '고친 게 앱 사용자에게 안 간다, OTA 직후 앱이 켜자마자 꺼진다, 스토어 출시가 단계 출시에서 멈춘다.',
        check: [
          'GitHub Actions 의 mobile-ota(기동 확인 포함) 결과, app-store-lag 워크플로(스토어 실물 버전).',
          'Play 는 단계 출시 비율이 100%인지.',
        ],
        fix: ['OTA 이상: 자동 OTA 를 끄고 직전 정상 그룹을 재발행(레포 AGENTS.md § Mobile App).'],
      },
      {
        id: 'web',
        title: '웹·어드민 배포',
        level: 'manual',
        symptom: '고쳤는데 운영은 그대로. main 푸시는 스테이징까지만 나간다.',
        check: ['운영은 v*.*.* 태그로만 나간다. 배포 워크플로 결과와 운영 이미지 태그.'],
        fix: ['확인한 커밋 SHA 로 태그를 찍는다(origin/main 금지 — 남의 커밋이 섞인다).'],
      },
    ],
  },
  {
    title: '인프라',
    why: '전부 같이 죽는 층. 대부분 알람(Mattermost)이 있으니 알람이 왔을 때 여기서 절차를 찾는다.',
    checks: [
      {
        id: 'db',
        title: 'DB·Redis',
        level: 'manual',
        symptom:
          '서버 CrashLoop, 크롤러 연쇄 사망, 간헐 에러. 과거: 커넥션 고갈, Redis AOF 깨짐, 정전으로 DB 3종 동시 손상.',
        check: ['MySQL·Valkey·Kafka Down 알람. 커넥션 수/한도.'],
        fix: [
          '상세: jirum vault runbook/redis-aof-corruption-autofix.md · runbook/nfs-db-crash-recovery.md',
        ],
      },
      {
        id: 'cert',
        title: '인증서·입구(ingress)',
        level: 'manual',
        symptom: '외부에서 사이트·API 가 안 열린다, 인증서 만료 경고.',
        check: ['와일드카드 인증서 만료일, 외부 감시(web·api·검색·단축 URL) 알람.'],
        fix: [
          '실패한 인증서 요청을 지우고 재발급. 상세: jirum vault runbook/wildcard-cert-renewal.md',
        ],
      },
      {
        id: 'backup',
        title: '백업',
        level: 'manual',
        symptom: '백업 크론은 초록인데 산출물이 없다(4초 만에 끝나는 빈 백업 이력).',
        check: ['백업 버킷의 최신 객체 날짜·크기를 직접 본다. BackupTooFast 알람.'],
        fix: ['수동 백업 Job 실행. 상세: jirum vault runbook/disaster-recovery-restore.md'],
      },
    ],
  },
];
