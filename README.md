# @sanity/blueprints

> [!IMPORTANT]  
> This package is currently in beta and may change. Refer to the [CHANGELOG](./CHANGELOG.md) for details.

Helper methods for building valid Sanity Blueprints.

## Installation

```bash
npm install @sanity/blueprints
```

## Usage

```ts
import {defineBlueprint, defineDocumentFunction, defineScheduleFunction} from '@sanity/blueprints'

export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      name: 'on-customer-change',
      src: 'functions/on-customer-change',
      memory: 2,
      timeout: 360,
      event: {
        on: ['create', 'update'],
        filter: "_type == 'customer'",
        projection: '{totalSpend, lastOrderDate}',
      },
      env: {
        CURRENCY: 'USD',
      },
    }),
    defineScheduleFunction({
      name: 'daily-report',
      src: 'functions/daily-report',
      memory: 2,
      timeout: 300,
      event: {
        expression: 'every day at 9am',
        timezone: 'America/New_York',
      },
      env: {
        REPORT_EMAIL: 'team@example.com',
      },
    }),
  ],
})
```

## Definers

- [defineBlueprint](#defineblueprint) - Create a blueprint module
- [defineDocumentFunction](#definedocumentfunction) - Function triggered by document events
- [defineScheduleFunction](#defineschedulefunction) - Function triggered on a schedule
- [defineMediaLibraryAssetFunction](#definemedialibraryassetfunction) - Function triggered by media library events
- [defineDocumentWebhook](#definedocumentwebhook) - Webhook triggered by document events
- [defineDataset](#definedataset) - Dataset resource
- [defineCorsOrigin](#definecorsorigin) - CORS origin resource
- [defineRole](#definerole) - Custom role with permissions
- [defineProjectRole](#defineprojectrole) - Project-scoped role
- [defineRobot](#definerobot) - Robot (service account)

### defineBlueprint

Creates a blueprint module with resources.

```ts
import {defineBlueprint} from '@sanity/blueprints'

export default defineBlueprint({
  resources: [
    // ... your resources
  ],
})
```

### defineDocumentFunction

Creates a function triggered by document events.

```ts
import {defineDocumentFunction} from '@sanity/blueprints'

defineDocumentFunction({
  name: 'on-order-created',
  src: 'functions/on-order-created',
  memory: 2,
  timeout: 360,
  event: {
    on: ['create', 'update', 'delete'],
    filter: "_type == 'order'",
    projection: '{total, items}',
    includeDrafts: false,
  },
  env: {
    API_URL: 'https://api.example.com',
  },
})
```

### defineScheduleFunction

Creates a function triggered on a schedule. Supports cron expressions or natural language.

```ts
import {defineScheduleFunction} from '@sanity/blueprints'

// Natural language schedule
defineScheduleFunction({
  name: 'daily-cleanup',
  event: {expression: 'every day at 9am'},
})

// Weekday schedules
defineScheduleFunction({
  name: 'weekday-report',
  event: {expression: 'weekdays at 8:30am'},
})

// Multiple days
defineScheduleFunction({
  name: 'team-sync',
  event: {expression: 'mon wed fri 9:00'},
})

// Intervals
defineScheduleFunction({
  name: 'health-check',
  event: {expression: 'every 15 minutes'},
})

// Standard cron expression
defineScheduleFunction({
  name: 'monthly-report',
  event: {expression: '0 9 1 * *'},
})

// Explicit cron fields
defineScheduleFunction({
  name: 'custom-schedule',
  event: {
    minute: '0',
    hour: '9',
    dayOfMonth: '*',
    month: '*',
    dayOfWeek: '1-5',
  },
})

// With timezone
defineScheduleFunction({
  name: 'daily-digest',
  event: {expression: 'every day at 6pm'},
  timezone: 'America/New_York',
})
```

**Supported natural language patterns:**
- `every minute`, `every 5 minutes`, `every hour`, `every hour at :30`
- `every day at 9am`, `daily 14:30`
- `at midnight`, `at noon`
- `every morning`, `every afternoon`, `every evening`
- `mondays at 9am`, `mon wed fri 9:00`
- `weekdays at 8am`, `weekends at 10am`
- `mon-fri 9am` (day ranges)
- `first of the month at 9am`, `on the 15th at noon`

### defineMediaLibraryAssetFunction

Creates a function triggered by media library asset events.

```ts
import {defineMediaLibraryAssetFunction} from '@sanity/blueprints'

defineMediaLibraryAssetFunction({
  name: 'on-asset-upload',
  event: {
    on: ['create'],
    resource: {type: 'media-library'},
  },
})
```

### defineDocumentWebhook

Creates a webhook triggered by document events.

```ts
import {defineDocumentWebhook} from '@sanity/blueprints'

defineDocumentWebhook({
  name: 'notify-backend',
  url: 'https://api.example.com/webhooks/sanity',
  on: ['create', 'update'],
  dataset: 'production',
  filter: "_type == 'order'",
  projection: '{_id, total}',
  apiVersion: 'v2025-01-01',
  httpMethod: 'POST',
  headers: {
    'X-Custom-Header': 'value',
  },
})
```

### defineDataset

Creates a dataset resource.

```ts
import {defineDataset} from '@sanity/blueprints'

defineDataset({
  name: 'production',
  aclMode: 'public',
})

defineDataset({
  name: 'staging',
  aclMode: 'private',
})
```

### defineCorsOrigin

Creates a CORS origin resource.

```ts
import {defineCorsOrigin} from '@sanity/blueprints'

defineCorsOrigin({
  name: 'production-app',
  origin: 'https://myapp.com',
  allowCredentials: true,
})

defineCorsOrigin({
  name: 'local-dev',
  origin: 'http://localhost:3000',
  allowCredentials: false,
})
```

### defineRole

Creates a custom role with permissions.

```ts
import {defineRole} from '@sanity/blueprints'

defineRole({
  name: 'content-editor',
  title: 'Content Editor',
  permissions: [
    {type: 'sanity.document.*', grant: 'read'},
    {type: 'sanity.document.create', grant: 'create', filter: "_type == 'post'"},
    {type: 'sanity.document.update', grant: 'update', filter: "_type == 'post'"},
  ],
})
```

### defineProjectRole

Creates a project-scoped role.

```ts
import {defineProjectRole} from '@sanity/blueprints'

defineProjectRole('your-project-id', {
  name: 'viewer',
  title: 'Viewer',
  permissions: [
    {type: 'sanity.document.*', grant: 'read'},
  ],
})
```

### defineRobot

Creates a robot (service account) with role memberships.

```ts
import {defineRobot} from '@sanity/blueprints'

defineRobot({
  name: 'ci-robot',
  label: 'CI/CD Robot',
  memberships: [
    {
      resourceType: 'project',
      resourceId: 'your-project-id',
      roleNames: ['editor'],
    },
  ],
})
```

## Full Example

```ts
import {
  defineBlueprint,
  defineCorsOrigin,
  defineDataset,
  defineDocumentFunction,
  defineDocumentWebhook,
  defineRole,
  defineRobot,
  defineScheduleFunction,
} from '@sanity/blueprints'

export default defineBlueprint({
  resources: [
    // Datasets
    defineDataset({name: 'production', aclMode: 'public'}),
    defineDataset({name: 'staging', aclMode: 'private'}),

    // CORS
    defineCorsOrigin({name: 'app', origin: 'https://myapp.com', allowCredentials: true}),

    // Functions
    defineDocumentFunction({
      name: 'on-order',
      event: {on: ['create'], filter: "_type == 'order'"},
    }),
    defineScheduleFunction({
      name: 'daily-sync',
      event: {expression: 'every day at 6am'},
    }),

    // Webhooks
    defineDocumentWebhook({
      name: 'notify',
      url: 'https://api.example.com/webhook',
      on: ['create', 'update'],
      dataset: 'production',
    }),

    // Access control
    defineRole({
      name: 'content-editor',
      title: 'Content Editor',
      permissions: [{type: 'sanity.document.*', grant: 'read'}],
    }),
    defineRobot({
      name: 'deploy-bot',
      label: 'Deploy Bot',
      memberships: [{resourceType: 'project', resourceId: 'proj123', roleNames: ['editor']}],
    }),
  ],
})
```
