import {afterEach, describe, expect, test, vi} from 'vitest'
import {definePubSubFunction} from '../../../../src/definers/functions/pubsub.js'
import * as index from '../../../../src/index.js'
import {defineBlueprintForResource} from '../../../helpers/index.js'

describe('definePubSubFunction', () => {
  describe('happy paths', () => {
    test('should create a pubsub function', () => {
      const fn = definePubSubFunction({name: 'test'})
      expect(fn.type).toEqual('sanity.function.pubsub')
      expect(fn).not.toHaveProperty('event')
    })
  })

  describe('sad paths', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should throw an error if validatePubSubFunction returns an error', () => {
      const spy = vi.spyOn(index, 'validatePubSubFunction').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
      expect(() => defineBlueprintForResource(definePubSubFunction({name: 'test'}))).toThrow('this is a test')

      expect(spy).toHaveBeenCalledOnce()
    })
  })
})
