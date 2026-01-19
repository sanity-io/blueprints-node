import {afterEach, describe, expect, test, vi} from 'vitest'
import * as index from '../../../src/index.js'
import * as webhooks from '../../../src/validation/webhooks.js'

describe('validateDocumentWebhook', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should return an error if name is not provided', () => {
    const errors = webhooks.validateDocumentWebhook({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Webhook name is required'})
  })

  test('should return an error if name is not a string', () => {
    const errors = webhooks.validateDocumentWebhook({name: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Webhook name must be a string'})
  })

  test('should return an error if type is not provided', () => {
    const errors = webhooks.validateDocumentWebhook({name: 'webhook-name'})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Webhook type is required'})
  })

  test('should return an error if type is not `sanity.project.webhook`', () => {
    const errors = webhooks.validateDocumentWebhook({name: 'webhook-name', type: 'invalid'})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Webhook type must be `sanity.project.webhook`'})
  })

  test('should return an error if displayName is not a string', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      displayName: 1,
    })
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Display name must be a string'})
  })

  test('should return an error if displayName is too long', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      displayName: 'a'.repeat(101),
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Display name must be 100 characters or less'})
  })

  test('should return an error if URL is not provided', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
    })
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Webhook URL is required'})
  })

  test('should return an error if URL is not a string', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      url: 1,
    })
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Webhook URL must be a string'})
  })

  test('should return an error if URL is not valid', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      url: 'not-valid-url',
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Webhook URL must be a valid URL'})
  })

  test('should return an error if on is not provided', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'At least one event type must be specified in the "on" field'})
  })

  test('should return an error if on is empty', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: [],
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'At least one event type must be specified in the "on" field'})
  })

  test('should return an error if on contains an invalid value', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['invalid'],
    })
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Invalid event types: invalid. Valid events are: create, update, delete',
    })
  })

  test('should return an error if dataset is not provided', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: '!!!',
    })
    expect(errors).toContainEqual({type: 'invalid_format', message: 'Dataset must match pattern: ^[a-z0-9-_]+$'})
  })

  test('should return an error if dataset is invalid', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: '***',
    })
    expect(errors).toContainEqual({type: 'invalid_format', message: 'Dataset must match pattern: ^[a-z0-9-_]+$'})
  })

  test('should return an error if http method is invalid', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
      httpMethod: 'invalid',
    })
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Invalid HTTP method: invalid. Valid methods are: POST, PUT, PATCH, DELETE, GET',
    })
  })

  test('should return an error if http method is not a string', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
      httpMethod: 1,
    })
    expect(errors).toContainEqual({
      type: 'invalid_type',
      message: 'Invalid HTTP method: 1. Valid methods are: POST, PUT, PATCH, DELETE, GET',
    })
  })

  test('should return an error if status is invalid', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
      status: 'invalid',
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Status must be either "enabled" or "disabled"'})
  })

  test('should return an error if status is not a string', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
      status: 1,
    })
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Status must be either "enabled" or "disabled"'})
  })

  test('should return an error if headers is not an object', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
      headers: 1,
    })
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Webhook headers must be an object'})
  })

  test('should return an error if a header key is invalid', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
      headers: {
        '123': '456',
      },
    })
    expect(errors).toContainEqual({type: 'invalid_format', message: 'Header key "123" must match pattern: ^[a-zA-Z][a-zA-Z0-9-_]*$'})
  })

  test('should return an error if a header value is invalid', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
      headers: {
        header: 456,
      },
    })
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Header value for "header" must be a string'})
  })

  test('should return an error if validateResource returns an error', () => {
    const spy = vi.spyOn(index, 'validateResource').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      type: 'sanity.project.webhook',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
    })

    expect(errors).toContainEqual({type: 'test', message: 'this is a test'})
    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration', () => {
    const errors = webhooks.validateDocumentWebhook({
      name: 'webhook-name',
      type: 'sanity.project.webhook',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
    })

    expect(errors).toHaveLength(0)
  })
})
