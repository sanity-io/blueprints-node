import {afterEach, describe, expect, test, vi} from 'vitest'
import * as webhooks from '../../../src/definers/webhooks.js'
import * as index from '../../../src/index.js'

describe('defineDocumentWebhook', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if validateDocumentWebhook returns an error', () => {
    const spy = vi.spyOn(index, 'validateDocumentWebhook').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      webhooks.defineDocumentWebhook({
        name: 'webhook-name',
        url: 'http://localhost/',
        on: ['create'],
        dataset: 'abcdefg',
      }),
    ).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration and set the type', () => {
    const webhookResource = webhooks.defineDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
    })

    expect(webhookResource.type).toStrictEqual('sanity.project.webhook')
  })

  test('displayName should default to name if not provided', () => {
    const webhookResource = webhooks.defineDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
    })

    expect(webhookResource.displayName).toStrictEqual('webhook-name')
  })
})
