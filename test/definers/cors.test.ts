import {describe, expect, test} from 'vitest'
import {defineCORSOrigin} from '../../src/index.js'

describe('defineCORSOrigin', () => {
  test('should throw an error if name is not provided', () => {
    // @ts-expect-error Missing required attributes
    expect(() => defineCORSOrigin({})).toThrow(/name is required/)
  })

  test('should throw an error if URL is not provided', () => {
    expect(() =>
      // @ts-expect-error Missing required attributes
      defineCORSOrigin({
        name: 'origin-name',
      }),
    ).toThrow(/URL is required/)
  })

  test('should throw an error if URL is not valid', () => {
    expect(() =>
      defineCORSOrigin({
        name: 'webhook-name',
        origin: 'not-valid-url',
      }),
    ).toThrow(/must be a valid URL/)
  })

  test('should accept a valid configuration and set the type', () => {
    const corsResource = defineCORSOrigin({
      name: 'webhook-name',
      origin: 'http://localhost/',
      allowCredentials: true,
    })

    expect(corsResource.type).toStrictEqual('sanity.project.cors')
  })

  test('allowCredentials should default to false if not provided', () => {
    const webhookResource = defineCORSOrigin({
      name: 'webhook-name',
      origin: 'http://localhost/',
    })

    expect(webhookResource.allowCredentials).toStrictEqual(false)
  })
})
