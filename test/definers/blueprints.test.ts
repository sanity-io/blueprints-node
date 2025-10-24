import {describe, expect, test} from 'vitest'
import {defineBlueprint} from '../../src/index.js'

describe('defineBlueprint', () => {
  test('should throw an error if resources is not an array', () => {
    // @ts-expect-error Intentionally wrong type
    expect(() => defineBlueprint({resources: 'test'})).toThrow('`resources` must be an array')
  })

  test('should attach projectId and stackId to returned function', () => {
    const blueprint = defineBlueprint({resources: [], projectId: 'test', stackId: 'test'})
    expect(blueprint.projectId).toEqual('test')
    expect(blueprint.stackId).toEqual('test')
  })
})
