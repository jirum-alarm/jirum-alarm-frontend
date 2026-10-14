import type { CodegenConfig } from '@graphql-codegen/cli';

// 스키마는 커밋된 ./schema.graphql 을 읽는다(apps/mobile 과 같은 방식). 예전엔 dev API 를 직접 물어서
// dev 스키마가 뒤처지면 운영에 있는 필드를 쓰는 오퍼레이션이 검증에 걸려 code-gen 자체를 못 돌렸다.
// 스키마 갱신: `pnpm generate:schema`(기본 운영) → schema.graphql 커밋.
const config: CodegenConfig = {
  overwrite: true,
  schema: './schema.graphql',
  documents: ['./src/graphql/*.ts', './src/shared/api/**/*.service.ts'],
  hooks: { afterOneFileWrite: ['prettier --write'] },
  ignoreNoDocuments: true,
  generates: {
    './src/shared/api/gql/': {
      preset: 'client',
      config: {
        documentMode: 'string',
      },
    },
  },
};
export default config;
