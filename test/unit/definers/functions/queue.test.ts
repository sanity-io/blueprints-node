import {afterEach, describe, expect, test, vi} from 'vitest'
import {defineQueueFunction} from '../../../../src/definers/functions/queue.js'
import type {BlueprintFunctionResourceEvent} from '../../../../src/index.js'
import * as index from '../../../../src/index.js'
import {defineBlueprintForResource} from '../../../helpers/index.js'

describe('defineQueueFunction', () => {
  describe('happy paths', () => {
    test('should create a queue function without an event', () => {
      const fn = defineQueueFunction({name: 'test'})
      expect(fn.type).toEqual('sanity.function.queue')
      expect(fn).not.toHaveProperty('event')
    })

    test('should create a queue function and honour queue properties', () => {
      const queueProps = {concurrency: 420, dlq: true, fifo: true, debounce: 69, debounceKey: 'bouncebouncebouncebounce'}
      const fn = defineQueueFunction({name: 'test', ...queueProps})
      expect(fn.type).toEqual('sanity.function.queue')
      expect(fn).not.toHaveProperty('event')
      expect(fn).toMatchObject(queueProps)
    })

    test('should pass through a document event', () => {
      const event: BlueprintFunctionResourceEvent = {type: 'document', on: ['publish'], filter: "_type == 'post'"}
      const fn = defineQueueFunction({name: 'test', event})
      expect(fn.event).toEqual(event)
    })

    test('should pass through a media-library event', () => {
      const event: BlueprintFunctionResourceEvent = {
        type: 'media-library',
        on: ['create'],
        resource: {type: 'media-library', id: 'my-media-library-id'},
      }
      const fn = defineQueueFunction({name: 'test', event})
      expect(fn.event).toEqual(event)
    })

    test('should pass through a cron event', () => {
      const event: BlueprintFunctionResourceEvent = {type: 'cron', minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'}
      const fn = defineQueueFunction({name: 'test', event})
      expect(fn.event).toEqual(event)
    })

    test('should pass through a sync-tag-invalidate event', () => {
      const event: BlueprintFunctionResourceEvent = {type: 'sync-tag-invalidate', resource: {type: 'dataset', id: 'myProj.myDataset'}}
      const fn = defineQueueFunction({name: 'test', event})
      expect(fn.event).toEqual(event)
    })

    test('should pass through concurrency, fifo and dlq alongside an event', () => {
      const event: BlueprintFunctionResourceEvent = {type: 'document', on: ['publish']}
      const fn = defineQueueFunction({name: 'test', event, concurrency: 5, fifo: false, dlq: false})
      expect(fn).toMatchObject({event, concurrency: 5, fifo: false, dlq: false})
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
