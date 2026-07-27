import {afterEach, describe, expect, test, vi} from 'vitest'
import {defineDocumentFunction} from '../../../../src/definers/functions/document.js'
import * as index from '../../../../src/index.js'
import {defineBlueprintForResource} from '../../../helpers/index.js'

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

    test('should allow for creating a function in a specific project', () => {
      const fn = defineDocumentFunction({
        name: 'test',
        src: 'test.js',
        event: {on: ['update']},
        project: 'projectId',
      })
      expect(fn.project).toEqual('projectId')
    })
  })

  describe('sad paths', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should throw an error if validateDocumentFunction returns an error', () => {
      const spy = vi.spyOn(index, 'validateDocumentFunction').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
      expect(() => defineBlueprintForResource(defineDocumentFunction({name: 'test', event: {on: ['publish']}}))).toThrow('this is a test')

      expect(spy).toHaveBeenCalledOnce()
    })
  })
})
