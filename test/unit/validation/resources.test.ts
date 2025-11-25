import {describe, expect, test} from 'vitest'
import {validateResource} from '../../../src/index.js'

describe('validateResource', () => {
  test('should return an error if name is not provided', () => {
    const errors = validateResource({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: '`name` is required'})
  })

  test('should return an error if type is not provided', () => {
    const errors = validateResource({name: 'test'})
    expect(errors).toContainEqual({type: 'missing_parameter', message: '`type` is required'})
  })
})
