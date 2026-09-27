import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  // dev API 는 운영보다 스키마가 뒤처져 있어(인자 누락 시 오퍼레이션이 조용히 드롭) 운영 스키마로 생성한다
  schema: 'https://jirum-api.kyojs.com/graphql',
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
    './schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
  },
};

export default config;
