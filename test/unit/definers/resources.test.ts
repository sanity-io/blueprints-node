import {afterEach, describe, expect, test, vi} from 'vitest'
import * as resources from '../../../src/definers/resources.js'
import * as index from '../../../src/index.js'

describe('defineResource', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if assertResource throws an error', () => {
    const spy = vi.spyOn(index, 'assertResource').mockImplementation(() => {
      throw new Error('this is a test')
    })
    expect(() => resources.defineResource({})).toThrow('this is a test')

    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid resource', () => {
    const r = resources.defineResource({name: 'test-resource', type: 'test'})

    expect(r.name).toEqual('test-resource')
    expect(r.type).toEqual('test')
  })
})
