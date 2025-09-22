import {describe, expect, test} from 'vitest'
import {defineBlueprint, defineDocumentFunction, defineResource} from '../src/index.js'

describe('defineBlueprint', () => {
  test('should throw an error if resources is not an array', () => {
    // @ts-expect-error Intentionally wrong type
    expect(() => defineBlueprint({resources: 'test'})).toThrow('`resources` must be an array')
  })

  test('should attach projectId and stackId to returned function', () => {
    const blueprint = defineBlueprint({resources: [], projectId: 'test', stackId: 'test'})
    expect(blueprint.projectId).toEqual('test')
    expect(blueprint.stackId).toEqual('test')
  })
})

describe('defineFunction', () => {
  test('should throw an error if name is not provided', () => {
    expect(() => defineDocumentFunction({})).toThrow('`name` is required')
  })

  test('should create src if not provided', () => {
    const fn = defineDocumentFunction({name: 'test'})
    expect(fn.src).toEqual('functions/test')
  })

  test('should throw an error if memory is not a number', () => {
    // @ts-expect-error Intentionally wrong type
    expect(() => defineDocumentFunction({name: 'test', memory: '1'})).toThrow('`memory` must be a number')
  })

  test('should throw an error if timeout is not a number', () => {
    // @ts-expect-error Intentionally wrong type
    expect(() => defineDocumentFunction({name: 'test', timeout: '1'})).toThrow('`timeout` must be a number')
  })

  test('should throw an error if event.on is not an array', () => {
    expect(() =>
      // @ts-expect-error Intentionally wrong type
      defineDocumentFunction({name: 'test', event: {on: 'publish'}}),
    ).toThrow('`event.on` must be an array')
  })

  test('should throw an error if on is incorrect', () => {
    // @ts-expect-error Intentionally wrong type
    expect(() => defineDocumentFunction({name: 'test', on: 'publish'})).toThrow('`event.on` must be an array')
  })

  test('should create a default publish event with provided filter', () => {
    const fn = defineDocumentFunction({name: 'test', event: {filter: '_type == "post"'}})
    expect(fn.event).toEqual({on: ['publish'], filter: '_type == "post"'})
  })

  test('should throw an error if event keys are defined using a mix of under the event object as well as at the top level', () => {
    expect(() =>
      defineDocumentFunction({
        name: 'test',
        event: {on: ['publish']},
        filter: '_type == "post"',
      }),
    ).toThrowError(/`event` properties should be specified under the `event` key/i)
  })

  test('should ignore invalid properties', () => {
    // @ts-expect-error Intentionally wrong type
    const fn = defineDocumentFunction({name: 'test', invalid: 'invalid'})
    expect(Object.keys(fn)).not.toContain('invalid')
    expect(Object.keys(fn.event)).not.toContain('invalid')
  })

  test('should create the event with publish if not provided', () => {
    const fn = defineDocumentFunction({name: 'test', src: 'test.js'})
    expect(fn.event).toEqual({on: ['publish']})
  })

  test('should allow for creating events triggered on create, update and delete', () => {
    const fn = defineDocumentFunction({name: 'test', src: 'test.js', event: {on: ['create', 'update', 'delete']}})
    expect(fn.event.on).toEqual(['create', 'update', 'delete'])
  })

  test('should allow for creating events with explicit include* toggles', () => {
    const fn = defineDocumentFunction({
      name: 'test',
      src: 'test.js',
      event: {on: ['update'], includeAllVersions: true, includeDrafts: true},
    })
    expect(fn.event.includeDrafts).toEqual(true)
    expect(fn.event.includeAllVersions).toEqual(true)
  })

  test('should allow for creating events scoped to a specific dataset', () => {
    const fn = defineDocumentFunction({
      name: 'test',
      src: 'test.js',
      event: {on: ['update'], resource: {type: 'dataset', id: 'myProject.myDataset'}},
    })
    expect(fn.event.resource?.type).toEqual('dataset')
    expect(fn.event.resource?.id).toEqual('myProject.myDataset')
  })

  test('should allow for creating events explicitly scoped to all datasets', () => {
    const fn = defineDocumentFunction({
      name: 'test',
      src: 'test.js',
      event: {on: ['update'], resource: {type: 'dataset', id: 'myProject.*'}},
    })
    expect(fn.event.resource?.type).toEqual('dataset')
    expect(fn.event.resource?.id).toEqual('myProject.*')
  })

  test('should throw an error if event.resource.type is empty or not dataset', () => {
    // @ts-expect-error Intentionally wrong type
    expect(() => defineDocumentFunction({name: 'test', event: {on: ['update'], resource: {type: 'a', id: 'myProject.*'}}})).toThrow(
      '`event.resource.type` must be "dataset"',
    )
    // @ts-expect-error Intentionally wrong type
    expect(() => defineDocumentFunction({name: 'test', event: {on: ['update'], resource: {id: 'myProject.*'}}})).toThrow(
      '`event.resource.type` must be "dataset"',
    )
  })

  test('should throw an error if event.resource.id is invalid', () => {
    expect(() =>
      defineDocumentFunction({name: 'test', event: {on: ['update'], resource: {type: 'dataset', id: 'notEnoughPeriods'}}}),
    ).toThrow('`event.resource.id` must be in the format <projectId>.<datasetName>')
    expect(() =>
      defineDocumentFunction({name: 'test', event: {on: ['update'], resource: {type: 'dataset', id: 'too.many.periods'}}}),
    ).toThrow('`event.resource.id` must be in the format <projectId>.<datasetName>')
    // @ts-expect-error Intentionally wrong type
    expect(() => defineDocumentFunction({name: 'test', event: {on: ['update'], resource: {type: 'dataset'}}})).toThrow(
      '`event.resource.id` must be in the format <projectId>.<datasetName>',
    )
  })
})

describe('defineResource', () => {
  test('should throw an error if name is not provided', () => {
    expect(() => defineResource({})).toThrow('`name` is required')
  })

  test('should throw an error if type is not provided', () => {
    expect(() => defineResource({name: 'test'})).toThrow('`type` is required')
  })
})

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
