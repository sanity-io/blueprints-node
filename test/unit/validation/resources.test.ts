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

  test('should return an error if lifecycle.ownershipAction is not an object', () => {
    const errors = validateResource({name: 'test', type: 'test', lifecycle: {ownershipAction: 1}})
    expect(errors).toContainEqual({type: 'invalid_type', message: '`ownershipAction` must be an object'})
  })

  test('should return an error if lifecycle.ownershipAction has no type', () => {
    const errors = validateResource({name: 'test', type: 'test', lifecycle: {ownershipAction: {}}})
    expect(errors).toContainEqual({type: 'missing_parameter', message: '`ownershipAction.type` is required'})
  })

  test('should return an error if lifecycle.ownershipAction.type is not a string', () => {
    const errors = validateResource({name: 'test', type: 'test', lifecycle: {ownershipAction: {type: 1}}})
    expect(errors).toContainEqual({type: 'invalid_type', message: '`ownershipAction.type` must be a string'})
  })

  test('should return an error if lifecycle.ownershipAction.type is not valid', () => {
    const errors = validateResource({name: 'test', type: 'test', lifecycle: {ownershipAction: {type: 'invalid'}}})
    expect(errors).toContainEqual({type: 'invalid_value', message: '`ownershipAction.type` must be one of attach, detach'})
  })

  test('should return an error if lifecycle.ownershipAction has no id', () => {
    const errors = validateResource({name: 'test', type: 'test', lifecycle: {ownershipAction: {type: 'attach'}}})
    expect(errors).toContainEqual({type: 'missing_parameter', message: '`ownershipAction.id` is required for attach'})
  })

  test('should return an error if lifecycle.ownershipAction.id is not a string', () => {
    const errors = validateResource({name: 'test', type: 'test', lifecycle: {ownershipAction: {type: 'attach', id: 1}}})
    expect(errors).toContainEqual({type: 'invalid_type', message: '`ownershipAction.id` must be a string'})
  })

  test('should return an error if lifecycle.ownershipAction has no projectId', () => {
    const errors = validateResource(
      {name: 'test', type: 'test', lifecycle: {ownershipAction: {type: 'attach', id: 'test-id'}}},
      {projectContained: true},
    )
    expect(errors).toContainEqual({type: 'missing_parameter', message: '`ownershipAction.projectId` is required for attach'})
  })

  test('should return an error if lifecycle.ownershipAction.projectId is not a string', () => {
    const errors = validateResource(
      {name: 'test', type: 'test', lifecycle: {ownershipAction: {type: 'attach', projectId: 1, id: 'test-id'}}},
      {projectContained: true},
    )
    expect(errors).toContainEqual({type: 'invalid_type', message: '`ownershipAction.projectId` must be a string'})
  })

  test('should return no errors for a valid resource', () => {
    const errors = validateResource({
      name: 'test',
      type: 'test',
      lifecycle: {
        deletionPolicy: 'allow',
        ownershipAction: {
          type: 'attach',
          id: 'test-id',
        },
      },
    })
    expect(errors).toHaveLength(0)
  })
})
