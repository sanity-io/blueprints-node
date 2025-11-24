import {describe, expect, test} from 'vitest'
import {validateDataset} from '../../../src/index.js'

describe('defineDataset', () => {
  test('should accept a valid configuration', () => {
    const errors = validateDataset({
      name: 'dataset-name',
      aclMode: 'public',
    })

    expect(errors).toHaveLength(0)
  })

  test('should return an error if invalid aclMode is provided', () => {
    const errors = validateDataset({
      name: 'dataset-name',
      // @ts-expect-error Invalid value for testing
      aclMode: 'invalid',
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'aclMode must be one of `custom`, `public`, or `private`'})
  })

  test('should return an error if invalid project data type is provided', () => {
    const errors = validateDataset({
      name: 'dataset-name',
      // @ts-expect-error Invalid value for testing
      project: 1,
    })
    expect(errors).toContainEqual({type: 'invalid_type', message: 'project must be a string'})
  })
})
