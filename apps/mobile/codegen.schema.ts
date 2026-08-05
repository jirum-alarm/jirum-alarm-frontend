import type {CodegenConfig} from '@graphql-codegen/cli';

// schema.graphql 갱신 전용 config. 평소 검증(`pnpm generate`)은 커밋된
// schema.graphql 을 읽으므로 네트워크를 타지 않는다 — 이 파일만 실제 API 를 물고,
// 스키마가 바뀌었을 때 사람이 직접 돌린다:
//
//   GRAPHQL_SCHEMA_URL=https://jirum-alarm.com/api/graphql pnpm generate:schema
//
// 기본값이 운영인 이유: dev(jirum-dev-api.kyojs.com)는 죽어 있다(404).
// 살아나면 env 로 가리키면 된다.
const config: CodegenConfig = {
  overwrite: true,
  schema:
    process.env.GRAPHQL_SCHEMA_URL ?? 'https://jirum-alarm.com/api/graphql',
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
