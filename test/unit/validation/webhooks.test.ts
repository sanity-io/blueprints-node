import {describe, expect, test} from 'vitest'
import {validateDocumentWebhook} from '../../../src/index.js'

describe('validateDocumentWebhook', () => {
  test('should return an error if name is not provided', () => {
    // @ts-expect-error Missing required attributes
    const errors = validateDocumentWebhook({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Webhook name is required'})
  })

  test('should return an error if displayName is too long', () => {
    // @ts-expect-error Missing required attributes
    const errors = validateDocumentWebhook({
      name: 'webhook-name',
      displayName: 'a'.repeat(101),
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Display name must be 100 characters or less'})
  })

  test('should return an error if URL is not provided', () => {
    // @ts-expect-error Missing required attributes
    const errors = validateDocumentWebhook({
      name: 'webhook-name',
    })
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Webhook URL is required'})
  })

  test('should return an error if URL is not valid', () => {
    // @ts-expect-error Missing required attributes
    const errors = validateDocumentWebhook({
      name: 'webhook-name',
      url: 'not-valid-url',
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Webhook URL must be a valid URL'})
  })

  test('should return an error if on is not provided', () => {
    // @ts-expect-error Missing required attributes
    const errors = validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'At least one event type must be specified in the "on" field'})
  })

  test('should return an error if on is empty', () => {
    const errors = validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: [],
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'At least one event type must be specified in the "on" field'})
  })

  test('should return an error if on contains an invalid value', () => {
    const errors = validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      // @ts-expect-error invalid value for testing
      on: ['invalid'],
    })
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Invalid event types: invalid. Valid events are: create, update, delete',
    })
  })

  test('should return an error if dataset is not provided', () => {
    const errors = validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
    })
    expect(errors).toContainEqual({type: 'invalid_format', message: 'Dataset must match pattern: ^[a-z0-9-_]+$'})
  })

  test('should return an error if dataset is invalid', () => {
    const errors = validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: '***',
    })
    expect(errors).toContainEqual({type: 'invalid_format', message: 'Dataset must match pattern: ^[a-z0-9-_]+$'})
  })

  test('should return an error if http method is invalid', () => {
    const errors = validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
      // @ts-expect-error invalid value
      httpMethod: 'invalid',
    })
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Invalid HTTP method: invalid. Valid methods are: POST, PUT, PATCH, DELETE, GET',
    })
  })

  test('should return an error if status is invalid', () => {
    const errors = validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
      // @ts-expect-error invalid value
      status: 'invalid',
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Status must be either "enabled" or "disabled"'})
  })

  test('should return an error if a header key is invalid', () => {
    const errors = validateDocumentWebhook({
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
    const errors = validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
      headers: {
        // @ts-expect-error Invalid value
        header: 456,
      },
    })
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Header value for "header" must be a string'})
  })

  test('should accept a valid configuration', () => {
    const errors = validateDocumentWebhook({
      name: 'webhook-name',
      url: 'http://localhost/',
      on: ['create'],
      dataset: 'abcdefg',
    })

    expect(errors).toHaveLength(0)
  })
})
