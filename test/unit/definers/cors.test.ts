import {afterEach, describe, expect, test, vi} from 'vitest'
import * as cors from '../../../src/definers/cors.js'
import * as index from '../../../src/index.js'

vi.mock(import('../../../src/index.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    validateBlueprint: vi.fn(() => []),
  }
})

describe('defineCorsOrigin', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if validateCorsOrigin returns an error', () => {
    const spy = vi.spyOn(index, 'validateCorsOrigin').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      cors.defineCorsOrigin({
        name: 'origin-name',
        origin: 'http://localhost/',
      }),
    ).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration and set the type', () => {
    const corsResource = cors.defineCorsOrigin({
      name: 'origin-name',
      origin: 'http://localhost/',
      allowCredentials: true,
    })

    expect(corsResource.type).toStrictEqual('sanity.project.cors')
  })

  test('should accept a valid configuration with a lifecycle', () => {
    const corsResource = cors.defineCorsOrigin({
      name: 'origin-name',
      origin: 'http://localhost/',
      allowCredentials: true,

      lifecycle: {
        deletionPolicy: 'allow',

        ownershipAction: {
          type: 'attach',
          projectId: 'a1b2c3',
          id: 'abc123',
        },
      },
    })

    expect(corsResource.lifecycle?.deletionPolicy).toStrictEqual('allow')
  })

  test('allowCredentials should default to false if not provided', () => {
    const corsResource = cors.defineCorsOrigin({
      name: 'origin-name',
      origin: 'http://localhost/',
    })

    expect(corsResource.allowCredentials).toStrictEqual(false)
  })

  test('should accept a valid configuration with dependsOn', () => {
    const corsResource = cors.defineCorsOrigin({
      name: 'origin-name',
      origin: 'https://example.com',
      dependsOn: '$.resources.my-dataset',
    })

    expect(corsResource.dependsOn).toStrictEqual('$.resources.my-dataset')
  })
})
