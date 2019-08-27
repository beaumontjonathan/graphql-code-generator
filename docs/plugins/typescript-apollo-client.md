---
id: typescript-apollo-client
title: TypeScript Apollo Client
---

This plugin generates React Apollo helper functions with TypeScript typings. It extends the basic TypeScript template [`@graphql-codegen/typescript`](typescript) and thus shares a similar configuration.

## Installation

    $ yarn add @graphql-codegen/typescript-apollo-client @types/graphql

## Usage

For the given input:

```graphql
query Test {
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
```

We can use the generated code like this:

```ts
const {
  data,
  loading,
  error,
} = queryTest();
```

## Configuration

{@import: ../docs/generated-config/base-visitor.md}
{@import: ../docs/generated-config/client-side-base-visitor.md}
<!-- {@import: ../docs/generated-config/typescript-apollo-client.md} -->
