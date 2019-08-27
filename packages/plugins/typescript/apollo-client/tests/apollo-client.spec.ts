import { validateTs } from '@graphql-codegen/testing';
import { plugin, ApolloClientRawPluginConfig } from '../src/index';
import { parse, GraphQLSchema, buildClientSchema, buildASTSchema } from 'graphql';
import gql from 'graphql-tag';
import { Types, mergeOutputs } from '@graphql-codegen/plugin-helpers';
import { plugin as tsPlugin } from '../../typescript/src/index';
import { plugin as tsDocumentsPlugin } from '../../operations/src/index';
import { readFileSync } from 'fs';
import { DocumentMode } from '@graphql-codegen/visitor-plugin-common';

describe('Apollo Client', () => {
  const schema = buildClientSchema(JSON.parse(readFileSync('../../../../dev-test/githunt/schema.json').toString()));
  const basicDoc = parse(/* GraphQL */ `
    query test {
      feed {
        id
        commentCount
        repository {
          full_name
          html_url
          owner {
            avatar_url
          }
        }
      }
    }
  `);
  const mutationDoc = parse(/* GraphQL */ `
    mutation test($name: String) {
      submitRepository(repoFullName: $name) {
        id
      }
    }
  `);

  const subscriptionDoc = parse(/* GraphQL */ `
    subscription test($name: String) {
      commentAdded(repoFullName: $name) {
        id
      }
    }
  `);

  const validateTypeScript = async (output: Types.PluginOutput, testSchema: GraphQLSchema, documents: Types.DocumentFile[], config: any) => {
    const tsOutput = await tsPlugin(testSchema, documents, config, { outputFile: '' });
    const tsDocumentsOutput = await tsDocumentsPlugin(testSchema, documents, config, { outputFile: '' });
    const merged = mergeOutputs([tsOutput, tsDocumentsOutput, output]);
    validateTs(merged, undefined, true);
  };

  describe('Imports', () => {
    it('should import the ApolloClient dependency', async () => {
      const docs = [{ filePath: '', content: basicDoc }];
      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.tsx',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.prepend).toContain(`import * as ApolloClient from 'apollo-client';`);
      await validateTypeScript(content, schema, docs, {});
    });
  });

  describe('Query', () => {
    it('should generate queries for query documents', async () => {
      const documents = parse(/* GraphQL */ `
        query feed {
          feed {
            id
            commentCount
            repository {
              full_name
              html_url
              owner {
                avatar_url
              }
            }
          }
        }
      `);
      const docs = [{ filePath: '', content: documents }];

      const content = (await plugin(
        schema,
        docs,
        {},
        {
          outputFile: 'graphql.ts',
        }
      )) as Types.ComplexPluginOutput;

      expect(content.content).toBeSimilarStringTo(`
export const Query = async (client: ApolloClient.ApolloClient<any>, options: Omit<ApolloClient.QueryOptions, 'query'>) => (
  await client.query<FeedQuery, FeedQueryVariables>({
    query: FeedDocument,
    ...options,
  })
);`);
      await validateTypeScript(content, schema, docs, {});
    });
  });
});
