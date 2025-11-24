import {describe, expect, test} from 'vitest'
import {validateDocumentFunction, validateFunction, validateMediaLibraryAssetFunction} from '../../../src/index.js'

describe('validateFunction', () => {
  describe('happy paths', () => {
    test('should accept a valid function', () => {
      const errors = validateFunction({name: 'test'})
      expect(errors).toHaveLength(0)
    })
  })
  describe('sad paths', () => {
    test('should return an error if name is not provided', () => {
      // @ts-expect-error name is required
      const errors = validateFunction({})
      expect(errors).toContainEqual({type: 'missing_parameter', message: '`name` is required'})
    })
    test('should validate the name when higher-level functions are called', () => {
      // @ts-expect-error name is required
      const docFnErrors = validateDocumentFunction({})
      expect(docFnErrors).toContainEqual({type: 'missing_parameter', message: '`name` is required'})
      // @ts-expect-error name is required
      const mlFnErrors = validateMediaLibraryAssetFunction({})
      expect(docFnErrors).toContainEqual({type: 'missing_parameter', message: '`name` is required'})
    })

    test('should return an error if memory is not a number', () => {
      // @ts-expect-error Intentionally wrong type
      const errors = validateFunction({name: 'test', memory: '1'})
      expect(errors).toContainEqual({type: 'invalid_type', message: '`memory` must be a number'})
    })

    test('should return an error if timeout is not a number', () => {
      // @ts-expect-error Intentionally wrong type
      const errors = validateFunction({name: 'test', timeout: '1'})
      expect(errors).toContainEqual({type: 'invalid_type', message: '`timeout` must be a number'})
    })
  })
})
describe('validateDocumentFunction', () => {
  describe('happy paths', () => {
    test('should accept a valid document function', () => {
      const errors = validateDocumentFunction({name: 'test', event: {filter: '_type == "post"'}})
      expect(errors).toHaveLength(0)
    })
  })
  describe('sad paths', () => {
    test('should return an error if event keys are defined using a mix of under the event object as well as at the top level', () => {
      const errors = validateDocumentFunction({
        name: 'test',
        event: {on: ['publish']},
        filter: '_type == "post"',
      })
      expect(errors).toContainEqual({
        type: 'invalid_property',
        message:
          '`event` properties should be specified under the `event` key - specifying them at the top level is deprecated. The following keys were specified at the top level: `filter`',
      })
    })

    test('should return an error if event.on is not an array', () => {
      // @ts-expect-error Intentionally wrong type
      const errors = validateDocumentFunction({name: 'test', event: {on: 'publish'}})
      expect(errors).toContainEqual({type: 'invalid_type', message: '`event.on` must be an array'})
    })

    test('should return an error if event.resource.type is empty or not dataset', () => {
      // @ts-expect-error Intentionally wrong type
      let errors = validateDocumentFunction({name: 'test', event: {on: ['update'], resource: {type: 'a', id: 'myProject.*'}}})
      expect(errors).toContainEqual({type: 'invalid_value', message: '`event.resource.type` must be "dataset"'})
      // @ts-expect-error Intentionally wrong type
      errors = validateDocumentFunction({name: 'test', event: {on: ['update'], resource: {id: 'myProject.*'}}})
      expect(errors).toContainEqual({type: 'invalid_value', message: '`event.resource.type` must be "dataset"'})
    })

    test('should return an error if event.resource.id is invalid', () => {
      let errors = validateDocumentFunction({name: 'test', event: {on: ['update'], resource: {type: 'dataset', id: 'notEnoughPeriods'}}})
      expect(errors).toContainEqual({
        type: 'invalid_format',
        message: '`event.resource.id` must be in the format <projectId>.<datasetName>',
      })

      errors = validateDocumentFunction({name: 'test', event: {on: ['update'], resource: {type: 'dataset', id: 'too.many.periods'}}})
      expect(errors).toContainEqual({
        type: 'invalid_format',
        message: '`event.resource.id` must be in the format <projectId>.<datasetName>',
      })

      // @ts-expect-error Intentionally wrong type
      errors = validateDocumentFunction({name: 'test', event: {on: ['update'], resource: {type: 'dataset'}}})
      expect(errors).toContainEqual({
        type: 'invalid_format',
        message: '`event.resource.id` must be in the format <projectId>.<datasetName>',
      })
    })
  })
})

describe('validateMediaLibraryAssetFunction', () => {
  const resource = {type: 'media-library' as const, id: 'ml12345'}
  describe('happy paths', () => {
    test('should accept a valid media library function', () => {
      const errors = validateMediaLibraryAssetFunction({
        name: 'test',
        event: {filter: '_type == "post"', resource},
      })
      expect(errors).toHaveLength(0)
    })
  })
  describe('sad paths', () => {
    test('should return an error if event.on is not an array', () => {
      // @ts-expect-error Intentionally wrong type
      const errors = validateMediaLibraryAssetFunction({name: 'test', event: {on: 'publish'}})
      expect(errors).toContainEqual({type: 'invalid_type', message: '`event.on` must be an array'})
    })

    test('should return an error if event.resource.type is empty or not media-library', () => {
      // @ts-expect-error Intentionally wrong type
      let errors = validateMediaLibraryAssetFunction({name: 'test', event: {on: ['update'], resource: {type: 'a', id: 'ml12345'}}})
      expect(errors).toContainEqual({type: 'invalid_value', message: '`event.resource.type` must be "media-library"'})

      // @ts-expect-error Intentionally wrong type
      errors = validateMediaLibraryAssetFunction({name: 'test', event: {on: ['update'], resource: {id: 'ml12345'}}})
      expect(errors).toContainEqual({type: 'invalid_value', message: '`event.resource.type` must be "media-library"'})
    })
  })
})
