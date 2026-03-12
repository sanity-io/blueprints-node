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

  test('should accept a valid resource with a lifecycle', () => {
    const r = resources.defineResource({name: 'test-resource', type: 'test', lifecycle: {deletionPolicy: 'allow'}})

    expect(r.lifecycle?.deletionPolicy).toEqual('allow')
  })
})

describe('referenceResource', () => {
  test('should create a reference to a resource', () => {
    const ref = resources.referenceResource({
      name: 'ref-resource',
      type: 'test',
      stack: 'test-stack',
      localName: 'local-resource',
    })

    expect(ref.name).toBe('local-resource')
    expect(ref.type).toBe('test')
    expect(ref.lifecycle?.ownershipAction?.type).toBe('reference')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.stack).toBe('test-stack')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.name).toBe('ref-resource')
  })

  test('should create a reference to a resource using the name as the local name', () => {
    const ref = resources.referenceResource({
      name: 'ref-resource',
      type: 'test',
      stack: 'test-stack',
    })

    expect(ref.name).toBe('ref-resource')
    expect(ref.type).toBe('test')
    expect(ref.lifecycle?.ownershipAction?.type).toBe('reference')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.stack).toBe('test-stack')
    expect(ref.lifecycle?.ownershipAction?.type === 'reference' && ref.lifecycle?.ownershipAction?.name).toBe('ref-resource')
  })
})
