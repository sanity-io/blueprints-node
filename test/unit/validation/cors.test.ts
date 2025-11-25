import {describe, expect, test} from 'vitest'
import {validateCorsOrigin} from '../../../src/index.js'

describe('validateCorsOrigin', () => {
  test('should return an error if config is falsey', () => {
    const errors = validateCorsOrigin(undefined)
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'CORS Origin config must be provided',
    })
  })

  test('should return an error if config is not an object', () => {
    const errors = validateCorsOrigin(1)
    expect(errors).toContainEqual({
      type: 'invalid_type',
      message: 'CORS Origin config must be an object',
    })
  })

  test('should return an error if name is not provided', () => {
    const errors = validateCorsOrigin({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'CORS Origin name is required'})
  })

  test('should return an error if name is not a string', () => {
    const errors = validateCorsOrigin({name: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'CORS Origin name must be a string'})
  })

  test('should return an error if URL is not provided', () => {
    const errors = validateCorsOrigin({
      name: 'origin-name',
    })
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'CORS Origin URL is required'})
  })

  test('should return an error if URL is not a string', () => {
    const errors = validateCorsOrigin({
      name: 'origin-name',
      origin: 1,
    })
    expect(errors).toContainEqual({type: 'invalid_type', message: 'CORS Origin URL must be a string'})
  })

  test('should accept a valid configuration', () => {
    const errors = validateCorsOrigin({
      name: 'origin-name',
      origin: 'http://localhost/',
      allowCredentials: true,
    })

    expect(errors).toHaveLength(0)
  })
})
