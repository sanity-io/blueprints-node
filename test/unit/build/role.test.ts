import {describe, expect, test} from 'vitest'

import {RoleHandle} from '../../../src/build/role.js'

describe('RoleHandle', () => {
  const role = new RoleHandle('ci-deploy-role')

  test('name references the role name', () => {
    expect(role.name).toBe('$.resources.ci-deploy-role.name')
  })
})
