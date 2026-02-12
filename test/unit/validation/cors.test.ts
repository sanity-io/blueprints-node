import {afterEach, describe, expect, test, vi} from 'vitest'
import * as index from '../../../src/index.js'
import * as cors from '../../../src/validation/cors.js'

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

  test('should accept an reference for project', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: 'http://localhost/',
      project: '$.resources.new-project',
    })
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
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

  test('should return an error if origin does not include a protocol', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: 'example.com',
    })
    expect(errors).toContainEqual({type: 'invalid_format', message: 'CORS Origin must include a protocol (e.g. https://)'})
  })

  test('should return an error if origin is a bare domain with port', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: 'localhost:3000',
    })
    expect(errors).toContainEqual({type: 'invalid_format', message: 'CORS Origin must include a protocol (e.g. https://)'})
  })

  test('should accept an origin with http:// protocol', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: 'http://localhost/',
      project: 'abcdefg',
    })
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should accept an origin with https:// protocol', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: 'https://example.com',
      project: 'abcdefg',
    })
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should accept the wildcard origin *', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: '*',
      project: 'abcdefg',
    })
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should accept the null origin', () => {
    // no idea what the string "null" means, but the API accepts it
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: 'null',
      project: 'abcdefg',
    })
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should accept the file:/// wildcard origin', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: 'file:///*',
      project: 'abcdefg',
    })
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should accept wildcard hostname origins', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: 'https://*.example.com',
      project: 'abcdefg',
    })
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should accept wildcard port origins', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: 'http://localhost:*',
      project: 'abcdefg',
    })
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should skip origin validation when value is a $.values. reference', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: '$.values.my-origin',
      project: 'abcdefg',
    })
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should skip origin validation when value is a $.resources. reference', () => {
    const errors = cors.validateCorsOrigin({
      name: 'origin-name',
      type: 'sanity.project.cors',
      origin: '$.resources.my-origin',
      project: 'abcdefg',
    })
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
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
