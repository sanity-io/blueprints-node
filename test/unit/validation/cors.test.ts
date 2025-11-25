import {describe, expect, test} from 'vitest'
import {validateCorsOrigin} from '../../../src/index.js'

describe('validateCorsOrigin', () => {
  test('should return an error if name is not provided', () => {
    // @ts-expect-error Missing required attributes
    const errors = validateCorsOrigin({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'CORS Origin name is required'})
  })

  test('should return an error if URL is not provided', () => {
    // @ts-expect-error Missing required attributes
    const errors = validateCorsOrigin({
      name: 'origin-name',
    })
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'CORS Origin URL is required'})
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
