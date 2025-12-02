import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'https://jirum-dev-api.kyojs.com/graphql',
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
