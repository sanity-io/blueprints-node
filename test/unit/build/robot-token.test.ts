import {describe, expect, test} from 'vitest'

import {RobotTokenHandle} from '../../../src/build/robot-token.js'

describe('RobotTokenHandle', () => {
  const robotToken = new RobotTokenHandle('ci-robot')

  test('token references the token', () => {
    expect(robotToken.token).toBe('$.resources.ci-robot.token')
  })
})
