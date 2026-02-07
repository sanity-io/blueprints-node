import {afterEach, describe, expect, test, vi} from 'vitest'
import * as robotTokens from '../../../src/definers/robotTokens.js'
import * as index from '../../../src/index.js'

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

    expect(resource.lifecycle?.ownershipAction?.projectId).toStrictEqual('test-project')
  })

  test('should throw if validateRobotToken returns an error', () => {
    const spy = vi.spyOn(index, 'validateRobotToken').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
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
    ).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })
})
