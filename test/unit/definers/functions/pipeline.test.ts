import { afterEach, describe, expect, test, vi } from 'vitest'
import { definePipeline } from '../../../../src/definers/functions/pipeline.js'
import * as index from '../../../../src/index.js'
import { defineBlueprintForResource } from '../../../helpers/index.js'

describe('definePipeline', () => {
  describe('happy paths', () => {
    test('should create a pipeline event', () => {
      const fn = definePipeline({
        name: 'test',
      })
      expect(fn.name).toEqual('test')
    })

    test('should have the default src path', () => {
      const fn = definePipeline({
        name: 'test',
      })
      expect(fn.src).toEqual('functions/test')
    })

    test('should create a pipeline with an event', () => {
      const fn = definePipeline({
        name: 'test',
        event: { type: 'document', on: ['create'], filter: "_type == 'article'" },
      })
      expect(fn.event).toEqual({ type: 'document', on: ['create'], filter: "_type == 'article'" })
    })

    test('should create a pipeline function with optional concurrency', () => {
      const fn = definePipeline({
        name: 'test',
        concurrency: 3,
      })
      expect(fn.concurrency).toEqual(3)
      expect(fn.name).toEqual('test')
    })

    test('should create a pipeline function with optional debounce', () => {
      const fn = definePipeline({
        name: 'test',
        debounce: 3,
      })
      expect(fn.debounce).toEqual(3)
      expect(fn.name).toEqual('test')
    })

    test('should create a pipeline function with optional debounceKey', () => {
      const fn = definePipeline({
        name: 'test',
        debounce: 1,
        debounceKey: 'testKey',
      })
      expect(fn.debounce).toEqual(1)
      expect(fn.debounceKey).toEqual('testKey')
      expect(fn.name).toEqual('test')
    })

    describe('sad paths', () => {
      afterEach(() => {
        vi.resetAllMocks()
      })

      test('should throw an error if validatePipelineFunction returns an error', () => {
        const spy = vi.spyOn(index, 'validatePipelineFunction').mockImplementation(() => [{ type: 'test', message: 'this is a test' }])
        expect(() =>
          defineBlueprintForResource(
            definePipeline({ name: 'test', event: { type: 'document', on: ['create'], filter: "_type == 'article'" } }),
          ),
        ).toThrow('this is a test')

        expect(spy).toHaveBeenCalledOnce()
      })
    })
  })
})
