import {describe, expect, test} from 'vitest'
import {defineCorsOrigin} from '../../src/index.js'

describe('defineCorsOrigin', () => {
  test('should throw an error if name is not provided', () => {
    // @ts-expect-error Missing required attributes
    expect(() => defineCorsOrigin({})).toThrow(/name is required/)
  })

  test('should throw an error if URL is not provided', () => {
    expect(() =>
      // @ts-expect-error Missing required attributes
      defineCorsOrigin({
        name: 'origin-name',
      }),
    ).toThrow(/URL is required/)
  })

  test('should throw an error if URL is not valid', () => {
    expect(() =>
      defineCorsOrigin({
        name: 'webhook-name',
        origin: 'not-valid-url',
      }),
    ).toThrow(/must be a valid URL/)
  })

  test('should accept a valid configuration and set the type', () => {
    const corsResource = defineCorsOrigin({
      name: 'webhook-name',
      origin: 'http://localhost/',
      allowCredentials: true,
    })

    expect(corsResource.type).toStrictEqual('sanity.project.cors')
  })

  test('allowCredentials should default to false if not provided', () => {
    const webhookResource = defineCorsOrigin({
      name: 'webhook-name',
      origin: 'http://localhost/',
    })

    expect(webhookResource.allowCredentials).toStrictEqual(false)
  })
})
