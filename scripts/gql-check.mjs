#!/usr/bin/env node
// 소스 트리의 GraphQL 문서를 운영 API 스키마로 검증한다 — release-tag.py 의 «서버 먼저» 관문.
//
// 왜: 서버 운영 롤아웃 전에 새 필드·인자를 쓰는 웹을 태그하면 운영에서 `Unknown argument` 장애가 난다(2026-08-01).
// codegen 은 dev 스키마를 보고(apps/web/codegen.ts) tsc 는 문자열 쿼리를 못 본다 — 그래서 운영 스키마로 직접 잰다.
//
//   node scripts/gql-check.mjs --schema https://jirum-api.kyojs.com/graphql --root <소스 루트> apps/web/src
//   → stdout JSON {checked, skipped, errors:[{file, op, message}]}
//
// 문서 찾기: 템플릿 리터럴 중 query/mutation/subscription/fragment 로 시작하는 것(gql``·graphql(``)·
// new TypedDocumentString(``) 전부). `${NAME}` 은 같은 파일의 `const NAME = \`…\`` 로 채우고, 못 채우면 건너뛴다.
// 주석 처리된 코드·codegen 산출물(gql/ 디렉토리)은 뺀다.
// graphql 라이브러리는 GQL_LIB(기본 ~/.cache/jirum-release-tag/node_modules/graphql)에서 읽는다 — 워크트리에 node_modules 가 없어도 돈다.
import { createRequire } from 'node:module';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, relative } from 'node:path';

const require = createRequire(import.meta.url);
const lib = process.env.GQL_LIB || join(homedir(), '.cache/jirum-release-tag/node_modules/graphql');
const {
  buildClientSchema, getIntrospectionQuery, parse, validate, specifiedRules, NoUnusedFragmentsRule, Kind, visit,
} = require(lib);

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(name);
  if (i < 0) return undefined;
  const [v] = args.splice(i, 2).slice(1);
  return v;
};
const schemaUrl = opt('--schema');
const root = opt('--root') || '.';
const dirs = args;

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return name === 'node_modules' || name === 'gql' ? [] : walk(p);
    return /\.(ts|tsx)$/.test(name) && !/\.(test|spec|stories)\.tsx?$/.test(name) ? [p] : [];
  });

const stripComments = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .split('\n')
    .map((line) => (/^\s*\/\//.test(line) ? '' : line))
    .join('\n');

const OP = /^\s*(query|mutation|subscription|fragment)\b/;
const docs = [];
let skipped = 0;
for (const file of dirs.flatMap((d) => walk(join(root, d)))) {
  const src = stripComments(readFileSync(file, 'utf8'));
  const consts = new Map();
  for (const m of src.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=\s*`([^`$]*)`/g)) consts.set(m[1], m[2]);
  for (const m of src.matchAll(/`((?:[^`\\]|\\.)*)`/g)) {
    let body = m[1];
    if (!OP.test(body)) continue;
    let unresolved = false;
    body = body.replace(/\$\{\s*([A-Za-z_$][\w$]*)\s*\}/g, (_, name) => {
      if (consts.has(name)) return consts.get(name);
      unresolved = true;
      return '';
    });
    if (unresolved || /\$\{/.test(body)) {
      skipped++;
      continue;
    }
    docs.push({ file: relative(root, file), body });
  }
}

// 운영 API 는 x-introspection-key 가 맞을 때만 스키마를 내준다 — release-tag.py 가 scripts/introspection_key.py 로 넣어 준다.
const res = await fetch(schemaUrl, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    ...(process.env.GRAPHQL_INTROSPECTION_KEY
      ? { 'x-introspection-key': process.env.GRAPHQL_INTROSPECTION_KEY }
      : {}),
  },
  body: JSON.stringify({ query: getIntrospectionQuery({ inputValueDeprecation: true }) }), // deprecated 인자도 받으니 포함(빼면 오탐)
});
const intro = await res.json();
if (!intro.data) {
  console.error(`스키마 introspection 실패: ${res.status} ${JSON.stringify(intro).slice(0, 300)}`);
  process.exit(2);
}
const schema = buildClientSchema(intro.data);

// 문서끼리 fragment 를 나눠 쓰는 경우를 위해 전체 fragment 정의를 모아 둔다.
const fragments = new Map();
const parsed = [];
for (const d of docs) {
  try {
    const ast = parse(d.body);
    for (const def of ast.definitions) if (def.kind === Kind.FRAGMENT_DEFINITION) fragments.set(def.name.value, def);
    parsed.push({ ...d, ast });
  } catch (e) {
    parsed.push({ ...d, error: `구문 오류: ${e.message}` });
  }
}

const rules = specifiedRules.filter((r) => r !== NoUnusedFragmentsRule);
const errors = [];
for (const d of parsed) {
  const opName = d.ast?.definitions.find((x) => x.name)?.name?.value ?? '(이름 없음)';
  if (d.error) {
    errors.push({ file: d.file, op: opName, message: d.error });
    continue;
  }
  if (d.ast.definitions.every((x) => x.kind === Kind.FRAGMENT_DEFINITION)) continue; // fragment 는 쓰는 쪽에서 검증
  const have = new Set(d.ast.definitions.filter((x) => x.kind === Kind.FRAGMENT_DEFINITION).map((x) => x.name.value));
  const extra = [];
  const queue = [d.ast];
  while (queue.length) {
    visit(queue.shift(), {
      FragmentSpread(node) {
        const name = node.name.value;
        if (!have.has(name) && fragments.has(name)) {
          have.add(name);
          extra.push(fragments.get(name));
          queue.push(fragments.get(name));
        }
      },
    });
  }
  const doc = { ...d.ast, definitions: [...d.ast.definitions, ...extra] };
  for (const e of validate(schema, doc, rules)) errors.push({ file: d.file, op: opName, message: e.message });
}

console.log(JSON.stringify({ checked: parsed.length, skipped, errors }, null, 1));
