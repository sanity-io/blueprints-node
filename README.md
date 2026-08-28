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

### Select one Editorial Workflows tag

A Blueprint module may contain deployments for several environments, but each
plan or deploy should emit exactly one Editorial Workflows tag group. Require
`SANITY_WORKFLOW_TAG` while evaluating `sanity.blueprint.ts`, select matching
deployments, and pass each selected deployment to `defineWorkflows`:

```ts
import {defineBlueprint, defineWorkflows} from '@sanity/blueprints'
import {productionWorkflows, stagingWorkflows} from './workflows'

const workflowTag = process.env.SANITY_WORKFLOW_TAG

if (!workflowTag) {
  throw new Error('Set SANITY_WORKFLOW_TAG to the Editorial Workflows tag to deploy')
}

const deployments = [stagingWorkflows, productionWorkflows]
const selectedDeployments = deployments.filter(({tag}) => tag === workflowTag)

if (selectedDeployments.length === 0) {
  throw new Error(`No Editorial Workflows deployments use tag "${workflowTag}"`)
}

export default defineBlueprint({
  resources: selectedDeployments.map((deployment) => defineWorkflows(deployment)),
})
```

Pair that local selector with the intended remote Stack:

```sh
SANITY_WORKFLOW_TAG=production sanity blueprints deploy --stack production
```

The tag and Stack names do not have to match. `SANITY_WORKFLOW_TAG` selects the
Workflows resources emitted by the module; `--stack` independently selects the
remote Stack that receives the complete Blueprint.

> [!WARNING]
> The Blueprints API must register `workflowProvider` from `@sanity/workflow-blueprint` before `blueprints deploy` can deploy `sanity.workflow` resources. Until that server rollout is complete, deploying this resource may fail the stack operation; use `sanity workflows deploy` instead.
