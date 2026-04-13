import {afterEach, describe, expect, test, vi} from 'vitest'
import * as robotTokens from '../../../src/definers/robotTokens.js'
import * as index from '../../../src/index.js'
import {defineBlueprintForResource} from '../../helpers/index.js'

vi.mock(import('../../../src/index.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    validateBlueprint: vi.fn(() => []),
  }
})

describe('defineRobotToken', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should accept a valid configuration and set the type', () => {
    const resource = robotTokens.defineRobotToken({
      name: 'robot-name',
      memberships: [
        {
          resourceType: 'project',
          resourceId: 'test-project',
          roleNames: ['test-role'],
        },
      ],
    })

    expect(resource.type).toStrictEqual('sanity.access.robot')
    expect(resource.label).toStrictEqual('robot-name')
  })

  test('should accept a valid configuration with a lifecycle', () => {
    const resource = robotTokens.defineRobotToken({
      name: 'robot-name',
      memberships: [
        {
          resourceType: 'project',
          resourceId: 'test-project',
          roleNames: ['test-role'],
        },
      ],

      lifecycle: {
        deletionPolicy: 'allow',
      },
    })

    expect(resource.lifecycle?.deletionPolicy).toStrictEqual('allow')
  })

  test('should accept a valid configuration with an attach lifecycle', () => {
    const resource = robotTokens.defineRobotToken({
      name: 'robot-name',
      memberships: [
        {
          resourceType: 'project',
          resourceId: 'test-project',
          roleNames: ['test-role'],
        },
      ],

      lifecycle: {
        ownershipAction: {
          type: 'attach',
          projectId: 'test-project',
          id: 'robot-id',
        },
      },
    })

    if (resource.lifecycle?.ownershipAction?.type !== 'attach') {
      throw new Error('expected ownershipAction with type attach')
    }
    expect(resource.lifecycle?.ownershipAction?.projectId).toStrictEqual('test-project')
  })

  test('should throw if validateRobotToken returns an error', () => {
    const spy = vi.spyOn(index, 'validateRobotToken').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      defineBlueprintForResource(
        robotTokens.defineRobotToken({
          name: 'robot-name',
          memberships: [
            {
              resourceType: 'project',
              resourceId: 'test-project',
              roleNames: ['test-role'],
            },
          ],
        }),
      ),
    ).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })
})

describe('referenceRobotToken', () => {
  test('should create a reference to a robot token', () => {
    const ref = robotTokens.referenceRobotToken({
      name: 'ref-resource',
      stack: 'test-stack',
      localName: 'local-resource',
    })

    expect(ref.name).toBe('local-resource')
    expect(ref.type).toBe('sanity.access.robot')
    expect(ref.lifecycle?.ownershipAction?.type).toBe('reference')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.stack).toBe('test-stack')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.name).toBe('ref-resource')
  })

  test('should create a reference to a resource using the name as the local name', () => {
    const ref = robotTokens.referenceRobotToken({
      name: 'ref-resource',
      stack: 'test-stack',
    })

    expect(ref.name).toBe('ref-resource')
    expect(ref.type).toBe('sanity.access.robot')
    expect(ref.lifecycle?.ownershipAction?.type).toBe('reference')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.stack).toBe('test-stack')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.name).toBe('ref-resource')
  })
})
