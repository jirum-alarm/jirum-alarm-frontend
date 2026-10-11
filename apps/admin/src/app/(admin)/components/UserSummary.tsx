'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import Chart from '@/components/Chart';
import Panel from '@/components/Panel';
import SegmentedControl from '@/components/SegmentedControl';
import { useMyAdminAccess } from '@/hooks/graphql/permission';
import { useUserOverview } from '@/hooks/graphql/stats';
import { canAccessPath } from '@/lib/adminSection';
import { monthDay as md } from '@/lib/format';
import { channelColor, channelName } from '@/lib/labels';
import { kstDaysAgo, toKstDateString, toStatsDateRange } from '@/utils/date';

const DAY_MS = 24 * 60 * 60 * 1000;
/** [from, to] KST 날짜를 하루씩 — 가입 0인 날도 막대 자리를 남긴다 */
const daysBetween = (from: string, to: string) => {
  const days: string[] = [];
  for (let t = Date.parse(`${from}T00:00:00Z`); t <= Date.parse(`${to}T00:00:00Z`); t += DAY_MS) {
    days.push(new Date(t).toISOString().slice(0, 10));
  }
  return days;
};

const MEMBER_COLOR = '#3C50E0';
const WEEKLY_COLOR = '#F59E0B';
const GUEST = 'guest';

const PERIODS = [
  { value: 'last7', label: '최근 7일' },
  { value: 'month', label: '이번 달' },
  { value: 'last30', label: '최근 30일' },
] as const;
type Period = (typeof PERIODS)[number]['value'];

const rate = (part: number, whole: number) =>
  whole > 0 ? `${Math.round((part / whole) * 100)}%` : '-';

const people = (v?: number) => (v === undefined ? '…' : `${v.toLocaleString()}명`);

/**
 * 홈 '사용자' — 수익 요약과 같은 틀. 지금 인원(회원·최근 접속·알림 닿는 회원) → 기간 신규(회원 + 게스트) →
 * 가입 경로 순위 막대 → 일별 신규 막대(회원·게스트 쌓기) → 일별 접속 선(하루 끝 스냅숏).
 * 접속 기록이 마지막 접속 시각 하나라, 지난 날짜 접속 수는 매일 23:55 에 찍어 둔 user_activity_daily 뿐이다(10/11 부터).
 */
