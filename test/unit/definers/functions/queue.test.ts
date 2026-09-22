import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest'
import {defineQueueFunction} from '../../../../src/definers/functions/queue.js'
import type {BlueprintFunctionResourceContentLakeEvent} from '../../../../src/index.js'
import * as index from '../../../../src/index.js'
import {resetCollectedErrors} from '../../../../src/utils/validation.js'
import {defineBlueprintForResource} from '../../../helpers/index.js'

const baseQueueProps = {concurrency: 420, dlq: true, fifo: true}

describe('defineQueueFunction', () => {
  describe('happy paths', () => {
    test('should create a queue function without an event', () => {
      const fn = defineQueueFunction({name: 'test'})
      expect(fn.type).toEqual('sanity.function.queue')
      expect(fn).not.toHaveProperty('event')
    })

    test('should create a queue function and honour queue properties with a numeric debounce', () => {
      const queueProps = {...baseQueueProps, debounce: 69}
      const fn = defineQueueFunction({name: 'test', ...queueProps})
      expect(fn.type).toEqual('sanity.function.queue')
      expect(fn).not.toHaveProperty('event')
      expect(fn).toMatchObject({...baseQueueProps, debounce: {window: 69}})
    })

    test('should create a queue function and honour queue properties with a debounce duration string', () => {
      const queueProps = {...baseQueueProps, debounce: '69s'}
      const fn = defineQueueFunction({name: 'test', ...queueProps})
      expect(fn.type).toEqual('sanity.function.queue')
      expect(fn).not.toHaveProperty('event')
      expect(fn).toMatchObject({...baseQueueProps, debounce: {window: 69}})
    })

    test('should create a queue function and honour queue properties with a debounce config', () => {
      const queueProps = {...baseQueueProps, debounce: {window: 69, key: 'event.data._id'}}
      const fn = defineQueueFunction({name: 'test', ...queueProps})
      expect(fn.type).toEqual('sanity.function.queue')
      expect(fn).not.toHaveProperty('event')
      expect(fn).toMatchObject({...baseQueueProps, debounce: {window: 69, key: 'event.data._id'}})
    })

    test('should pass through a document event', () => {
      const event: BlueprintFunctionResourceContentLakeEvent = {type: 'document', on: ['publish'], filter: "_type == 'post'"}
      const fn = defineQueueFunction({name: 'test', event})
      expect(fn.event).toEqual(event)
    })

    test('should pass through a media-library event', () => {
      const event: BlueprintFunctionResourceContentLakeEvent = {
        type: 'media-library',
        on: ['create'],
        resource: {type: 'media-library', id: 'my-media-library-id'},
      }
      const fn = defineQueueFunction({name: 'test', event})
      expect(fn.event).toEqual(event)
    })

    test('should pass through a sync-tag-invalidate event', () => {
      const event: BlueprintFunctionResourceContentLakeEvent = {
        type: 'sync-tag-invalidate',
        resource: {type: 'dataset', id: 'myProj.myDataset'},
      }
      const fn = defineQueueFunction({name: 'test', event})
      expect(fn.event).toEqual(event)
    })

    test('should pass through concurrency, fifo and dlq alongside an event', () => {
      const event: BlueprintFunctionResourceContentLakeEvent = {type: 'document', on: ['publish']}
      const fn = defineQueueFunction({name: 'test', event, concurrency: 5, fifo: false, dlq: false})
      expect(fn).toMatchObject({event, concurrency: 5, fifo: false, dlq: false})
    })
  })

  describe('debounce validation', () => {
    beforeEach(() => {
      resetCollectedErrors()
    })

    test('should not report an error for a valid debounce config', () => {
      expect(() =>
        defineBlueprintForResource(defineQueueFunction({name: 'test', debounce: {window: 30, maxWindow: 300, key: 'event.data._id'}})),
      ).not.toThrow()
    })

    test('should report an error for an invalid debounce key', () => {
      expect(() =>
        // @ts-expect-error -- `key` must be a string, which is what we are asserting on
        defineBlueprintForResource(defineQueueFunction({name: 'test', debounce: {window: 30, key: 123}})),
      ).toThrow('`key` must be a string')
    })

    test('should throw if the debounce duration cannot be parsed', () => {
      expect(() => defineQueueFunction({name: 'test', debounce: 'invalid'})).toThrow('Invalid duration: invalid')
    })
  })

  describe('sad paths', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should throw an error if validateQueueFunction returns an error', () => {
      const spy = vi.spyOn(index, 'validateQueueFunction').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
      expect(() => defineBlueprintForResource(defineQueueFunction({name: 'test', event: {type: 'document', on: ['publish']}}))).toThrow(
        'this is a test',
      )

      expect(spy).toHaveBeenCalledOnce()
    })
  })
})
