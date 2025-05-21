import { describe, expect, test } from 'vitest'
import { defineBlueprint, defineFunction, defineResource } from '../src/index.js'

describe('defineBlueprint', () => {
  test('should throw an error if resources is not provided', () => {
    expect(() => defineBlueprint({})).toThrow('`resources` is required')
  })
})

describe('defineFunction', () => {
  test('should throw an error if name is not provided', () => {
    expect(() => defineFunction({})).toThrow('`name` is required')
  })

  test('should throw an error if event.on is not provided', () => {
    // @ts-expect-error Intentionally wrong type
    expect(() => defineFunction({ name: 'test', src: 'test.js', event: {} })).toThrow('`event.on` is required')
  })

  test('should throw an error if event.on is not an array', () => {
    // @ts-expect-error Intentionally wrong type
    expect(() => defineFunction({ name: 'test', src: 'test.js', event: { on: 'publish' } })).toThrow('`event.on` must be an array')
  })

  test('should throw an error if event.on does not include publish', () => {
    expect(() => defineFunction({ name: 'test', src: 'test.js', event: { on: ['create'] } })).toThrow('`event.on` must include `publish`')
  })

  test('should create src if not provided', () => {
    const fn = defineFunction({ name: 'test' })
    expect(fn.src).toEqual('functions/test')
  })

  test('should create the event with publish if not provided', () => {
    const fn = defineFunction({ name: 'test', src: 'test.js' })
    expect(fn.event).toEqual({ on: ['publish'] })
  })

  test('should throw an error if memory is not a number', () => {
    // @ts-expect-error Intentionally wrong type
    expect(() => defineFunction({ name: 'test', src: 'test.js', memory: '1' })).toThrow('`memory` must be a number')
  })

  test('should throw an error if memory is not between 1 and 10', () => {
    expect(() => defineFunction({ name: 'test', src: 'test.js', memory: 11 })).toThrow('`memory` must be between 1 and 10')
  })

  test('should throw an error if timeout is not a number', () => {
    // @ts-expect-error Intentionally wrong type
    expect(() => defineFunction({ name: 'test', src: 'test.js', timeout: '1' })).toThrow('`timeout` must be a number')
  })

  test('should throw an error if timeout is not between 1 and 900', () => {
    expect(() => defineFunction({ name: 'test', src: 'test.js', timeout: 901 })).toThrow('`timeout` must be between 1 and 900')
  })
})

describe('defineResource', () => {
  test('should throw an error if name is not provided', () => {
    expect(() => defineResource({})).toThrow('`name` is required')
  })
})

describe('README example', () => {
  test('should be valid', () => {
    const validBlueprint = defineBlueprint({
      resources: [
        defineFunction({ name: 'echo-fn' }),
        defineFunction({ name: 'do-maths' }),
        defineResource({ name: 'test-resource', type: 'test' }),
      ],
    })

    expect(validBlueprint).toBeDefined()
    expect(validBlueprint).toBeInstanceOf(Function)

    const blueprint = validBlueprint({})
    expect(blueprint).toBeDefined()
    expect(blueprint.$schema).toBeDefined()
    expect(blueprint.blueprintVersion).toBeDefined()
    expect(blueprint.resources).toEqual([
      {
        type: 'sanity.function.document',
        name: 'echo-fn',
        src: 'functions/echo-fn',
        event: { on: ['publish'] },
        memory: undefined,
        timeout: undefined,
        env: undefined,
      },
      {
        type: 'sanity.function.document',
        name: 'do-maths',
        src: 'functions/do-maths',
        event: { on: ['publish'] },
        memory: undefined,
        timeout: undefined,
        env: undefined,
      },
      {
        type: 'test',
        name: 'test-resource',
      },
    ])
  })
})
