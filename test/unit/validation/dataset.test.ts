import {afterEach, describe, expect, test, vi} from 'vitest'
import * as datasets from '../../../src/validation/datasets.js'
import * as index from '../../../src/index.js'

describe('defineDataset', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should accept a valid configuration', () => {
    const errors = datasets.validateDataset({
      name: 'dataset-name',
      type: 'sanity.project.dataset',
      aclMode: 'public',
    })

    expect(errors).toHaveLength(0)
  })

  test('should return an error if validateResource returns an error', () => {
    const spy = vi.spyOn(index, 'validateResource').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    const errors = datasets.validateDataset({
      name: 'dataset-name',
      type: 'sanity.project.dataset',
      aclMode: 'public',
    })

    expect(errors).toContainEqual({type: 'test', message: 'this is a test'})
    expect(spy).toHaveBeenCalledOnce()
  })

  test('should return an error if config is falsey', () => {
    const errors = datasets.validateDataset(undefined)
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Dataset config must be provided',
    })
  })

  test('should return an error if config is not an object', () => {
    const errors = datasets.validateDataset(1)
    expect(errors).toContainEqual({
      type: 'invalid_type',
      message: 'Dataset config must be an object',
    })
  })

  test('should return an error if name is not provided', () => {
    const errors = datasets.validateDataset({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Dataset name is required'})
  })

  test('should return an error if name is not a string', () => {
    const errors = datasets.validateDataset({name: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Dataset name must be a string'})
  })

  test('should return an error if type is not sanity.project.cors', () => {
    const errors = datasets.validateDataset({type: 'invalid'})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Dataset type must be `sanity.project.dataset`'})
  })

  test('should return an error if non-string aclMode is provided', () => {
    const errors = datasets.validateDataset({
      name: 'dataset-name',
      aclMode: 1,
    })
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Dataset aclMode must be one of `custom`, `public`, or `private`'})
  })

  test('should return an error if invalid aclMode is provided', () => {
    const errors = datasets.validateDataset({
      name: 'dataset-name',
      aclMode: 'invalid',
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Dataset aclMode must be one of `custom`, `public`, or `private`'})
  })

  test('should return an error if invalid project data type is provided', () => {
    const errors = datasets.validateDataset({
      name: 'dataset-name',
      project: 1,
    })
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Dataset project must be a string'})
  })
})
