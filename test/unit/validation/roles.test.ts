import {afterEach, describe, expect, test, vi} from 'vitest'
import * as index from '../../../src/index.js'
import * as roles from '../../../src/validation/roles.js'

describe('validateRole', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should return an error if config is falsey', () => {
    const errors = roles.validateRole(undefined)
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Role config must be provided',
    })
  })

  test('should return an error if config is not an object', () => {
    const errors = roles.validateRole(1)
    expect(errors).toContainEqual({
      type: 'invalid_type',
      message: 'Role config must be an object',
    })
  })

  test('should return an error if name is not provided', () => {
    const errors = roles.validateRole({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Role name is required'})
  })

  test('should return an error if name is not a string', () => {
    const errors = roles.validateRole({name: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Role name must be a string'})
  })

  test('should return an error if type is not provided', () => {
    const errors = roles.validateRole({name: 'role-name'})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Role type is required'})
  })

  test('should return an error if type is not `sanity.access.role`', () => {
    const errors = roles.validateRole({name: 'role-name', type: 'invalid'})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Role type must be `sanity.access.role`'})
  })

  test('should return an error if title is not provided', () => {
    const errors = roles.validateRole({
      name: 'role-name',
    })
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Role title is required'})
  })

  test('should return an error if title is not a string', () => {
    const errors = roles.validateRole({title: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Role title must be a string'})
  })

  test('should return an error if title is too long', () => {
    const errors = roles.validateRole({
      name: 'role-name',
      title: 'a'.repeat(101),
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Role title must be 100 characters or less'})
  })

  test('should return an error if no permissions are provided', () => {
    const errors = roles.validateRole({
      name: 'role-name',
      title: 'Role Name',
      appliesToRobots: true,
      appliesToUsers: true,
      permissions: [],
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Role must have at least one permission'})
  })

  test('should return an error if validateResource returns an error', () => {
    const spy = vi.spyOn(index, 'validateResource').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    const errors = roles.validateRole({
      name: 'role-name',
      type: 'sanity.access.role',
      title: 'Role Name',
      appliesToRobots: true,
      appliesToUsers: true,
      permissions: [
        {
          name: 'role-name-read',
          action: 'read',
        },
      ],
    })

    expect(errors).toContainEqual({type: 'test', message: 'this is a test'})
    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration', () => {
    const errors = roles.validateRole({
      name: 'role-name',
      type: 'sanity.access.role',
      title: 'Role Name',
      appliesToRobots: true,
      appliesToUsers: true,
      permissions: [
        {
          name: 'role-name-read',
          action: 'read',
        },
      ],
    })

    expect(errors).toHaveLength(0)
  })
})

describe('validateProjectRole', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should require a resource type of `project`', () => {
    const errors = roles.validateProjectRole({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Role resource type must be `project`'})
  })

  test('should require resource type to be `project`', () => {
    const errors = roles.validateProjectRole({resourceType: 'invalid'})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Role resource type must be `project`'})
  })

  test('should require a resourceId', () => {
    const errors = roles.validateProjectRole({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Role resource ID is required'})
  })

  test('should require resourceId to be a string', () => {
    const errors = roles.validateProjectRole({resourceId: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Role resource ID must be a string'})
  })

  test('should return an error if validateResource returns an error', () => {
    const spy = vi.spyOn(index, 'validateResource').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    const errors = roles.validateProjectRole({
      name: 'role-name',
      type: 'sanity.access.role',
      title: 'Role Name',
      appliesToRobots: true,
      appliesToUsers: true,
      permissions: [
        {
          name: 'role-name-read',
          action: 'read',
        },
      ],
      resourceType: 'project',
      resourceId: 'test-project-id',
    })

    expect(errors).toContainEqual({type: 'test', message: 'this is a test'})
    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration', () => {
    const errors = roles.validateProjectRole({
      name: 'role-name',
      type: 'sanity.access.role',
      title: 'Role Name',
      appliesToRobots: true,
      appliesToUsers: true,
      permissions: [
        {
          name: 'role-name-read',
          action: 'read',
        },
      ],
      resourceType: 'project',
      resourceId: 'test-project-id',
    })

    expect(errors).toHaveLength(0)
  })
})
