import {describe, expect, test} from 'vitest'
import {validateResource} from '../../../src/index.js'

describe('validateResource', () => {
  test('should return an error if config is falsey', () => {
    const errors = validateResource(undefined)
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Resource config must be provided',
    })
  })

  test('should return an error if config is not an object', () => {
    const errors = validateResource(1)
    expect(errors).toContainEqual({
      type: 'invalid_type',
      message: 'Resource config must be an object',
    })
  })

  test('should return an error if name is not provided', () => {
    const errors = validateResource({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: '`name` is required'})
  })

  test('should return an error if name is not a string', () => {
    const errors = validateResource({name: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: '`name` must be a string'})
  })

  test('should return an error if type is not provided', () => {
    const errors = validateResource({name: 'test'})
    expect(errors).toContainEqual({type: 'missing_parameter', message: '`type` is required'})
  })

  test('should return an error if type is not a string', () => {
    const errors = validateResource({name: 'test', type: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: '`type` must be a string'})
  })

  test('should return an error if lifecycle is not an object', () => {
    const errors = validateResource({name: 'test', type: 'test', lifecycle: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: '`lifecycle` must be an object'})
  })

  test('should return an error if deletionPolicy is not a string', () => {
    const errors = validateResource({name: 'test', type: 'test', lifecycle: {deletionPolicy: 1}})
    expect(errors).toContainEqual({type: 'invalid_type', message: '`deletionPolicy` must be a string'})
  })

  test('should return an error if deletionPolicy is not a valid value', () => {
    const errors = validateResource({name: 'test', type: 'test', lifecycle: {deletionPolicy: 'invalid'}})
    expect(errors).toContainEqual({type: 'invalid_value', message: '`deletionPolicy` must be one of allow, retain, replace, protect'})
  })
})
