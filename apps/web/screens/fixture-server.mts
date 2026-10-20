// 화면 하네스용 GraphQL 고정 데이터 서버. web 의 서버·브라우저 요청이 전부 여기로 온다(GRAPHQL_ENDPOINT / API_URL).
//
//   replay(기본): fixtures/<오퍼레이션>/<변수 해시>.json 을 돌려준다. 없으면 errors 로 답하고 /__missing 에 쌓는다.
//   record     : 쿼리를 운영 API 로 넘겨 받은 응답을 저장한다(인증 헤더는 빼고 — 공개 데이터만 녹화된다).
//
// 뮤테이션은 어느 모드에서도 운영으로 넘기지 않는다(게스트 생성·조회수 같은 부작용). MUTATIONS 표 또는 null 로 답한다.
// 로그인: Authorization 이 USER_TOKEN 이면 user-fixtures.ts 부터 찾는다. 녹화가 FORBIDDEN 인 쿼리에 손 데이터가 없으면 «녹화 안 된 쿼리»로.
// 시나리오(POST /__scenario {"name"})는 응답을 덮어 빈 목록·에러 상태를 만든다 — 하네스가 페이지마다 바꾼다.
// 녹화 시각과 지금의 차이만큼 날짜 문자열을 밀어서, 몇 주 전 녹화도 「3분 전」·「진행 중」으로 보이게 한다.
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { USER_FIXTURES, USER_TOKEN } from './user-fixtures.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, 'fixtures');
const META = join(FIXTURES, '_meta.json');
const PORT = Number(process.env.SCREENS_FIXTURE_PORT ?? 9090);
const MODE = process.env.SCREENS_MODE === 'record' ? 'record' : 'replay';
const UPSTREAM = process.env.SCREENS_UPSTREAM ?? 'https://jirum-api.kyojs.com/graphql';

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
type GraphQLBody = { query?: string; variables?: Record<string, Json> | null; operationName?: string };
type Scenario = 'default' | 'empty' | 'error';

const MUTATIONS: Record<string, Json> = {
  MutationGuestLogin: { guestLogin: { accessToken: 'fixture-guest-token' } },
};

let scenario: Scenario = 'default';
const missing = new Map<string, Json>();

const opInfo = (query = '') => {
  const m = /\b(query|mutation|subscription)\s+([A-Za-z0-9_]+)/.exec(query);
  const root = /\{\s*([A-Za-z0-9_]+)/.exec(query)?.[1] ?? 'unknown';
  return { kind: m?.[1] ?? 'query', name: m?.[2] ?? 'Anonymous', root };
};

const stable = (value: Json): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${stable(value[k])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value ?? null);
};

const fixturePath = (name: string, variables: Json) =>
  join(FIXTURES, name, `${createHash('sha1').update(stable(variables)).digest('hex').slice(0, 12)}.json`);

// 녹화 파일은 커밋된다 — 토큰·이메일 모양 값은 녹화 때 지운다.
// 객체 배열은 앞 MAX_LIST 개만 — 전체 목록 쿼리(publishedModelPages 1.2MB) 하나가 녹화의 대부분을 차지했다. 화면 검증엔 충분하다.
const MAX_LIST = 60;
const scrub = (value: Json, key = ''): Json => {
  if (Array.isArray(value)) {
    const capped = value.some((v) => v && typeof v === 'object') ? value.slice(0, MAX_LIST) : value;
    return capped.map((v) => scrub(v));
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, scrub(v, k)]));
  }
  if (typeof value === 'string' && /token|secret|password/i.test(key)) return 'fixture-redacted';
  if (typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value)) return 'user@example.com';
  return value;
};

const ISO_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:?\d{2})$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const DAY = 86_400_000;

