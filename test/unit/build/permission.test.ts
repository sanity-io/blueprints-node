import {describe, expect, test} from 'vitest'

import {PermissionHandle} from '../../../src/build/permission.js'

describe('PermissionHandle', () => {
  const permission = new PermissionHandle('articles-only')

  test('name references the permission name', () => {
    expect(permission.name).toBe('$.resources.articles-only.name')
  })
})
