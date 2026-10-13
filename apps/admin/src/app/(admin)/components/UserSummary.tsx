'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import Chart from '@/components/Chart';
import Panel from '@/components/Panel';
import SegmentedControl from '@/components/SegmentedControl';
import StatTiles, { StatItem } from '@/components/StatTiles';
import { useMyAdminAccess } from '@/hooks/graphql/permission';
import { useUserOverview } from '@/hooks/graphql/stats';
import { canAccessPath } from '@/lib/adminSection';
import { monthDay as md } from '@/lib/format';
import { channelColor, channelName } from '@/lib/labels';
import { kstDaysAgo, toKstDateString, toStatsDateRange } from '@/utils/date';

import {
  addDays,
  daysBetween,
  fetchStart,
  inWindow,
  Period,
  PERIODS,
  periodWindows,
  pickBase,
  Window,
} from './userSummaryPeriods';

const MEMBER_COLOR = '#3C50E0';
const GUEST = 'guest';

const rate = (part: number, whole: number) =>
  whole > 0 ? `${Math.round((part / whole) * 100)}%` : '-';

const people = (v?: number) => (v === undefined ? '…' : `${v.toLocaleString()}명`);
const span = (w: Window) => `${md(w.from)} ~ ${md(w.to)}`;

/** 늘었나 줄었나 — 차이(명)와 비율. 직전이 0 이면 비율은 뜻이 없어 차이만 */
const Delta = ({ now, before }: { now: number; before: number }) => {
  const diff = now - before;
  if (diff === 0) return <span className="text-bodydark2">변화 없음</span>;
  const pct = before > 0 ? Math.round((diff / before) * 100) : null;
  return (
    <span className={`font-semibold ${diff > 0 ? 'text-success' : 'text-danger'}`}>
      {diff > 0 ? '▲' : '▼'}
      {Math.abs(diff).toLocaleString()}
      {pct !== null && pct !== 0 && ` (${pct > 0 ? '+' : ''}${pct}%)`}
    </span>
  );
};

type ActivityRow = {
  date: string;
  members: number;
  guests: number;
  activeMembers1d: number;
  activeMembers7d: number;
  activeGuests1d?: number | null;
  pushMembers: number;
  pushGuests: number;
};

/**
 * 홈 '사용자' — 숫자마다 «늘었나 줄었나»를 붙인다.
 * 지금 인원 타일 = 지금 vs 1주 전 하루 끝 스냅숏 → 기간 신규 = 어제까지 다 찬 날 vs 직전 같은 길이 →
 * 가입 경로 순위 → 일별 신규 막대 → 일별 접속(회원·게스트 쌓기, 하루 끝 스냅숏) + 지난주 같은 요일 대비.
 * 접속 기록이 마지막 접속 시각 하나라, 지난 날짜 접속 수는 매일 23:55 에 찍어 둔 user_activity_daily 뿐이다(10/11 부터,
 * 게스트 접속은 10/14 부터 — 그 전엔 게스트 재방문을 안 셌다).
 */
