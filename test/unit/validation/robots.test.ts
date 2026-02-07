import {describe, expect, test} from 'vitest'
import {validateRobot} from '../../../src/validation/robots.js'
import {validateRobotToken} from '../../../src/validation/robotTokens.js'

describe('validateRobot', () => {
  test('should be a reference to validateRobotToken', () => {
    expect(validateRobot).toBe(validateRobotToken)
  })

  test('should return no errors for a valid configuration', () => {
    const errors = validateRobot({
      name: 'robot-name',
      type: 'sanity.access.robot',
      label: 'Robot label',
      memberships: [
        {
          resourceType: 'project',
          resourceId: 'test-project',
          roleNames: ['test-role'],
        },
      ],
    })

    expect(errors).toHaveLength(0)
  })
})
