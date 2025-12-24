import {afterEach, describe, expect, test, vi} from 'vitest'
import * as robots from '../../../src/definers/robots.js'
import * as index from '../../../src/index.js'

vi.mock(import('../../../src/index.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    validateBlueprint: vi.fn(() => []),
  }
})

describe('defineRobot', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should accept a valid configuration and set the type', () => {
    const datasetResource = robots.defineRobot({
      name: 'robot-name',
      memberships: [
        {
          resourceType: 'project',
          resourceId: 'test-project',
          roleNames: ['test-role'],
        },
      ],
    })

    expect(datasetResource.type).toStrictEqual('sanity.access.robot')
    expect(datasetResource.label).toStrictEqual('robot-name')
  })

  test('should throw if validateRobot returns an error', () => {
    const spy = vi.spyOn(index, 'validateRobot').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      robots.defineRobot({
        name: 'dataset-name',
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
