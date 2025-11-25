import {describe, expect, test} from 'vitest'
import {validateBlueprint} from '../../../src/index.js'

describe('validateBlueprint', () => {
  test('should return an error if resources is not an array', () => {
    // @ts-expect-error Intentionally wrong type
    const errors = validateBlueprint({resources: 'test'})
    expect(errors).toContainEqual({
      type: 'invalid_format',
      message: '`resources` must be an array',
    })
  })
})
