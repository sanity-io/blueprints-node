import {afterEach, describe, expect, test, vi} from 'vitest'
import * as fns from '../../../src/definers/functions.js'
import * as index from '../../../src/index.js'

vi.mock(import('../../../src/index.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    validateBlueprint: vi.fn(() => []),
  }
})

describe('defineFunction', () => {
  describe('happy paths', () => {
    test('should assign src based on name if not provided', () => {
      const fn = fns.defineFunction({name: 'test'})
      expect(fn.src).toEqual('functions/test')
    })

    test('should ignore invalid properties', () => {
      // @ts-expect-error Intentionally wrong type
      const fn = fns.defineFunction({name: 'test', invalid: 'invalid'})
      expect(Object.keys(fn)).not.toContain('invalid')
    })
  })
  describe('sad paths', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should throw an error if validateFunction returns an error', () => {
      const spy = vi.spyOn(index, 'validateFunction').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
      expect(() => fns.defineFunction({name: 'func-name'})).toThrow('this is a test')

      expect(spy).toHaveBeenCalledOnce()
    })
  })
})
describe('defineDocumentFunction', () => {
  describe('happy paths', () => {
    test('should create a default publish event with provided filter', () => {
      const fn = fns.defineDocumentFunction({name: 'test', event: {filter: '_type == "post"'}})
      expect(fn.event).toEqual({on: ['publish'], filter: '_type == "post"'})
    })

    test('should throw an error if event keys are defined using a mix of under the event object as well as at the top level', () => {
      expect(() =>
        fns.defineDocumentFunction({
          name: 'test',
          event: {on: ['publish']},
          filter: '_type == "post"',
        }),
      ).toThrowError(/`event` properties should be specified under the `event` key/i)
    })

    test('should create the event with publish if not provided', () => {
      const fn = fns.defineDocumentFunction({name: 'test', src: 'test.js'})
      expect(fn.event).toEqual({on: ['publish']})
    })

    test('should allow for creating events triggered on create, update and delete', () => {
      const fn = fns.defineDocumentFunction({name: 'test', src: 'test.js', event: {on: ['create', 'update', 'delete']}})
      expect(fn.event.on).toEqual(['create', 'update', 'delete'])
    })

    test('should allow for creating events with explicit include* toggles', () => {
      const fn = fns.defineDocumentFunction({
        name: 'test',
        src: 'test.js',
        event: {on: ['update'], includeAllVersions: true, includeDrafts: true},
      })
      expect(fn.event.includeDrafts).toEqual(true)
      expect(fn.event.includeAllVersions).toEqual(true)
    })

    test('should allow for creating events scoped to a specific dataset', () => {
      const fn = fns.defineDocumentFunction({
        name: 'test',
        src: 'test.js',
        event: {on: ['update'], resource: {type: 'dataset', id: 'myProject.myDataset'}},
      })
      expect(fn.event.resource?.type).toEqual('dataset')
      expect(fn.event.resource?.id).toEqual('myProject.myDataset')
    })

    test('should allow for creating events explicitly scoped to all datasets', () => {
      const fn = fns.defineDocumentFunction({
        name: 'test',
        src: 'test.js',
        event: {on: ['update'], resource: {type: 'dataset', id: 'myProject.*'}},
      })
      expect(fn.event.resource?.type).toEqual('dataset')
      expect(fn.event.resource?.id).toEqual('myProject.*')
    })
  })

  describe('sad paths', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should throw an error if validateDocumentFunction returns an error', () => {
      const spy = vi.spyOn(index, 'validateDocumentFunction').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
      expect(() => fns.defineDocumentFunction({name: 'test', event: {on: ['publish']}})).toThrow('this is a test')

      expect(spy).toHaveBeenCalledOnce()
    })
  })
})

