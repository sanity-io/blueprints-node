import {describe, expect, test} from 'vitest'
import {defineRobot} from '../../../src/definers/robots.js'
import {defineRobotToken} from '../../../src/definers/robotTokens.js'

describe('defineRobot', () => {
  test('should be a reference to defineRobotToken', () => {
    expect(defineRobot).toBe(defineRobotToken)
  })

  test('should produce a valid robot token resource', () => {
    const resource = defineRobot({
      name: 'my-robot',
      memberships: [
        {
          resourceType: 'project',
          resourceId: 'test-project',
          roleNames: ['test-role'],
        },
      ],
    })

    expect(resource.type).toStrictEqual('sanity.access.robot')
    expect(resource.label).toStrictEqual('my-robot')
  })
})
