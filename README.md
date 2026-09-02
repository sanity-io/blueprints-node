# `@sanity/blueprints`

> [!IMPORTANT]
> This package is currently in beta and may change. Refer to the [CHANGELOG](./CHANGELOG.md) for details.

TypeScript helpers for defining and validating [Sanity Blueprints](https://www.sanity.io/docs/blueprints) — declarative infrastructure-as-code for your Sanity project.

## Installation

```bash
npm install @sanity/blueprints
```

## Usage

A blueprint is a module that declares the Sanity resources your project needs. Export it as the default from your blueprint file:

```ts
import {
  defineBlueprint,
  defineCorsOrigin,
  defineDocumentFunction,
  defineDocumentWebhook,
  defineRobotToken,
  defineRole,
} from '@sanity/blueprints'

export default defineBlueprint({
  resources: [
    defineCorsOrigin({
      name: 'localhost-origin',
      origin: 'http://localhost:3333',
      allowCredentials: true,
    }),

    defineDocumentFunction({
      name: 'on-publish',
      event: {
        on: ['create', 'update'],
        filter: "_type == 'product'",
        projection: '{_id, title, slug}',
      },
    }),

    defineDocumentWebhook({
      name: 'server-webhook',
      url: 'https://api.example.com/webhooks/sanity',
      on: ['create', 'update'],
      dataset: 'production',
      apiVersion: 'v2026-01-01',
    }),

    defineRobotToken({
      name: 'ci-robot',
      memberships: [{
        resourceType: 'project',
        resourceId: 'your-project-id',
        roleNames: ['developer'],
      }],
    }),
  ],
})
```

## Available resources

| Definer | Description |
|---|---|
| `defineBlueprint` | Top-level blueprint module containing resources |
| `defineDocumentFunction` | Function triggered by document events |
| `defineMediaLibraryAssetFunction` | Function triggered by media library events |
| `defineCorsOrigin` β | CORS origin allowing browser requests to your project |
| `defineDocumentWebhook` β | Webhook triggered by document changes |
| `defineRole` β | Custom role with permissions |
| `defineRobotToken` β | Robot token for automated access |
| `defineWorkflows` β | Editorial Workflows deployment declared as one resource |

Each definer validates its input at call time and returns a typed resource object. See the [reference docs](https://reference.sanity.io/_sanity/blueprints) for full configuration details and additional resource types.

`defineWorkflows` delegates Editorial Workflows validation and resource construction to `@sanity/workflow-blueprint`. The Blueprints API installs that package directly to register its `workflowProvider`; `@sanity/blueprints` remains the author-facing manifest package and does not duplicate or re-export the provider.

### Declare an Editorial Workflows runtime partition

An Editorial Workflows tag is part of the persisted runtime model, not a
deployment-environment flag or a Blueprints Stack alias. Definition IDs include
it, instances carry it, and engine reads and operations are scoped by it. With
`workflowResource`, the tag lets independent workflow groups share one dataset
and reuse definition names while engine operations remain in the selected
partition. It is logical runtime scoping, not a Content Lake authorization
boundary.

Declare that partition explicitly in the Workflows deployment passed to
`defineWorkflows`:

```ts
import {defineBlueprint, defineWorkflows} from '@sanity/blueprints'
import {newsroomWorkflows} from './workflows'

export default defineBlueprint({
  resources: [defineWorkflows(newsroomWorkflows)],
})
```

Each call emits one `sanity.workflow` resource targeting exactly one
`(workflowResource, tag)` partition. The provider uses that pair as its external
identity, preventing two Stacks from owning the same partition.

A Stack is the separate Blueprints ownership and reconciliation boundary for
the complete manifest. It is not persisted on workflow definitions or instances,
and the Workflows runtime does not receive it. Select the remote Stack only when
planning or deploying the already-declared manifest:

```sh
sanity blueprints deploy --stack editorial-platform
```

The Stack name does not select, rewrite, or infer a Workflows tag. A Stack may
intentionally contain several `sanity.workflow` resources for different tags;
in that case it owns every explicit partition in the manifest. Blueprints always
reconciles that complete resource set. Use
`sanity workflows deploy --only <name>` when intentionally deploying just one
definition through the direct Editorial Workflows CLI.

> [!WARNING]
> The Blueprints API must register `workflowProvider` from `@sanity/workflow-blueprint` before `blueprints deploy` can deploy `sanity.workflow` resources. Until that server rollout is complete, deploying this resource may fail the stack operation; use `sanity workflows deploy` instead.