const UserSummary = () => {
  const { data: accessData } = useMyAdminAccess();
  const canHome = canAccessPath(accessData?.myAdminAccess, '/');
  const [period, setPeriod] = useState<Period>('last7');

  const today = toKstDateString();
  const range = useMemo(() => toStatsDateRange(fetchStart(today), today), [today]);
  const { data } = useUserOverview(range, { skip: !canHome });
  const overview = data?.userOverview;

  const windows = useMemo(() => periodWindows(period, today), [period, today]);

  const view = useMemo(() => {
    if (!overview) return undefined;
    const { current, previous } = windows;
    const byChannel = new Map<string, number>();
    const members = new Map<string, number>();
    const guests = new Map<string, number>();
    const prev = { members: 0, guests: 0 };
    let memberReach = 0;
    let guestReach = 0;
    overview.dailySignups.forEach((r) => {
      const isGuest = r.channel === GUEST;
      if (inWindow(r.date, previous)) {
        if (isGuest) prev.guests += r.count;
        else prev.members += r.count;
      }
      if (!inWindow(r.date, current)) return;
      byChannel.set(r.channel, (byChannel.get(r.channel) ?? 0) + r.count);
      if (isGuest) guestReach += r.reachable;
      else memberReach += r.reachable;
      const daily = isGuest ? guests : members;
      daily.set(r.date, (daily.get(r.date) ?? 0) + r.count);
    });
    const channels = [...byChannel.entries()]
      .filter(([code]) => code !== GUEST)
      .sort((a, b) => b[1] - a[1])
      .map(([code, count]) => ({ code, count }));
    const days = current ? daysBetween(current.from, current.to) : [];
    return {
      members: channels.reduce((acc, c) => acc + c.count, 0),
      guests: byChannel.get(GUEST) ?? 0,
      prev,
      memberReach,
      guestReach,
      top: Math.max(1, ...channels.map((c) => c.count)),
      channels,
      categories: days.map(md),
      memberDaily: days.map((d) => members.get(d) ?? 0),
      guestDaily: days.map((d) => guests.get(d) ?? 0),
    };
  }, [overview, windows]);

  // 하루 끝 스냅숏 — 오늘 줄은 23:55 전엔 없다
  const snapshots: ActivityRow[] = useMemo(
    () => (overview?.dailyActivity ?? []).filter((r) => r.date < today),
    [overview, today],
  );

  if (!canHome) return null;

  // 지금 vs 1주 전 하루 끝(없으면 쌓이기 시작한 첫날). 회원·게스트·알림 닿는 수는 같은 정의라 그대로 뺀다.
  // 7일 접속은 지금(최근 7×24시간)과 스냅숏(그날 23:55 까지 7일)의 창 차이가 몇 분이라 같이 비교한다.
  const weekAgo = kstDaysAgo(7);
  const base = pickBase(snapshots, weekAgo, today);
  const baseLabel = base && (base.date === weekAgo ? '1주 전 대비' : `${md(base.date)} 밤 대비`);
  const delta = (now: number | undefined, before: number | undefined) =>
    base && now !== undefined && before !== undefined ? (
      <span className="block">
        <Delta now={now} before={before} /> <span>{baseLabel}</span>
      </span>
    ) : null;

  const tiles: StatItem[] = [
    {
      label: '회원',
      value: overview ? overview.members.toLocaleString() : '…',
      hint: delta(overview?.members, base?.members),
    },
    {
      label: '게스트',
      value: overview ? overview.guests.toLocaleString() : '…',
      hint: delta(overview?.guests, base?.guests),
    },
    {
      label: '7일 접속 회원',
      value: overview ? overview.activeMembers7d.toLocaleString() : '…',
      hint: overview && (
        <>
          {delta(overview.activeMembers7d, base?.activeMembers7d)}
          <span className="block">
            24시간 {overview.activeMembers1d} · 게스트 {overview.activeGuests7d}
          </span>
        </>
      ),
    },
    {
      label: '알림 닿는 회원',
      value: overview ? overview.pushMembers.toLocaleString() : '…',
      hint: overview && (
        <>
          {delta(overview.pushMembers, base?.pushMembers)}
          <span className="block">
            회원의 {rate(overview.pushMembers, overview.members)} · 게스트 기기{' '}
            {overview.pushGuests}
          </span>
        </>
      ),
    },
  ];

  // 일별 접속: 마지막 하루 끝 vs 지난주 같은 요일(요일마다 접속이 달라서) — 없으면 전날
  const last = snapshots[snapshots.length - 1];
  const lastBase =
    last &&
    (snapshots.find((r) => r.date === addDays(last.date, -7)) ??
      snapshots.find((r) => r.date === addDays(last.date, -1)));
  const lastBaseLabel =
    last && lastBase && (lastBase.date === addDays(last.date, -7) ? '지난주 같은 요일' : '전날');
  const activity = snapshots.filter(
    (r) => windows.current && r.date >= windows.current.from && r.date <= windows.current.to,
  );
  const hasGuestActivity = activity.some((r) => r.activeGuests1d != null);

  const { current, previous } = windows;

  return (
    <section className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-black">사용자</h3>
        <Link href="/stats" className="text-xs font-medium text-primary">
          통계 더 보기 ›
        </Link>
      </div>

      <StatTiles items={tiles} />

      <Panel className="p-4 sm:p-6">
        <SegmentedControl options={PERIODS} value={period} onChange={setPeriod} />

        {!current ? (
          <p className="mt-4 text-xs text-body">
            오늘이 1일이라 이번 달은 아직 다 찬 날이 없다 — 오늘 가입은 아래 &lsquo;오늘&rsquo;
            타일에.
          </p>
        ) : (
          <>
            <p className="mt-4 text-xs text-body">{span(current)} 신규 (어제까지)</p>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-body">회원</p>
                <p className="text-2xl font-bold text-black">{people(view?.members)}</p>
                {view && previous && (
                  <p className="text-xs">
                    <Delta now={view.members} before={view.prev.members} />
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-body">게스트</p>
                <p className="text-2xl font-bold text-black">{people(view?.guests)}</p>
                {view && previous && (
                  <p className="text-xs">
                    <Delta now={view.guests} before={view.prev.guests} />
                  </p>
                )}
              </div>
            </div>
            {view && previous && (
              <p className="mt-1.5 text-[11px] text-bodydark2">
                직전 같은 길이 {span(previous)}: 회원 {view.prev.members.toLocaleString()}명 ·
                게스트 {view.prev.guests.toLocaleString()}명
              </p>
            )}

            {view && view.members + view.guests > 0 && (
              // 북극성(알림 경유 재방문)의 입구 — 가입해도 푸시 토큰이 없으면 알림을 한 통도 못 받는다
              <p className="mt-2 text-xs text-body">
                그중 알림까지 닿은 회원{' '}
                <span className="font-semibold text-black">
                  {view.memberReach.toLocaleString()}명 ({rate(view.memberReach, view.members)})
                </span>
                {view.guests > 0 && (
                  <>
                    {' · '}게스트{' '}
                    <span className="font-semibold text-black">
                      {view.guestReach.toLocaleString()}/{view.guests.toLocaleString()} (
                      {rate(view.guestReach, view.guests)})
                    </span>
                  </>
                )}
              </p>
            )}
          </>
        )}

        {view && view.members + view.guests > 0 && (
          // 넓은 화면은 가입 경로 | 일별 그래프 좌우로 (모바일은 위아래)
          <div className="lg:grid lg:grid-cols-2 lg:gap-10">
            <ul className="mt-4 space-y-2.5">
              {view.channels.map((c) => (
                <li key={c.code} className="text-sm">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-black">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: channelColor(c.code) }}
                      />
                      {channelName(c.code)}
                    </span>
                    <span className="font-semibold text-black">
                      {c.count.toLocaleString()}명
                      <span className="ml-1.5 inline-block w-8 text-right text-xs font-normal text-bodydark2">
                        {Math.round((c.count / view.members) * 100)}%
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-gray-2">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(c.count / view.top) * 100}%`,
                        background: channelColor(c.code),
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 lg:mt-4">
              <p className="text-xs font-medium text-body">일별 신규</p>
              <div className="-mx-2">
                <Chart
                  type="bar"
                  height={180}
                  stacked
                  categories={view.categories}
                  colors={[MEMBER_COLOR, channelColor(GUEST)]}
                  series={[
                    { name: '회원', data: view.memberDaily },
                    { name: '게스트', data: view.guestDaily },
                  ]}
                  format={(v) => `${v.toLocaleString()}명`}
                  // 쌓인 회원·게스트 사이에 바탕색 틈
                  options={{ stroke: { show: true, width: 2, colors: ['#fff'] } }}
                />
              </div>
            </div>
          </div>
        )}

        {overview && (
          <div className="mt-6">
            <p className="text-xs font-medium text-body">일별 접속 (하루 끝 기준)</p>
            {last && (
              <p className="mt-1 text-xs text-body">
                {md(last.date)} 접속 회원{' '}
                <span className="font-semibold text-black">
                  {last.activeMembers1d.toLocaleString()}명
                </span>
                {lastBase && (
                  <>
                    {' '}
                    <Delta now={last.activeMembers1d} before={lastBase.activeMembers1d} />{' '}
                    <span className="text-bodydark2">
                      {lastBaseLabel}({md(lastBase.date)}) 대비
                    </span>
                  </>
                )}
                {last.activeGuests1d != null && (
                  <>
                    {' · '}게스트{' '}
                    <span className="font-semibold text-black">
                      {last.activeGuests1d.toLocaleString()}명
                    </span>
                    {lastBase?.activeGuests1d != null && (
                      <>
                        {' '}
                        <Delta now={last.activeGuests1d} before={lastBase.activeGuests1d} />
                      </>
                    )}
                  </>
                )}
              </p>
            )}
            {activity.length < 2 ? (
              <p className="mt-2 rounded-md bg-gray-2 px-3 py-2.5 text-xs leading-relaxed text-body">
                10/11 부터 매일 23:55 에 그날 접속 수를 남긴다 — 이 기간에 이틀 치가 쌓이면 막대가
                그려진다.
              </p>
            ) : (
              <div className="-mx-2">
                <Chart
                  type="bar"
                  height={180}
                  stacked
                  categories={activity.map((r) => md(r.date))}
                  colors={[MEMBER_COLOR, channelColor(GUEST)]}
                  series={[
                    { name: '회원', data: activity.map((r) => r.activeMembers1d) },
                    // 10/14 전은 게스트 재방문을 안 세던 때라 빈칸(null) — 0 이면 게스트가 안 온 것처럼 보인다
                    ...(hasGuestActivity
                      ? [{ name: '게스트', data: activity.map((r) => r.activeGuests1d ?? null) }]
                      : []),
                  ]}
                  format={(v) => `${v.toLocaleString()}명`}
                  options={{ stroke: { show: true, width: 2, colors: ['#fff'] } }}
                />
              </div>
            )}
          </div>
        )}

        <p className="mt-3 text-[11px] leading-relaxed text-bodydark2">
          ▲▼ 는 같은 길이끼리 비교 — 기간 신규는 오늘(덜 찬 날)을 빼고 어제까지. 게스트 = 로그인
          없이 키워드 알림만 받는 기기(10/9 출시, 10/12 부터 앱 첫 실행에 자동 생성 — 그래서
          10/12~13 게스트 급증은 새 사람만이 아니라 원래 쓰던 비로그인 앱 사용자가 함께 잡힌 것).
          알림까지 닿음 = 지금 살아 있는 푸시 토큰. 접속 = 마지막 접속 시각 기준, 앱 백그라운드 토큰
          갱신은 안 센다. 게스트 접속은 10/14 부터 센다.
        </p>
      </Panel>
    </section>
  );
};

export default UserSummary;
