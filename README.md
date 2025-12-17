# @sanity/blueprints

> [!IMPORTANT]  
> This package is currently in beta and may change. Refer to the [CHANGELOG](./CHANGELOG.md) for details.

Helper methods for building valid Sanity Blueprints.

## Usage

```ts
import {
  defineBlueprint, 
  defineDocumentFunction, 
  defineDocumentWebhook
} from '@sanity/blueprints'

export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      name: 'fancy-report-function',
      src: 'functions/create-fancy-report',
      memory: 2,
      timeout: 360,
      event: {
        on: ['create', 'update'],
        filter: "_type == 'customer'",
        projection: "{totalSpend, lastOrderDate}",
      },
      env: {
        currency: 'USD',
      },
    }),
    defineDocumentWebhook({
      name: 'notification-webhook',
      url: 'http://api.yourdomain.com/notifications/sanity',
      on: ['create'],
      dataset: 'production',
      apiVersion: 'v2025-12-17',
    })
  ],
})
```
