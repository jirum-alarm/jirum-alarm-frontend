import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  // 운영 스키마 한 벌(packages/graphql-schema)을 web·mobile 과 같이 읽는다 — 어드민 오퍼레이션도 그 안에 있다.
  // dev API 는 스키마가 뒤처져 쓰지 않는다. 스키마 갱신은 `pnpm --filter @jirum/graphql-schema refresh`.
  schema: '../../packages/graphql-schema/schema.graphql',
  documents: ['./src/graphql/*.ts'],
  hooks: { afterOneFileWrite: ['prettier --write'] },
  ignoreNoDocuments: true,
  generates: {
    './src/generated/gql/': {
      preset: 'client',
      config: {
        documentMode: 'string',
      },
    },
  },
};

export default config;
