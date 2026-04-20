import {afterEach, describe, expect, test, vi} from 'vitest'
import * as roles from '../../../src/definers/roles.js'
import * as index from '../../../src/index.js'
import {defineBlueprintForResource} from '../../helpers/index.js'

describe('defineRole', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if validateRole returns an error', () => {
    const spy = vi.spyOn(index, 'validateRole').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      defineBlueprintForResource(
        roles.defineRole({name: 'role-name', title: 'Role Name', appliesToRobots: true, appliesToUsers: true, permissions: []}),
      ),
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

  test('should accept a valid configuration with a lifecycle', () => {
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

      lifecycle: {
        deletionPolicy: 'allow',
      },
    })

    expect(roleResource.lifecycle?.deletionPolicy).toStrictEqual('allow')
  })

  test('should accept a valid configuration with an attach lifecycle', () => {
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

      lifecycle: {
        ownershipAction: {
          type: 'attach',
          projectId: 'test-project',
          id: 'role-name',
        },
      },
    })

    if (roleResource.lifecycle?.ownershipAction?.type !== 'attach') {
      throw new Error('expected ownershipAction with type attach')
    }
    expect(roleResource.lifecycle?.ownershipAction?.projectId).toStrictEqual('test-project')
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

  test('should accept a valid configuration with a lifecycle', () => {
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

      lifecycle: {
        deletionPolicy: 'allow',
      },
    })

    expect(roleResource.lifecycle?.deletionPolicy).toStrictEqual('allow')
  })

  test('should accept a valid configuration with an attach lifecycle', () => {
    const roleResource = roles.defineProjectRole('test-project', {
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

      lifecycle: {
        ownershipAction: {
          type: 'attach',
          projectId: 'test-project',
          id: 'role-name',
        },
      },
    })

    if (roleResource.lifecycle?.ownershipAction?.type !== 'attach') {
      throw new Error('expected ownershipAction with type attach')
    }
    expect(roleResource.lifecycle?.ownershipAction?.projectId).toStrictEqual('test-project')
  })
})

describe('referenceRole', () => {
  test('should create a reference to a role', () => {
    const ref = roles.referenceRole({
      name: 'ref-resource',
      stack: 'test-stack',
      localName: 'local-resource',
    })

    expect(ref.name).toBe('local-resource')
    expect(ref.type).toBe('sanity.access.role')
    expect(ref.lifecycle?.ownershipAction?.type).toBe('reference')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.stack).toBe('test-stack')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.name).toBe('ref-resource')
  })

  test('should create a reference to a resource using the name as the local name', () => {
    const ref = roles.referenceRole({
      name: 'ref-resource',
      stack: 'test-stack',
    })

    expect(ref.name).toBe('ref-resource')
    expect(ref.type).toBe('sanity.access.role')
    expect(ref.lifecycle?.ownershipAction?.type).toBe('reference')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.stack).toBe('test-stack')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.name).toBe('ref-resource')
  })
})
