import {afterEach, describe, expect, test, vi} from 'vitest'
import * as fns from '../../../../src/definers/functions/index.js'
import * as index from '../../../../src/index.js'
import {defineBlueprintForResource} from '../../../helpers/index.js'

vi.mock(import('../../../../src/index.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    validateBlueprint: vi.fn(() => []),
  }
})

describe('defineFunction', () => {
  describe('happy paths', () => {
    test('should assign src based on name if not provided', () => {
      const fn = fns.defineFunction({name: 'test'})
      expect(fn.src).toEqual('functions/test')
    })

    test('should ignore invalid properties', () => {
      // @ts-expect-error Intentionally wrong type
      const fn = fns.defineFunction({name: 'test', invalid: 'invalid'})
      expect(Object.keys(fn)).not.toContain('invalid')
    })
  })
  describe('sad paths', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should throw an error if validateFunction returns an error', () => {
      const spy = vi.spyOn(index, 'validateFunction').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
      expect(() => defineBlueprintForResource(fns.defineFunction({name: 'func-name'}))).toThrow('this is a test')

      expect(spy).toHaveBeenCalledOnce()
    })
  })
})
