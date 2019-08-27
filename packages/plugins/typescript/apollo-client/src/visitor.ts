import { ClientSideBaseVisitor, ClientSideBasePluginConfig, getConfigValue, LoadedFragment, OMIT_TYPE, DocumentMode } from '@graphql-codegen/visitor-plugin-common';
import { ApolloClientRawPluginConfig } from './index';
import * as autoBind from 'auto-bind';
import { OperationDefinitionNode, Kind } from 'graphql';
import { toPascalCase, Types } from '@graphql-codegen/plugin-helpers';
import { titleCase, camelCase, camel } from 'change-case';

export interface ApolloClientPluginConfig extends ClientSideBasePluginConfig {}

export class ApolloClientVisitor extends ClientSideBaseVisitor<ApolloClientRawPluginConfig, ApolloClientPluginConfig> {
  constructor(fragments: LoadedFragment[], rawConfig: ApolloClientRawPluginConfig, documents: Types.DocumentFile[]) {
    super(fragments, rawConfig, {});

    this._documents = documents;

    autoBind(this);
  }

  private imports = new Set<string>();

  private getApolloClientImport(): string {
    return `import * as ApolloClient from 'apollo-client';`;
  }

  public getImports(): string[] {
    const baseImports = super.getImports();
    const hasOperations = this._collectedOperations.length > 0;

    if (!hasOperations) {
      return baseImports;
    }

    return [...baseImports, ...Array.from(this.imports)];
  }

  private _buildQueryFn(node: OperationDefinitionNode, documentVariableName: string, operationResultType: string, operationVariablesTypes: string): string {
    if (node.operation === 'query') {
      this.imports.add(this.getApolloClientImport());
      return `
export const ${titleCase(node.operation)} = async (client: ApolloClient.ApolloClient<any>, options: Omit<ApolloClient.QueryOptions, 'query'>) => (
  await client.query<${operationResultType}, ${operationVariablesTypes}>({
    query: ${documentVariableName},
    ...options,
  })
);
      `;
    }
    return null;
  }

  protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string {
    const queryFn = this._buildQueryFn(node, documentVariableName, operationResultType, operationVariablesTypes);

    return [queryFn].filter(a => a).join('\n');
  }
}
