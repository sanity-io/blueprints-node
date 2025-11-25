import {afterEach, describe, expect, test, vi} from 'vitest'
import * as resources from '../../../src/definers/resources.js'
import * as index from '../../../src/index.js'

describe('defineResource', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if validateResource returns an error', () => {
    const spy = vi.spyOn(index, 'validateResource').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() => resources.defineResource({})).toThrow('this is a test')

    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid resource', () => {
    const r = resources.defineResource({name: 'test-resource', type: 'test'})

    expect(r.name).toEqual('test-resource')
    expect(r.type).toEqual('test')
  })
})
