import {describe, expect, test} from 'vitest'
import {validateRole} from '../../../src/index.js'

describe('validateRole', () => {
  test('should return an error if name is not provided', () => {
    // @ts-expect-error Missing required attributes
    const errors = validateRole({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Role name is required'})
  })

  test('should return an error if title is not provided', () => {
    // @ts-expect-error Missing required attributes
    const errors = validateRole({
      name: 'role-name',
    })
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Role title is required'})
  })

  test('should return an error if title is too long', () => {
    // @ts-expect-error Missing required attributes
    const errors = validateRole({
      name: 'role-name',
      title: 'a'.repeat(101),
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Role title must be 100 characters or less'})
  })

  test('should return an error if no permissions are provided', () => {
    const errors = validateRole({
      name: 'role-name',
      title: 'Role Name',
      appliesToRobots: true,
      appliesToUsers: true,
      permissions: [],
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Role must have at least one permission'})
  })

  test('should accept a valid configuration', () => {
    const errors = validateRole({
      name: 'role-name',
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
