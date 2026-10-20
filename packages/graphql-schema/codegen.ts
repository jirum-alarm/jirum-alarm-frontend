import type { CodegenConfig } from '@graphql-codegen/cli';

// 운영 GraphQL 스키마 한 벌 — web·mobile codegen 이 모두 이 schema.graphql 을 읽는다.
// 평소 code-gen 은 커밋된 파일만 읽어 네트워크를 타지 않고, 갱신만 이 config 로 운영 API 를 문다:
//
//   GRAPHQL_INTROSPECTION_KEY=$(python3 scripts/introspection_key.py) pnpm --filter @jirum/graphql-schema refresh
//
// 운영이 기준인 이유: dev(jirum-dev-api.kyojs.com)는 스키마가 뒤처지거나 죽어 있다(404).
// API 는 x-introspection-key 가 맞을 때만 스키마를 내준다(2026-10-15). 어드민 오퍼레이션도 같은 스키마에 있다(어드민 레포 jirum-alarm-admin 은 자기 사본을 갱신한다).
// 다른 곳을 보려면 GRAPHQL_SCHEMA_URL.
const config: CodegenConfig = {
  overwrite: true,
  schema: {
    [process.env.GRAPHQL_SCHEMA_URL ?? 'https://jirum-api.kyojs.com/graphql']: {
      // deprecated 인자(products.categoryId 등)는 기본 introspection 에서 빠진다 — 운영 코드가 아직 쓰니 포함한다.
      inputValueDeprecation: true,
      headers: { 'x-introspection-key': process.env.GRAPHQL_INTROSPECTION_KEY ?? '' },
    },
  },
  generates: {
    './schema.graphql': {
      plugins: ['schema-ast'],
      config: { includeDirectives: true },
    },
  },
};
export default config;
