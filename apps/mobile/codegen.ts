import type {CodegenConfig} from '@graphql-codegen/cli';

// 스키마는 커밋된 ./schema.graphql 을 읽는다. dev API(jirum-dev-api.kyojs.com)를
// 직접 물고 있었더니 그 엔드포인트가 죽은 뒤로 CI(mobile-validation)가 태그마다
// "No response returned" 로 실패했다 — v1.13.121~128 8연속. 외부 의존을 끊으면
// 네트워크 상태와 무관하게 검증이 돈다.
//
// 스키마를 갱신할 때는 `pnpm generate:schema` 로 실제 API 에서 새로 받아
// 이 파일을 커밋한다 (schema-ast 출력을 이 config 에 두면 읽는 파일을 자기가
// 덮어써서 자기참조가 된다).
const config: CodegenConfig = {
  overwrite: true,
  schema: './schema.graphql',
  documents: ['./src/graphql/*.ts'],
  hooks: {afterOneFileWrite: ['prettier --write']},
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
