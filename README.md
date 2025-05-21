# @sanity/blueprints

Helper methods for building valid Sanity Blueprints.

## Simple Example

```ts
import { defineBlueprint, defineFunction, defineResource } from '@sanity/blueprints'

export default defineBlueprint({
  resources: [
    defineFunction({ name: 'echo-fn' }),
    defineFunction({ name: 'do-maths' }),
    defineResource({ name: 'test-resource', type: 'test' }),
  ],
})
```
