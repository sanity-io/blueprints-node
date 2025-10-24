import {describe, expect, test} from 'vitest'
import {defineBlueprint, defineDocumentFunction, defineResource} from '../../src/index.js'

describe('README example', () => {
  test('should be valid', () => {
    const readmeExample = defineBlueprint({
      resources: [
        defineDocumentFunction({name: 'invalidate-cache', projection: '_id'}),
        defineDocumentFunction({
          name: 'send-email',
          filter: "_type == 'press-release'",
        }),
        defineDocumentFunction({
          name: 'Create Fancy Report',
          src: 'functions/create-fancy-report',
          memory: 2,
          timeout: 360,
          event: {
            on: ['publish'],
            filter: "_type == 'customer'",
            projection: 'totalSpend, lastOrderDate',
          },
          env: {
            currency: 'USD',
          },
        }),
        defineResource({name: 'test-resource', type: 'test'}),
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
        name: 'invalidate-cache',
        src: 'functions/invalidate-cache',
        event: {on: ['publish'], projection: '_id'},
        memory: undefined,
        timeout: undefined,
        env: undefined,
      },
      {
        type: 'sanity.function.document',
        name: 'send-email',
        src: 'functions/send-email',
        event: {on: ['publish'], filter: "_type == 'press-release'"},
        memory: undefined,
        timeout: undefined,
        env: undefined,
      },
      {
        type: 'sanity.function.document',
        name: 'Create Fancy Report',
        src: 'functions/create-fancy-report',
        memory: 2,
        timeout: 360,
        event: {
          on: ['publish'],
          filter: "_type == 'customer'",
          projection: 'totalSpend, lastOrderDate',
        },
        env: {
          currency: 'USD',
        },
      },
      {
        type: 'test',
        name: 'test-resource',
      },
    ])
  })
})
