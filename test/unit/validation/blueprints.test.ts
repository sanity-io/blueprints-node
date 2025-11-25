import {describe, expect, test} from 'vitest'
import {validateBlueprint} from '../../../src/index.js'

describe('validateBlueprint', () => {
  test('should return an error if config is falsey', () => {
    const errors = validateBlueprint(undefined)
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'blueprint config must be provided',
    })
  })

  test('should return an error if config is not an object', () => {
    const errors = validateBlueprint(1)
    expect(errors).toContainEqual({
      type: 'invalid_type',
      message: 'blueprint config must be an object',
    })
  })

  test('should return an error if resources is not an array', () => {
    const errors = validateBlueprint({resources: 'test'})
    expect(errors).toContainEqual({
      type: 'invalid_format',
      message: '`resources` must be an array',
    })
  })
})
