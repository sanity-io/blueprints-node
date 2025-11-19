import {describe, expect, test} from 'vitest'
import {defineDocumentWebhook} from '../../../src/index.js'

describe('defineDocumentWebhook', () => {
  test('should throw an error if name is not provided', () => {
    // @ts-expect-error Missing required attributes
    expect(() => defineDocumentWebhook({})).toThrow(/name is required/)
  })

  test('should throw an error if displayName is too long', () => {
    expect(() =>
      // @ts-expect-error Missing required attributes
      defineDocumentWebhook({
        name: 'webhook-name',
        displayName: 'a'.repeat(101),
      }),
    ).toThrow(/Display name must be 100 characters or less/)
  })

  test('should throw an error if URL is not provided', () => {
    expect(() =>
      // @ts-expect-error Missing required attributes
      defineDocumentWebhook({
        name: 'webhook-name',
      }),
    ).toThrow(/URL is required/)
  })

  test('should throw an error if URL is not valid', () => {
    expect(() =>
      // @ts-expect-error Missing required attributes
      defineDocumentWebhook({
        name: 'webhook-name',
        url: 'not-valid-url',
      }),
    ).toThrow(/must be a valid URL/)
  })

  test('should throw an error if on is not provided', () => {
    expect(() =>
      // @ts-expect-error Missing required attributes
      defineDocumentWebhook({
        name: 'webhook-name',
        url: 'http://localhost/',
      }),
    ).toThrow(/At least one event type must be specified in the \"on\" field/)
  })

  test('should throw an error if on is empty', () => {
    expect(() =>
      defineDocumentWebhook({
        name: 'webhook-name',
        url: 'http://localhost/',
        on: [],
      }),
    ).toThrow(/At least one event type must be specified in the \"on\" field/)
  })

  test('should throw an error if on contains an invalid value', () => {
    expect(() =>
      defineDocumentWebhook({
        name: 'webhook-name',
        url: 'http://localhost/',
        // @ts-expect-error invalid value for testing
        on: ['invalid'],
      }),
    ).toThrow(/Invalid event types: invalid/)
  })

  test('should throw an error if dataset is not provided', () => {
    expect(() =>
      defineDocumentWebhook({
        name: 'webhook-name',
        url: 'http://localhost/',
        on: ['create'],
      }),
    ).toThrow(/Dataset must match pattern/)
  })

  test('should throw an error if dataset is invalid', () => {
    expect(() =>
      defineDocumentWebhook({
        name: 'webhook-name',
        url: 'http://localhost/',
        on: ['create'],
        dataset: '***',
      }),
    ).toThrow(/Dataset must match pattern/)
  })

  test('should throw an error if http method is invalid', () => {
    expect(() =>
      defineDocumentWebhook({
        name: 'webhook-name',
        url: 'http://localhost/',
        on: ['create'],
        dataset: 'abcdefg',
        // @ts-expect-error invalid value
        httpMethod: 'invalid',
      }),
    ).toThrow(/Invalid HTTP method/)
  })

  test('should throw an error if status is invalid', () => {
    expect(() =>
      defineDocumentWebhook({
        name: 'webhook-name',
        url: 'http://localhost/',
        on: ['create'],
        dataset: 'abcdefg',
        // @ts-expect-error invalid value
        status: 'invalid',
      }),
    ).toThrow(/Status must be either/)
  })

  test('should throw an error if a header key is invalid', () => {
    expect(() =>
      defineDocumentWebhook({
        name: 'webhook-name',
        url: 'http://localhost/',
        on: ['create'],
        dataset: 'abcdefg',
        headers: {
          '123': '456',
        },
      }),
    ).toThrow(/Header key "123" must match pattern/)
  })

  test('should throw an error if a header value is invalid', () => {
    expect(() =>
      defineDocumentWebhook({
        name: 'webhook-name',
        url: 'http://localhost/',
        on: ['create'],
        dataset: 'abcdefg',
        headers: {
          // @ts-expect-error Invalid value
          header: 456,
        },
      }),
    ).toThrow(/Header value for \"header\" must be a string/)
  })

  test('should accept a valid configuration and set the type', () => {
    const webhookResource = defineDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
    })

    expect(webhookResource.type).toStrictEqual('sanity.project.webhook')
  })

  test('displayName should default to name if not provided', () => {
    const webhookResource = defineDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
    })

    expect(webhookResource.displayName).toStrictEqual('webhook-name')
  })
})
