import type { CodegenConfig } from '@graphql-codegen/cli';

// schema.graphql 갱신 전용 config. 평소 검증(`pnpm generate`)은 커밋된
// schema.graphql 을 읽으므로 네트워크를 타지 않는다 — 이 파일만 실제 API 를 물고,
// 스키마가 바뀌었을 때 사람이 직접 돌린다:
//
//   GRAPHQL_INTROSPECTION_KEY=$(python3 ../../scripts/introspection_key.py) pnpm generate:schema
//
// API 는 x-introspection-key 가 맞을 때만 스키마를 내준다(2026-10-15). 웹 프록시(/api/graphql)는 이 헤더를
// 넘기지 않으므로 API 를 직접 문다. 다른 곳을 보려면 GRAPHQL_SCHEMA_URL.
//
// 기본값이 운영인 이유: dev(jirum-dev-api.kyojs.com)는 죽어 있다(404).
// 살아나면 env 로 가리키면 된다.
const config: CodegenConfig = {
  overwrite: true,
  // deprecated 인자(products.categoryId 등)는 기본 introspection 에서 빠진다 — 운영 코드가 아직 쓰니 포함한다.
  schema: {
    [process.env.GRAPHQL_SCHEMA_URL ?? 'https://jirum-api.kyojs.com/graphql']: {
      inputValueDeprecation: true,
      headers: { 'x-introspection-key': process.env.GRAPHQL_INTROSPECTION_KEY ?? '' },
    },
  },
  generates: {
    './schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
  },
};
export default config;
