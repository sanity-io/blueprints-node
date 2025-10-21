import {describe, expect, test} from 'vitest'
import {defineProject} from '../../src/index.js'

describe('defineProject', () => {
  test('should throw an error if name is not provided', () => {
    // @ts-expect-error Missing name
    expect(() => defineProject({})).toThrow('`name` is required')
  })

  test('should throw an error if displayName is not provided', () => {
    // @ts-expect-error Missing displayName
    expect(() => defineProject({name: 'test-project'})).toThrow('`displayName` is required')
  })
})
