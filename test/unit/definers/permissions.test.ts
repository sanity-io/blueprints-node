import {afterEach, describe, expect, test, vi} from 'vitest'
import * as permissions from '../../../src/definers/permissions.js'
import * as index from '../../../src/index.js'
import {defineBlueprintForResource} from '../../helpers/index.js'

describe('definePermission', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if validatePermission returns an error', () => {
    const spy = vi.spyOn(index, 'validatePermission').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() => defineBlueprintForResource(permissions.definePermission({name: 'articles-only', filter: '_type == "article"'}))).toThrow(
      /this is a test/,
    )

    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration and set the type', () => {
    const permissionResource = permissions.definePermission({
      name: 'articles-only',
      filter: '_type == "article"',
    })

    expect(permissionResource).toStrictEqual({
      name: 'articles-only',
      type: 'sanity.access.permission',
      filter: '_type == "article"',
    })
  })

  test('should keep all options', () => {
    const permissionResource = permissions.definePermission({
      name: 'articles-only',
      title: 'Articles only',
      description: 'Access to article documents',
      permissionType: 'sanity.document.filter',
      filter: '_type == "article"',
      project: '$.resources.my-project.id',
      lifecycle: {
        deletionPolicy: 'retain',
      },
    })

    expect(permissionResource).toStrictEqual({
      name: 'articles-only',
      type: 'sanity.access.permission',
      title: 'Articles only',
      description: 'Access to article documents',
      permissionType: 'sanity.document.filter',
      filter: '_type == "article"',
      project: '$.resources.my-project.id',
      lifecycle: {
        deletionPolicy: 'retain',
      },
    })
  })

  test('should accept a valid configuration with an attach lifecycle', () => {
    const permissionResource = permissions.definePermission({
      name: 'articles-only',
      filter: '_type == "article"',
      lifecycle: {
        ownershipAction: {
          type: 'attach',
          projectId: 'test-project',
          id: 'articles-only',
        },
      },
    })

    if (permissionResource.lifecycle?.ownershipAction?.type !== 'attach') {
      throw new Error('expected ownershipAction with type attach')
    }
    expect(permissionResource.lifecycle?.ownershipAction?.projectId).toStrictEqual('test-project')
  })
})
