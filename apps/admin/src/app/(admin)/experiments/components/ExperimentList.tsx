'use client';

import { useQuery } from '@apollo/client/react';
import { useState } from 'react';

import Panel from '@/components/Panel';
import SegmentedControl from '@/components/SegmentedControl';
import Spinner from '@/components/Spinner';
import StatusDot, { type StatusLevel } from '@/components/StatusDot';
import { QueryExperimentsQuery } from '@/generated/gql/graphql';
import { QueryExperiments } from '@/graphql/experiment';

type Experiment = QueryExperimentsQuery['experiments'][number];
type View = 'active' | 'ended' | 'all';

const VIEWS = [
  { value: 'active', label: '진행·준비' },
  { value: 'ended', label: '끝남' },
  { value: 'all', label: '전체' },
] as const;

const STATUS_LABEL: Record<string, string> = {
  PLANNED: '준비됨',
  RUNNING: '진행 중',
  CONCLUDED: '판정 끝',
  STOPPED: '멈춤',
  REJECTED: '시작 전 기각',
};
const KIND_LABEL: Record<string, string> = { AB: 'A/B', OBSERVATION: '관찰' };
const ENDED = ['CONCLUDED', 'STOPPED', 'REJECTED'];

const level = (e: Experiment): StatusLevel =>
  e.overdue ? 'warn' : e.status === 'RUNNING' ? 'ok' : 'muted';

/** 10/06 — 등록부 날짜는 KST YYYY-MM-DD 문자열 */
const md = (d?: string | null) => (d ? `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}` : '');

const period = (e: Experiment) => {
  if (e.endedAt) return `${e.startedAt ? `${md(e.startedAt)} ~ ` : ''}${md(e.endedAt)} 끝`;
  const parts = [e.startedAt && `${md(e.startedAt)} 시작`, e.checkAt && `판독 ${md(e.checkAt)}`];
  return parts.filter(Boolean).join(' · ');
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-medium text-bodydark2">{label}</dt>
    <dd className="mt-0.5 text-sm break-words whitespace-pre-line text-black dark:text-white">
      {value}
    </dd>
  </div>
);

const ResultLine = ({ r }: { r: Experiment['results'][number] }) => (
  <li className="text-sm">
    <span className="mr-1.5 font-medium text-black dark:text-white">{md(r.date)}</span>
    <span className="text-body">{r.summary}</span>
    {r.decision && <p className="mt-1 font-medium text-black dark:text-white">→ {r.decision}</p>}
  </li>
);

const ExperimentCard = ({ e }: { e: Experiment }) => {
  const latest = e.results[e.results.length - 1];
  return (
    <Panel className="px-4 py-4 sm:px-6">
      <div className="flex items-center gap-2">
        <StatusDot level={level(e)} />
        <h3 className="min-w-0 flex-1 truncate font-semibold text-black dark:text-white">
          {e.title}
        </h3>
        <span className="shrink-0 text-xs text-bodydark2">
          {KIND_LABEL[e.kind] ?? e.kind} · {STATUS_LABEL[e.status] ?? e.status}
        </span>
      </div>
      <p className="mt-1 text-xs text-bodydark2">
        {e.overdue ? (
          <span className="font-medium text-danger">
            판독일 지남({md(e.checkAt)}) — 결과를 남겨야 한다
          </span>
        ) : (
          period(e)
        )}
        <span className="ml-1.5">{e.id}</span>
      </p>
      <p className="mt-2 text-sm text-body">{e.question}</p>

      {latest && (
        <ul className="mt-3 rounded-md bg-gray-2 px-3 py-2 dark:bg-meta-4">
          <ResultLine r={latest} />
        </ul>
      )}

      <details className="mt-3">
        <summary className="cursor-pointer text-sm text-primary">설계·판정 기준·전체 결과</summary>
        <dl className="mt-3 flex flex-col gap-3">
          <Row label="설계" value={e.design} />
          <Row label="주 지표" value={e.primaryMetric} />
          <Row label="판정 기준(시작 전에 정함)" value={e.decisionRule} />
          <Row label="검정력·기대값" value={e.power} />
          <Row label="판독 방법" value={e.readout} />
          <Row label="켜고 끄기" value={e.toggle} />
          {e.code.length > 0 && <Row label="코드" value={e.code.join('\n')} />}
        </dl>
        {e.results.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-bodydark2">결과 기록</p>
            <ul className="mt-1 flex flex-col gap-2">
              {e.results.map((r) => (
                <ResultLine key={`${r.date}-${r.summary.slice(0, 20)}`} r={r} />
              ))}
            </ul>
          </div>
        )}
      </details>
    </Panel>
  );
};

/**
 * 실험·관찰 등록부(crawling-server src/experiment/experiment-registry.ts) — 서버가 판독일 지난 것 먼저 정렬해 준다.
 * 등록·결과 기록은 코드(커밋)로 한다. 이 화면은 읽기 전용.
 */
const ExperimentList = () => {
  const [view, setView] = useState<View>('active');
  const { data, loading } = useQuery<QueryExperimentsQuery>(QueryExperiments, {
    fetchPolicy: 'cache-and-network',
  });
  const all = data?.experiments ?? [];
  const shown = all.filter((e) =>
    view === 'all' ? true : view === 'ended' ? ENDED.includes(e.status) : !ENDED.includes(e.status),
  );
  const overdue = all.filter((e) => e.overdue).length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SegmentedControl options={VIEWS} value={view} onChange={setView} />
        {overdue > 0 && <p className="text-sm font-medium text-danger">판독 밀림 {overdue}건</p>}
      </div>
      {loading && !data ? (
        <Spinner />
      ) : shown.length === 0 ? (
        <p className="text-sm text-bodydark2">없음</p>
      ) : (
        shown.map((e) => <ExperimentCard key={e.id} e={e} />)
      )}
    </div>
  );
};

export default ExperimentList;
