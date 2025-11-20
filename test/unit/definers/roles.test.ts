import {describe, expect, test} from 'vitest'
import {defineProjectRole, defineRole} from '../../../src/index.js'

describe('defineRole', () => {
  test('should throw an error if name is not provided', () => {
    // @ts-expect-error Missing required attributes
    expect(() => defineRole({})).toThrow(/name is required/)
  })

  test('should throw an error if title is not provided', () => {
    expect(() =>
      // @ts-expect-error Missing required attributes
      defineRole({
        name: 'role-name',
      }),
    ).toThrow(/Role title is required/)
  })

  test('should throw an error if title is too long', () => {
    expect(() =>
      // @ts-expect-error Missing required attributes
      defineRole({
        name: 'role-name',
        title: 'a'.repeat(101),
      }),
    ).toThrow(/Role title must be 100 characters or less/)
  })

  test('should throw an error if no permissions are provided', () => {
    expect(() =>
      defineRole({
        name: 'role-name',
        title: 'Role Name',
        appliesToRobots: true,
        appliesToUsers: true,
        permissions: [],
      }),
    ).toThrow(/Role must have at least one permission/)
  })

  test('should accept a valid configuration and set the type', () => {
    const roleResource = defineRole({
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

    expect(roleResource.type).toStrictEqual('sanity.access.role')
  })
})

describe('defineRole', () => {
  test('should accept a valid configuration and set the type', () => {
    const roleResource = defineProjectRole('projectId', {
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

    expect(roleResource.type).toStrictEqual('sanity.access.role')
    expect(roleResource.resourceType).toStrictEqual('project')
    expect(roleResource.resourceId).toStrictEqual('projectId')
  })
})