const shiftDates = (value: Json, deltaMs: number): Json => {
  if (Array.isArray(value)) return value.map((v) => shiftDates(v, deltaMs));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shiftDates(v, deltaMs)]));
  }
  if (typeof value !== 'string') return value;
  if (ISO_DATETIME.test(value)) return new Date(Date.parse(value) + deltaMs).toISOString();
  if (ISO_DATE.test(value)) {
    const days = Math.round(deltaMs / DAY);
    return new Date(Date.parse(`${value}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);
  }
  return value;
};

// 빈 상태: 객체 배열을 전부 비운다(목록·섹션이 0개일 때의 화면). 숫자·문자 배열(가격 등)은 둔다.
const emptyLists = (value: Json): Json => {
  if (Array.isArray(value)) {
    return value.some((v) => v && typeof v === 'object') ? [] : value;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, emptyLists(v)]));
  }
  return value;
};

const recordedAt = (): number => {
  if (!existsSync(META)) return Date.now();
  return Date.parse((JSON.parse(readFileSync(META, 'utf8')) as { recordedAt: string }).recordedAt);
};

// 서버가 뜰 때 한 번 정한다 — 요청마다 바뀌면 화면이 밀린 날짜로 만든 커서(searchAfter)를 되돌릴 수 없다.
const DELTA = MODE === 'replay' ? Math.round((Date.now() - recordedAt()) / 1000) * 1000 : 0;

// 화면이 밀린 날짜로 만든 변수(무한 스크롤 커서의 epoch ms·ISO 날짜)를 녹화 당시 값으로 되돌린다.
const EPOCH_MS = /^\d{13}$/;
const unshiftVariables = (value: Json): Json => {
  if (Array.isArray(value)) return value.map(unshiftVariables);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, unshiftVariables(v)]));
  }
  if (typeof value === 'string' && EPOCH_MS.test(value)) return String(Number(value) - DELTA);
  if (typeof value === 'number' && value > 1e12 && value < 1e13) return value - DELTA;
  if (typeof value === 'string' && ISO_DATETIME.test(value)) {
    return new Date(Date.parse(value) - DELTA).toISOString();
  }
  return value;
};

const send = (res: ServerResponse, status: number, body: unknown) => {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
};

const readBody = async (req: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString('utf8');
};

const isForbidden = (json: { errors?: Json }) =>
  Array.isArray(json.errors) &&
  json.errors.some((e) => JSON.stringify(e).includes('FORBIDDEN') || JSON.stringify(e).includes('UNAUTHENTICATED'));

const answerQuery = async (body: GraphQLBody, user: boolean): Promise<{ data?: Json; errors?: Json }> => {
  const { name } = opInfo(body.query);
  const variables = (body.variables ?? {}) as Json;
  let file = fixturePath(name, variables);

  // 녹화 때도 — 로그인 쿼리는 운영으로 넘겨 봐야 FORBIDDEN 이고, 그 화면이 깨지면 이어지는 공개 쿼리를 못 녹화한다.
  if (user && USER_FIXTURES[name]) {
    return { data: USER_FIXTURES[name]((variables ?? {}) as Record<string, unknown>) as Json };
  }

  if (MODE === 'record') {
    const res = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/graphql-response+json' },
      body: JSON.stringify({ query: body.query, variables: body.variables, operationName: body.operationName }),
    });
    const json = scrub((await res.json()) as Json) as { data?: Json; errors?: Json };
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, `${JSON.stringify({ variables, response: json }, null, 2)}\n`);
    return json;
  }

  if (!existsSync(file)) file = fixturePath(name, unshiftVariables(variables));
  // 녹화 때보다 더 내려 스크롤해 다음 쪽을 부르면 «목록 끝»으로 답한다(첫 쪽 모양에서 목록만 비움).
  const vars = variables as Record<string, Json>;
  if (!existsSync(file) && vars && typeof vars === 'object' && vars.searchAfter) {
    const first = fixturePath(name, { ...vars, searchAfter: null });
    const firstWithout = fixturePath(name, Object.fromEntries(Object.entries(vars).filter(([k]) => k !== 'searchAfter')));
    const base = [first, firstWithout].find((f) => existsSync(f));
    if (base) {
      const { response } = JSON.parse(readFileSync(base, 'utf8')) as { response: { data?: Json } };
      return { data: emptyLists(response.data ?? null) };
    }
  }
  if (!existsSync(file)) {
    missing.set(`${name} ${stable(variables)}${user ? ' (로그인)' : ''}`, variables);
    return { errors: [{ message: `fixture missing: ${name} — pnpm --filter web screens:record` }] };
  }
  const { response } = JSON.parse(readFileSync(file, 'utf8')) as { response: { data?: Json; errors?: Json } };
  if (user && isForbidden(response)) {
    missing.set(`${name} (로그인 데이터 없음 — screens/user-fixtures.ts)`, variables);
  }
  return shiftDates(response as Json, DELTA) as { data?: Json; errors?: Json };
};

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/__scenario') {
      scenario = (JSON.parse(await readBody(req)) as { name: Scenario }).name;
      return send(res, 200, { scenario });
    }
    if (req.method === 'GET' && req.url === '/__missing') {
      return send(res, 200, [...missing.keys()]);
    }
    if (req.method === 'POST' && req.url === '/__missing/reset') {
      missing.clear();
      return send(res, 200, []);
    }
    if (req.method !== 'POST' || !req.url?.startsWith('/graphql')) return send(res, 404, {});

    const body = JSON.parse(await readBody(req)) as GraphQLBody;
    const { kind, name, root } = opInfo(body.query);

    if (kind === 'mutation') {
      return send(res, 200, { data: MUTATIONS[name] ?? { [root]: null } });
    }
    if (scenario === 'error' && MODE === 'replay') {
      return send(res, 200, { data: null, errors: [{ message: 'fixture scenario: error' }] });
    }
    const user = req.headers.authorization === `Bearer ${USER_TOKEN}`;
    const json = await answerQuery(body, user);
    if (scenario === 'empty' && MODE === 'replay' && json.data) {
      return send(res, 200, { ...json, data: emptyLists(json.data) });
    }
    return send(res, 200, json);
  } catch (error) {
    return send(res, 500, { errors: [{ message: String(error) }] });
  }
});

// 녹화는 늘 처음부터 — 옛 파일이 남으면 날짜 기준(_meta)과 어긋나고 안 쓰는 파일이 쌓인다.
if (MODE === 'record') {
  rmSync(FIXTURES, { recursive: true, force: true });
  mkdirSync(FIXTURES, { recursive: true });
  writeFileSync(META, `${JSON.stringify({ recordedAt: new Date().toISOString() }, null, 2)}\n`);
}

server.listen(PORT, () => console.log(`[screens] fixture server ${MODE} on :${PORT}`));