describe('defineMediaLibraryAssetFunction', () => {
  const resource = {type: 'media-library' as const, id: 'ml12345'}
  describe('happy paths', () => {
    test('should create a default publish event with provided filter', () => {
      const event = {filter: '_type == "post"', resource}
      const fn = fns.defineMediaLibraryAssetFunction({
        name: 'test',
        event,
      })
      expect(fn.event.on).toEqual(['publish'])
      expect(fn.event.includeDrafts).toBeFalsy()
    })

    test('should create the event with publish if not provided', () => {
      const fn = fns.defineMediaLibraryAssetFunction({name: 'test', src: 'test.js', event: {resource}})
      expect(fn.event.on).toEqual(['publish'])
    })

    test('should allow for creating events triggered on create, update and delete', () => {
      const fn = fns.defineMediaLibraryAssetFunction({name: 'test', src: 'test.js', event: {on: ['create', 'update', 'delete'], resource}})
      expect(fn.event.on).toEqual(['create', 'update', 'delete'])
    })

    test('should allow for creating events with explicit include* toggles', () => {
      let fn = fns.defineMediaLibraryAssetFunction({
        name: 'test',
        src: 'test.js',
        event: {on: ['update'], includeDrafts: true, resource},
      })
      expect(fn.event.includeDrafts).toEqual(true)
      fn = fns.defineMediaLibraryAssetFunction({
        name: 'test',
        src: 'test.js',
        event: {on: ['update'], includeDrafts: false, resource},
      })
      expect(fn.event.includeDrafts).toEqual(false)
    })
  })

  describe('sad paths', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should throw an error if validateMediaLibraryAssetFunction returns an error', () => {
      const spy = vi.spyOn(index, 'validateMediaLibraryAssetFunction').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
      expect(() =>
        fns.defineMediaLibraryAssetFunction({name: 'test', event: {on: ['publish'], resource: {type: 'media-library', id: 'ml1234'}}}),
      ).toThrow('this is a test')

      expect(spy).toHaveBeenCalledOnce()
    })
  })
})

describe('defineScheduleFunction', () => {
  describe('happy paths', () => {
    test('should create a scheduled event with explicit cron fields', () => {
      const event = {minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'}
      const fn = fns.defineScheduleFunction({
        name: 'test',
        event,
      })
      expect(fn.event).toEqual({minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'})
    })

    test('should create a scheduled event with expression', () => {
      const event = {expression: '* * * * *'}
      const fn = fns.defineScheduleFunction({
        name: 'test',
        event,
      })
      expect(fn.event).toEqual({expression: '* * * * *'})
    })

    test('should create a scheduled function with optional timezone', () => {
      const event = {expression: '* * * * *'}
      const fn = fns.defineScheduleFunction({
        name: 'test',
        event,
        timezone: 'America/New_York',
      })
      expect(fn.timezone).toEqual('America/New_York')
    })

    test('should parse natural language expression to cron', () => {
      const fn = fns.defineScheduleFunction({
        name: 'test',
        event: {expression: 'every day at 9am'},
      })
      expect(fn.event).toEqual({expression: '0 9 * * *'})
    })

    test('should pass through valid cron expressions unchanged', () => {
      const fn = fns.defineScheduleFunction({
        name: 'test',
        event: {expression: '0 9 * * 1-5'},
      })
      expect(fn.event).toEqual({expression: '0 9 * * 1-5'})
    })

    test('should parse weekday natural language', () => {
      const fn = fns.defineScheduleFunction({
        name: 'test',
        event: {expression: 'weekdays at 8am'},
      })
      expect(fn.event).toEqual({expression: '0 8 * * 1-5'})
    })

    test('should parse specific weekday with time', () => {
      const fn = fns.defineScheduleFunction({
        name: 'test',
        event: {expression: 'fridays at 9am'},
      })
      expect(fn.event).toEqual({expression: '0 9 * * 5'})
    })

    test('should parse time of day period', () => {
      const fn = fns.defineScheduleFunction({
        name: 'test',
        event: {expression: 'fridays in the evening'},
      })
      expect(fn.event).toEqual({expression: '0 18 * * 5'})
    })

    test('should parse multiple weekdays', () => {
      const fn = fns.defineScheduleFunction({
        name: 'test',
        event: {expression: 'mon, wed, fri at 9am'},
      })
      expect(fn.event).toEqual({expression: '0 9 * * 1,3,5'})
    })

    test('should parse interval schedules', () => {
      const fn = fns.defineScheduleFunction({
        name: 'test',
        event: {expression: 'every 15 minutes'},
      })
      expect(fn.event).toEqual({expression: '*/15 * * * *'})
    })
  })

  describe('sad paths', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should throw an error if validateScheduleFunction returns an error', () => {
      const spy = vi.spyOn(index, 'validateScheduleFunction').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
      expect(() =>
        fns.defineScheduleFunction({name: 'test', event: {minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'}}),
      ).toThrow('this is a test')

      expect(spy).toHaveBeenCalledOnce()
    })
  })
})
