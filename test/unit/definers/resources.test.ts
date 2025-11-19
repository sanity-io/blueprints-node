import {describe, expect, test} from 'vitest'
import {defineResource} from '../../../src/index.js'

describe('defineResource', () => {
  test('should throw an error if name is not provided', () => {
    expect(() => defineResource({})).toThrow('`name` is required')
  })

  test('should throw an error if type is not provided', () => {
    expect(() => defineResource({name: 'test'})).toThrow('`type` is required')
  })
})
