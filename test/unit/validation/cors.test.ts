import {afterEach, describe, expect, test, vi} from 'vitest'
import * as cors from '../../../src/validation/cors.js'
import * as index from '../../../src/index.js'

describe('validateCorsOrigin', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should return an error if config is falsey', () => {
    const errors = cors.validateCorsOrigin(undefined)
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'CORS Origin config must be provided',
    })
  })

  test('should return an error if config is not an object', () => {
    const errors = cors.validateCorsOrigin(1)
    expect(errors).toContainEqual({
      type: 'invalid_type',
      message: 'CORS Origin config must be an object',
    })
  })

  test('should return an error if name is not provided', () => {
    const errors = cors.validateCorsOrigin({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'CORS Origin name is required'})
  })

  test('should return an error if name is not a string', () => {
    const errors = cors.validateCorsOrigin({name: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'CORS Origin name must be a string'})
  })

  test('should return an error if type is not sanity.project.cors', () => {
    const errors = cors.validateCorsOrigin({type: 'invalid'})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'CORS Origin type must be `sanity.project.cors`'})
  })

  test('should return an error if URL is not provided', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
    })
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'CORS Origin URL is required'})
  })

  test('should return an error if URL is not a string', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      origin: 1,
    })
    expect(errors).toContainEqual({type: 'invalid_type', message: 'CORS Origin URL must be a string'})
  })

  test('should return an error if project is not a string', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: 'http://localhost/',
      allowCredentials: true,
      project: 1,
    })
    expect(errors).toContainEqual({type: 'invalid_type', message: 'CORS Origin project must be a string'})
  })

  test('should return an error if validateResource returns an error', () => {
    const spy = vi.spyOn(index, 'validateResource').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: 'http://localhost/',
      allowCredentials: true,
      project: 'abcdefg',
    })
    expect(errors).toContainEqual({type: 'test', message: 'this is a test'})
    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: 'http://localhost/',
      allowCredentials: true,
      project: 'abcdefg',
    })

    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })
})
