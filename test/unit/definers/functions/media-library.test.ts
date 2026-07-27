import {afterEach, describe, expect, test, vi} from 'vitest'
import {defineMediaLibraryAssetFunction} from '../../../../src/definers/functions/media-library.js'
import * as index from '../../../../src/index.js'
import {defineBlueprintForResource} from '../../../helpers/index.js'

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

    test('should allow for creating functions in a specific project', () => {
      const fn = defineMediaLibraryAssetFunction({
        name: 'test',
        src: 'test.js',
        event: {on: ['update'], resource},
        project: 'projectId',
      })
      expect(fn.project).toEqual('projectId')
    })
  })

  describe('sad paths', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should throw an error if validateMediaLibraryAssetFunction returns an error', () => {
      const spy = vi.spyOn(index, 'validateMediaLibraryAssetFunction').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
      expect(() =>
        defineBlueprintForResource(
          defineMediaLibraryAssetFunction({name: 'test', event: {on: ['publish'], resource: {type: 'media-library', id: 'ml1234'}}}),
        ),
      ).toThrow('this is a test')

      expect(spy).toHaveBeenCalledOnce()
    })
  })
})
