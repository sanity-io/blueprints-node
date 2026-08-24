import {
  defineBlueprint,
  defineCorsOrigin,
  defineDataset,
  defineDocumentFunction,
  defineDocumentWebhook,
  defineFunction,
  defineMediaLibraryAssetFunction,
  defineProjectRole,
  definePubSubFunction,
  defineQueueFunction,
  defineResource,
  defineRole,
  defineScheduledFunction,
  defineSyncTagInvalidateFunction,
  defineWorkflows,
  validateBlueprint,
  validateCorsOrigin,
  validateDataset,
  validateDocumentFunction,
  validateDocumentWebhook,
  validateFunction,
  validateMediaLibraryAssetFunction,
  validatePubSubFunction,
  validateQueueFunction,
  validateResource,
  validateRole,
  validateScheduledFunction,
  validateSyncTagInvalidateFunction,
  validateWorkflows,
} from '@sanity/blueprints'
import {describe, expect, test} from 'vitest'

describe('package imports', () => {
  test('should import defineBlueprint', () => {
    expect(defineBlueprint).toBeInstanceOf(Function)
  })

  test('should import defineCorsOrigin', () => {
    expect(defineCorsOrigin).toBeInstanceOf(Function)
  })

  test('should import defineDataset', () => {
    expect(defineDataset).toBeInstanceOf(Function)
  })

  test('should import defineDocumentFunction', () => {
    expect(defineDocumentFunction).toBeInstanceOf(Function)
  })

  test('should import defineScheduledFunction', () => {
    expect(defineScheduledFunction).toBeInstanceOf(Function)
  })

  test('should import defineSyncTagInvalidateFunction', () => {
    expect(defineSyncTagInvalidateFunction).toBeInstanceOf(Function)
  })

  test('should import defineQueueFunction', () => {
    expect(defineQueueFunction).toBeInstanceOf(Function)
  })

  test('should import definePubSubFunction', () => {
    expect(definePubSubFunction).toBeInstanceOf(Function)
  })

  test('should import defineDocumentWebhook', () => {
    expect(defineDocumentWebhook).toBeInstanceOf(Function)
  })

  test('should import defineFunction', () => {
    expect(defineFunction).toBeInstanceOf(Function)
  })

  test('should import defineMediaLibraryAssetFunction', () => {
    expect(defineMediaLibraryAssetFunction).toBeInstanceOf(Function)
  })

  test('should import defineWorkflows', () => {
    expect(defineWorkflows).toBeInstanceOf(Function)
  })

  test('should import defineProjectRole', () => {
    expect(defineProjectRole).toBeInstanceOf(Function)
  })

  test('should import defineResource', () => {
    expect(defineResource).toBeInstanceOf(Function)
  })

  test('should import defineRole', () => {
    expect(defineRole).toBeInstanceOf(Function)
  })

  test('should import validateBlueprint', () => {
    expect(validateBlueprint).toBeInstanceOf(Function)
  })

  test('should import validateCorsOrigin', () => {
    expect(validateCorsOrigin).toBeInstanceOf(Function)
  })

  test('should import validateDataset', () => {
    expect(validateDataset).toBeInstanceOf(Function)
  })

  test('should import validateDocumentFunction', () => {
    expect(validateDocumentFunction).toBeInstanceOf(Function)
  })

  test('should import validateSyncTagInvalidateFunction', () => {
    expect(validateSyncTagInvalidateFunction).toBeInstanceOf(Function)
  })

  test('should import validateQueueFunction', () => {
    expect(validateQueueFunction).toBeInstanceOf(Function)
  })

  test('should import validatePubSubFunction', () => {
    expect(validatePubSubFunction).toBeInstanceOf(Function)
  })

  test('should import validateDocumentWebhook', () => {
    expect(validateDocumentWebhook).toBeInstanceOf(Function)
  })

  test('should import validateFunction', () => {
    expect(validateFunction).toBeInstanceOf(Function)
  })

  test('should import validateMediaLibraryAssetFunction', () => {
    expect(validateMediaLibraryAssetFunction).toBeInstanceOf(Function)
  })

  test('should import validateWorkflows', () => {
    expect(validateWorkflows).toBeInstanceOf(Function)
  })

  test('should import validateScheduledFunction', () => {
    expect(validateScheduledFunction).toBeInstanceOf(Function)
  })

  test('should import validateResource', () => {
    expect(validateResource).toBeInstanceOf(Function)
  })

  test('should import validateRole', () => {
    expect(validateRole).toBeInstanceOf(Function)
  })
})
