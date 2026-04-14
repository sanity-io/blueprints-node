import {afterEach, describe, expect, test, vi} from 'vitest'
import * as projects from '../../../src/definers/projects.js'
import * as index from '../../../src/index.js'
import {defineBlueprintForResource} from '../../helpers/index.js'

vi.mock(import('../../../src/index.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    validateBlueprint: vi.fn(() => []),
  }
})

describe('defineProject', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should accept a valid configuration and set the type', () => {
    const projectResource = projects.defineProject({
      name: 'project-name',
    })

    expect(projectResource.type).toStrictEqual('sanity.project')
    expect(projectResource.displayName).toStrictEqual('project-name')
  })

  test('should accept a valid configuration with a lifecycle', () => {
    const projectResource = projects.defineProject({
      name: 'project-name',

      lifecycle: {
        deletionPolicy: 'allow',
      },
    })

    expect(projectResource.lifecycle?.deletionPolicy).toStrictEqual('allow')
  })

  test('should accept a valid configuration with an attach lifecycle', () => {
    const projectResource = projects.defineProject({
      name: 'project-name',

      lifecycle: {
        ownershipAction: {
          type: 'attach',
          id: 'abcdefgh',
        },
      },
    })

    if (projectResource.lifecycle?.ownershipAction?.type !== 'attach') {
      throw new Error('expected ownershipAction with type attach')
    }
    expect(projectResource.lifecycle?.ownershipAction?.id).toStrictEqual('abcdefgh')
  })

  test('should throw if validateProject returns an error', () => {
    const spy = vi.spyOn(index, 'validateProject').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      defineBlueprintForResource(
        projects.defineProject({
          name: 'project-name',
        }),
      ),
    ).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })
})

describe('referenceProject', () => {
  test('should create a reference to a robot token', () => {
    const ref = projects.referenceProject({
      name: 'ref-resource',
      stack: 'test-stack',
      localName: 'local-resource',
    })

    expect(ref.name).toBe('local-resource')
    expect(ref.type).toBe('sanity.project')
    expect(ref.lifecycle?.ownershipAction?.type).toBe('reference')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.stack).toBe('test-stack')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.name).toBe('ref-resource')
  })

  test('should create a reference to a resource using the name as the local name', () => {
    const ref = projects.referenceProject({
      name: 'ref-resource',
      stack: 'test-stack',
    })

    expect(ref.name).toBe('ref-resource')
    expect(ref.type).toBe('sanity.project')
    expect(ref.lifecycle?.ownershipAction?.type).toBe('reference')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.stack).toBe('test-stack')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.name).toBe('ref-resource')
  })
})
