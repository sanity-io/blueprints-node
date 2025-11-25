import {afterEach, describe, expect, test, vi} from 'vitest'
import * as roles from '../../../src/definers/roles.js'
import * as index from '../../../src/index.js'

describe('defineRole', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error validateRole returns an error', () => {
    const spy = vi.spyOn(index, 'validateRole').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      roles.defineRole({name: 'role-name', title: 'Role Name', appliesToRobots: true, appliesToUsers: true, permissions: []}),
    ).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration and set the type', () => {
    const roleResource = roles.defineRole({
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

describe('defineProjectRole', () => {
  test('should accept a valid configuration and set the type', () => {
    const roleResource = roles.defineProjectRole('projectId', {
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
