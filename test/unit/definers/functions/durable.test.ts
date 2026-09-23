import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'
import { defineDurableFunction } from '../../../../src/definers/functions/durable.js'
import * as index from '../../../../src/index.js'
import { resetCollectedErrors } from '../../../../src/utils/validation.js'
import { defineBlueprintForResource } from '../../../helpers/index.js'

describe('defineDurableFunction', () => {
  describe('happy paths', () => {
    test('should create a durable event', () => {
      const fn = defineDurableFunction({
        name: 'test',
      })
      expect(fn.name).toEqual('test')
    })

    test('should have the default src path', () => {
      const fn = defineDurableFunction({
        name: 'test',
      })
      expect(fn.src).toEqual('functions/test')
    })

    test('should create a durable function with an event', () => {
      const fn = defineDurableFunction({
        name: 'test',
        event: { type: 'document', on: ['create'], filter: "_type == 'article'" },
      })
      expect(fn.event).toEqual({ type: 'document', on: ['create'], filter: "_type == 'article'" })
    })

    test('should create a durable function with optional concurrency', () => {
      const fn = defineDurableFunction({
        name: 'test',
        concurrency: 3,
      })
      expect(fn.concurrency).toEqual(3)
      expect(fn.name).toEqual('test')
    })

    test('should create a durable function with optional debounce', () => {
      const fn = defineDurableFunction({
        name: 'test',
        debounce: 3,
      })
      expect(fn.debounce).toEqual({ window: 3 })
      expect(fn.name).toEqual('test')
    })

    test('should create a durable function with optional debounce key', () => {
      const fn = defineDurableFunction({
        name: 'test',
        debounce: { window: 1, key: 'testKey' },
      })
      expect(fn.debounce).toEqual({ window: 1, key: 'testKey' })
      expect(fn.name).toEqual('test')
    })

    test('should parse a debounce duration string into a window in seconds', () => {
      const fn = defineDurableFunction({
        name: 'test',
        debounce: '5 minutes',
      })
      expect(fn.debounce).toEqual({ window: 300 })
    })

    test('should throw if the debounce duration cannot be parsed', () => {
      expect(() => defineDurableFunction({ name: 'test', debounce: 'invalid' })).toThrow('Invalid duration: invalid')
    })
    test('should parse durableTimeout in seconds', () => {
      const fn = defineDurableFunction({
        name: 'test',
        durableTimeout: '1 hour',
      })
      expect(fn.durableTimeout).toBe(3_600)
    })
    test('should parse durableTimeout in seconds', () => {
      const fn = defineDurableFunction({
        name: 'test',
        durableTimeout: 60,
      })
      expect(fn.durableTimeout).toBe(60)
    })

    describe('debounce validation', () => {
      beforeEach(() => {
        resetCollectedErrors()
      })

      test('should not report an error for a valid debounce config', () => {
        expect(() =>
          defineBlueprintForResource(defineDurableFunction({ name: 'test', debounce: { window: 30, maxWindow: 300, key: 'event.data._id' } })),
        ).not.toThrow()
      })

      test('should report an error for an invalid debounce key', () => {
        expect(() =>
          // @ts-expect-error -- `key` must be a string, which is what we are asserting on
          defineBlueprintForResource(defineDurableFunction({ name: 'test', debounce: { window: 30, key: 123 } })),
        ).toThrow('`key` must be a string')
      })

      test('should report an error for an out of range debounce window', () => {
        expect(() => defineBlueprintForResource(defineDurableFunction({ name: 'test', debounce: { window: 1801 } }))).toThrow(
          '`window` must be between 1 second to 30 minutes',
        )
      })
    })

    describe('sad paths', () => {
      afterEach(() => {
        vi.resetAllMocks()
      })

      test('should throw an error if validateDurableFunction returns an error', () => {
        const spy = vi.spyOn(index, 'validateDurableFunction').mockImplementation(() => [{ type: 'test', message: 'this is a test' }])
        expect(() =>
          defineBlueprintForResource(
            defineDurableFunction({ name: 'test', event: { type: 'document', on: ['create'], filter: "_type == 'article'" } }),
          ),
        ).toThrow('this is a test')

        expect(spy).toHaveBeenCalledOnce()
      })
    })
  })
})
