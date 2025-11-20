import {describe, expect, test} from 'vitest'
import {defineDocumentFunction, defineFunction, defineMediaLibraryAssetFunction} from '../../../src/definers/functions.js'

describe('defineFunction', () => {
  describe('happy paths', () => {
    test('should assign src based on name if not provided', () => {
      const fn = defineFunction({name: 'test'})
      expect(fn.src).toEqual('functions/test')
    })

    test('should ignore invalid properties', () => {
      // @ts-expect-error Intentionally wrong type
      const fn = defineFunction({name: 'test', invalid: 'invalid'})
      expect(Object.keys(fn)).not.toContain('invalid')
    })
  })
  describe('sad paths', () => {
    test('should throw an error if name is not provided', () => {
      // @ts-expect-error name is required
      expect(() => defineFunction({})).toThrow('`name` is required')
    })

    test('should throw an error if memory is not a number', () => {
      // @ts-expect-error Intentionally wrong type
      expect(() => defineFunction({name: 'test', memory: '1'})).toThrow('`memory` must be a number')
    })

    test('should throw an error if timeout is not a number', () => {
      // @ts-expect-error Intentionally wrong type
      expect(() => defineFunction({name: 'test', timeout: '1'})).toThrow('`timeout` must be a number')
    })
  })
})
describe('defineDocumentFunction', () => {
  describe('happy paths', () => {
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
  })
  describe('sad paths', () => {
    test('should throw an error if event.on is not an array', () => {
      expect(() =>
        // @ts-expect-error Intentionally wrong type
        defineDocumentFunction({name: 'test', event: {on: 'publish'}}),
      ).toThrow('`event.on` must be an array')
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
})

describe('defineMediaLibraryAssetFunction', () => {
  const resource = {type: 'media-library' as const, id: 'ml12345'}
  describe('happy paths', () => {
    test('should create a default publish event with provided filter', () => {
      const event = {filter: '_type == "post"', resource}
      const fn = defineMediaLibraryAssetFunction({
        name: 'test',
        event,
      })
      expect(fn.event.on).toEqual(['publish'])
      expect(fn.event.includeDrafts).toBeFalsy()
    })

    test('should create the event with publish if not provided', () => {
      const fn = defineMediaLibraryAssetFunction({name: 'test', src: 'test.js', event: {resource}})
      expect(fn.event.on).toEqual(['publish'])
    })

    test('should allow for creating events triggered on create, update and delete', () => {
      const fn = defineMediaLibraryAssetFunction({name: 'test', src: 'test.js', event: {on: ['create', 'update', 'delete'], resource}})
      expect(fn.event.on).toEqual(['create', 'update', 'delete'])
    })

    test('should allow for creating events with explicit include* toggles', () => {
      let fn = defineMediaLibraryAssetFunction({
        name: 'test',
        src: 'test.js',
        event: {on: ['update'], includeDrafts: true, resource},
      })
      expect(fn.event.includeDrafts).toEqual(true)
      fn = defineMediaLibraryAssetFunction({
        name: 'test',
        src: 'test.js',
        event: {on: ['update'], includeDrafts: false, resource},
      })
      expect(fn.event.includeDrafts).toEqual(false)
    })
  })
  describe('sad paths', () => {
    test('should throw an error if event.on is not an array', () => {
      expect(() =>
        // @ts-expect-error Intentionally wrong type
        defineMediaLibraryAssetFunction({name: 'test', event: {on: 'publish'}}),
      ).toThrow('`event.on` must be an array')
    })

    test('should throw an error if event.resource.type is empty or not media-library', () => {
      // @ts-expect-error Intentionally wrong type
      expect(() => defineMediaLibraryAssetFunction({name: 'test', event: {on: ['update'], resource: {type: 'a', id: 'ml12345'}}})).toThrow(
        '`event.resource.type` must be "media-library"',
      )
      // @ts-expect-error Intentionally wrong type
      expect(() => defineMediaLibraryAssetFunction({name: 'test', event: {on: ['update'], resource: {id: 'ml12345'}}})).toThrow(
        '`event.resource.type` must be "media-library"',
      )
    })
  })
})
