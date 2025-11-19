import {describe, expect, test} from 'vitest'
import {defineBlueprint, defineDocumentFunction, defineDocumentWebhook} from '../../../src/index.js'

describe('README example', () => {
  test('should be valid', () => {
    const readmeExample = defineBlueprint({
      resources: [
        defineDocumentFunction({
          name: 'Create Fancy Report',
          src: 'functions/create-fancy-report',
          memory: 2,
          timeout: 360,
          event: {
            on: ['publish'],
            filter: "_type == 'customer'",
            projection: '{totalSpend, lastOrderDate}',
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
        }),
      ],
    })

    expect(readmeExample).toBeDefined()
    expect(readmeExample).toBeInstanceOf(Function)

    const blueprint = readmeExample({})
    expect(blueprint).toBeDefined()
    expect(blueprint.$schema).toBeDefined()
    expect(blueprint.blueprintVersion).toBeDefined()
    expect(blueprint.resources).toEqual([
      {
        type: 'sanity.function.document',
        name: 'Create Fancy Report',
        src: 'functions/create-fancy-report',
        memory: 2,
        timeout: 360,
        event: {
          on: ['publish'],
          filter: "_type == 'customer'",
          projection: '{totalSpend, lastOrderDate}',
        },
        env: {
          currency: 'USD',
        },
      },
      {
        dataset: 'production',
        displayName: 'notification-webhook',
        name: 'notification-webhook',
        on: ['create'],
        type: 'sanity.project.webhook',
        url: 'http://api.yourdomain.com/notifications/sanity',
      },
    ])
  })
})
