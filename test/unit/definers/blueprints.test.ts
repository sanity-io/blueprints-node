import {afterEach, describe, expect, test, vi} from 'vitest'
import * as blueprints from '../../../src/definers/blueprints.js'
import * as index from '../../../src/index.js'

vi.mock(import('../../../src/index.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    validateBlueprint: vi.fn(() => []),
  }
})

describe('defineBlueprint', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if validateBlueprint returns an error', () => {
    const spy = vi.spyOn(index, 'validateBlueprint').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() => blueprints.defineBlueprint({resources: []})).toThrow('this is a test')

    expect(spy).toHaveBeenCalledOnce()
  })

  test('should attach projectId and stackId to returned function', () => {
    const blueprint = blueprints.defineBlueprint({resources: [], projectId: 'test', stackId: 'test'})
    expect(blueprint.projectId).toEqual('test')
    expect(blueprint.stackId).toEqual('test')
  })
})
