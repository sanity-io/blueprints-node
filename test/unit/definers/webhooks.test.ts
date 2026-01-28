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
        apiVersion: 'vX',
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
      apiVersion: 'vX',
    })

    expect(webhookResource.type).toStrictEqual('sanity.project.webhook')
  })

  test('should accept a valid configuration with a lifecycle', () => {
    const webhookResource = webhooks.defineDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
      apiVersion: 'vX',

      lifecycle: {
        deletionPolicy: 'allow',
      },
    })

    expect(webhookResource.lifecycle?.deletionPolicy).toStrictEqual('allow')
  })

  test('should accept a valid configuration with an attach lifecycle', () => {
    const webhookResource = webhooks.defineDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
      apiVersion: 'vX',

      lifecycle: {
        ownershipAction: {
          type: 'attach',
          projectId: 'test-project',
          id: 'webhook-id',
        },
      },
    })

    expect(webhookResource.lifecycle?.ownershipAction?.projectId).toStrictEqual('test-project')
  })

  test('displayName should default to name if not provided', () => {
    const webhookResource = webhooks.defineDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
      apiVersion: 'vX',
    })

    expect(webhookResource.displayName).toStrictEqual('webhook-name')
  })
})