const UserSummary = () => {
  const { data: accessData } = useMyAdminAccess();
  const canHome = canAccessPath(accessData?.myAdminAccess, '/');
  const [period, setPeriod] = useState<Period>('last7');

  const today = toKstDateString();
  const last7Start = kstDaysAgo(6);
  const last30Start = kstDaysAgo(29);
  const monthStart = `${today.slice(0, 8)}01`;
  const range = useMemo(
    () => toStatsDateRange(last30Start < monthStart ? last30Start : monthStart, today),

    [last30Start, monthStart, today],
  );
  const { data } = useUserOverview(range, { skip: !canHome });
  const overview = data?.userOverview;

  const periodStart = { last7: last7Start, month: monthStart, last30: last30Start }[period];
  const view = useMemo(() => {
    if (!overview) return undefined;
    const byChannel = new Map<string, number>();
    const members = new Map<string, number>();
    const guests = new Map<string, number>();
    let memberReach = 0;
    let guestReach = 0;
    overview.dailySignups.forEach((r) => {
      if (r.date < periodStart) return;
      byChannel.set(r.channel, (byChannel.get(r.channel) ?? 0) + r.count);
      if (r.channel === GUEST) guestReach += r.reachable;
      else memberReach += r.reachable;
      const daily = r.channel === GUEST ? guests : members;
      daily.set(r.date, (daily.get(r.date) ?? 0) + r.count);
    });
    const channels = [...byChannel.entries()]
      .filter(([code]) => code !== GUEST)
      .sort((a, b) => b[1] - a[1])
      .map(([code, count]) => ({ code, count }));
    const days = daysBetween(periodStart, today);
    return {
      members: channels.reduce((acc, c) => acc + c.count, 0),
      guests: byChannel.get(GUEST) ?? 0,
      memberReach,
      guestReach,
      top: Math.max(1, ...channels.map((c) => c.count)),
      channels,
      categories: days.map(md),
      memberDaily: days.map((d) => members.get(d) ?? 0),
      guestDaily: days.map((d) => guests.get(d) ?? 0),
      // 스냅숏이 없는 날(배치 시작 전·실패)은 빈칸 — 0 으로 메우면 접속이 끊긴 것처럼 보인다
      activity: overview.dailyActivity.filter((r) => r.date >= periodStart),
    };
  }, [overview, periodStart, today]);

  if (!canHome) return null;

  const pushRate =
    overview && overview.members > 0
      ? Math.round((overview.pushMembers / overview.members) * 100)
      : undefined;
  const stats = [
    { label: '회원', value: overview?.members, hint: overview && `게스트 ${overview.guests}` },
    {
      label: '7일 접속',
      value: overview?.activeMembers7d,
      hint: overview && `오늘 ${overview.activeMembers1d} · 30일 ${overview.activeMembers30d}`,
    },
    {
      label: '알림 닿는 회원',
      value: overview?.pushMembers,
      hint: pushRate === undefined ? undefined : `회원의 ${pushRate}%`,
    },
  ];

  return (
    <section className="mb-6 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-black">사용자</h3>
        <Link href="/stats" className="text-xs font-medium text-primary">
          통계 더 보기 ›
        </Link>
      </div>

      <Panel className="p-4">
        <div className="grid grid-cols-3 divide-x divide-stroke text-center">
          {stats.map((s) => (
            <div key={s.label} className="px-1">
              <p className="text-xs text-body">{s.label}</p>
              <p className="mt-1 text-base font-bold text-black sm:text-xl">
                {s.value === undefined ? '…' : s.value.toLocaleString()}
              </p>
              {s.hint && <p className="mt-0.5 text-[11px] text-bodydark2">{s.hint}</p>}
            </div>
          ))}
        </div>
        {overview && overview.pushGuests > 0 && (
          <p className="mt-3 border-t border-stroke pt-2 text-xs text-body">
            게스트 중 알림 닿는 기기{' '}
            <span className="font-medium text-black">{overview.pushGuests}</span>
          </p>
        )}
      </Panel>

      <Panel className="p-4 sm:p-6">
        <SegmentedControl options={PERIODS} value={period} onChange={setPeriod} />

        <p className="mt-4 text-xs text-body">
          {md(periodStart)} ~ {md(today)} 신규 회원
        </p>
        <p className="text-3xl font-bold text-black">
          {people(view?.members)}
          {view && view.guests > 0 && (
            <span className="ml-2 text-sm font-normal text-body">
              + 게스트 {view.guests.toLocaleString()}
            </span>
          )}
        </p>
        {view && view.members + view.guests > 0 && (
          // 북극성(알림 경유 재방문)의 입구 — 가입해도 푸시 토큰이 없으면 알림을 한 통도 못 받는다
          <p className="mt-1 text-xs text-body">
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

        {view && (
          <div className="mt-6">
            <p className="text-xs font-medium text-body">일별 접속 회원</p>
            {view.activity.length < 2 ? (
              <p className="mt-2 rounded-md bg-gray-2 px-3 py-2.5 text-xs leading-relaxed text-body">
                10/11 부터 매일 23:55 에 그날 접속 수를 남긴다 — 이틀째부터 선이 그려진다.
                {view.activity[0] &&
                  ` ${md(view.activity[0].date)} 접속 ${view.activity[0].activeMembers1d.toLocaleString()}명.`}
              </p>
            ) : (
              <div className="-mx-2">
                <Chart
                  type="line"
                  height={180}
                  categories={view.activity.map((r) => md(r.date))}
                  colors={[MEMBER_COLOR, WEEKLY_COLOR]}
                  series={[
                    { name: '그날 접속', data: view.activity.map((r) => r.activeMembers1d) },
                    { name: '7일 접속', data: view.activity.map((r) => r.activeMembers7d) },
                  ]}
                  format={(v) => `${v.toLocaleString()}명`}
                />
              </div>
            )}
          </div>
        )}

        <p className="mt-3 text-[11px] leading-relaxed text-bodydark2">
          가입 경로 = 처음 연결한 소셜 계정. 게스트 = 로그인 없이 키워드 알림만 받는 기기(10/9
          출시). 알림까지 닿음 = 지금 살아 있는 푸시 토큰이 있음(가입 당시가 아니라 지금 기준).
          접속은 마지막 접속 시각 기준 — 앱이 백그라운드에서 토큰만 갱신한 건 안 센다.
        </p>
      </Panel>
    </section>
  );
};

export default UserSummary;
