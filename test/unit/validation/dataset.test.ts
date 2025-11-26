import {describe, expect, test} from 'vitest'
import {validateDataset} from '../../../src/index.js'

describe('defineDataset', () => {
  test('should accept a valid configuration', () => {
    const errors = validateDataset({
      name: 'dataset-name',
      type: 'sanity.project.dataset',
      aclMode: 'public',
    })

    expect(errors).toHaveLength(0)
  })

  test('should return an error if config is falsey', () => {
    const errors = validateDataset(undefined)
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Dataset config must be provided',
    })
  })

  test('should return an error if config is not an object', () => {
    const errors = validateDataset(1)
    expect(errors).toContainEqual({
      type: 'invalid_type',
      message: 'Dataset config must be an object',
    })
  })

  test('should return an error if type is not sanity.project.cors', () => {
    const errors = validateDataset({type: 'invalid'})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Dataset type must be `sanity.project.dataset`'})
  })

  test('should return an error if non-string aclMode is provided', () => {
    const errors = validateDataset({
      name: 'dataset-name',
      aclMode: 1,
    })
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Dataset aclMode must be one of `custom`, `public`, or `private`'})
  })

  test('should return an error if invalid aclMode is provided', () => {
    const errors = validateDataset({
      name: 'dataset-name',
      aclMode: 'invalid',
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Dataset aclMode must be one of `custom`, `public`, or `private`'})
  })

  test('should return an error if invalid project data type is provided', () => {
    const errors = validateDataset({
      name: 'dataset-name',
      project: 1,
    })
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Dataset project must be a string'})
  })
})
