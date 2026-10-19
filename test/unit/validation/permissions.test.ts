import {afterEach, describe, expect, test, vi} from 'vitest'
import * as index from '../../../src/index.js'
import * as permissions from '../../../src/validation/permissions.js'

const valid = {
  name: 'articles-only',
  type: 'sanity.access.permission',
  permissionType: 'sanity.document.filter.mode',
  config: {filter: '_type == "article"'},
}

describe('validatePermission', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should return an error if config is falsey', () => {
    const errors = permissions.validatePermission(undefined)
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Permission config must be provided'})
  })

  test('should return an error if config is not an object', () => {
    const errors = permissions.validatePermission(1)
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Permission config must be an object'})
  })

  test('should return no errors for a valid permission', () => {
    expect(permissions.validatePermission(valid)).toStrictEqual([])
  })

  test('should return no errors for a valid permission with all options', () => {
    const errors = permissions.validatePermission({
      ...valid,
      title: 'Articles only',
      description: 'Access to article documents',
      permissionType: 'sanity.document.filter',
      project: '$.resources.my-project.id',
    })
    expect(errors).toStrictEqual([])
  })

  test('should return an error if name is not provided', () => {
    const errors = permissions.validatePermission({...valid, name: undefined})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Permission name is required'})
  })

  test('should return an error if name is not a string', () => {
    const errors = permissions.validatePermission({...valid, name: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Permission name must be a string'})
  })

  for (const name of ['Articles', 'articles only', 'sanity-articles', 'res-articles']) {
    test(`should return an error for the name "${name}"`, () => {
      const errors = permissions.validatePermission({...valid, name})
      expect(errors).toContainEqual({
        type: 'invalid_format',
        message:
          'Permission name must only contain lowercase letters, numbers, hyphens, and underscores, and must not start with "sanity" or "res-"',
      })
    })
  }

  test('should return an error if type is not provided', () => {
    const {type: _type, ...withoutType} = valid
    const errors = permissions.validatePermission(withoutType)
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Permission type is required'})
  })

  test('should return an error if type is not `sanity.access.permission`', () => {
    const errors = permissions.validatePermission({...valid, type: 'sanity.access.role'})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Permission type must be `sanity.access.permission`'})
  })

  test('should return an error if title is not a string', () => {
    const errors = permissions.validatePermission({...valid, title: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Permission title must be a string'})
  })

  test('should return an error if title is empty', () => {
    const errors = permissions.validatePermission({...valid, title: ''})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Permission title must not be empty'})
  })

  test('should return an error if description is not a string', () => {
    const errors = permissions.validatePermission({...valid, description: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Permission description must be a string'})
  })

  test('should return an error if permissionType is not provided', () => {
    const errors = permissions.validatePermission({...valid, permissionType: undefined})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Permission permissionType is required'})
  })

  test('should return an error if permissionType is unknown', () => {
    const errors = permissions.validatePermission({...valid, permissionType: 'sanity.project.cors'})
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Permission permissionType must be one of sanity.document.filter, sanity.document.filter.mode',
    })
  })

  test('should return an error if config is not provided', () => {
    const errors = permissions.validatePermission({...valid, config: undefined})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Permission `config` is required'})
  })

  test('should return an error if config is not an object', () => {
    const errors = permissions.validatePermission({...valid, config: '_type == "article"'})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Permission `config` must be an object'})
  })

  test('should return an error if filter is not provided', () => {
    const errors = permissions.validatePermission({...valid, config: {filter: ''}})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Permission filter is required'})
  })

  test('should return an error if filter is not a string', () => {
    const errors = permissions.validatePermission({...valid, config: {filter: 1}})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Permission filter must be a string'})
  })

  test('should return an error if project is not a string', () => {
    const errors = permissions.validatePermission({...valid, project: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Permission project must be a string'})
  })

  test('should return an error if project is empty', () => {
    const errors = permissions.validatePermission({...valid, project: ''})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Permission project must not be empty'})
  })

  test('should return an error if validateResource returns an error', () => {
    const spy = vi.spyOn(index, 'validateResource').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    const errors = permissions.validatePermission(valid)
    expect(errors).toContainEqual({type: 'test', message: 'this is a test'})
    expect(spy).toHaveBeenCalledOnce()
  })
})
