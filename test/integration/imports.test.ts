import {
  defineBlueprint,
  defineCorsOrigin,
  defineDataset,
  defineDocumentFunction,
  defineDocumentWebhook,
  defineFunction,
  defineMediaLibraryAssetFunction,
  defineProjectRole,
  defineResource,
  defineRole,
  validateBlueprint,
  validateCorsOrigin,
  validateDataset,
  validateDocumentFunction,
  validateDocumentWebhook,
  validateFunction,
  validateMediaLibraryAssetFunction,
  validateResource,
  validateRole,
} from '@sanity/blueprints'
import {describe, expect, it} from 'vitest'

describe('package imports', () => {
  it('should import defineBlueprint', () => {
    expect(defineBlueprint).toBeInstanceOf(Function)
  })

  it('should import defineCorsOrigin', () => {
    expect(defineCorsOrigin).toBeInstanceOf(Function)
  })

  it('should import defineDataset', () => {
    expect(defineDataset).toBeInstanceOf(Function)
  })

  it('should import defineDocumentFunction', () => {
    expect(defineDocumentFunction).toBeInstanceOf(Function)
  })

  it('should import defineDocumentWebhook', () => {
    expect(defineDocumentWebhook).toBeInstanceOf(Function)
  })

  it('should import defineFunction', () => {
    expect(defineFunction).toBeInstanceOf(Function)
  })

  it('should import defineMediaLibraryAssetFunction', () => {
    expect(defineMediaLibraryAssetFunction).toBeInstanceOf(Function)
  })

  it('should import defineProjectRole', () => {
    expect(defineProjectRole).toBeInstanceOf(Function)
  })

  it('should import defineResource', () => {
    expect(defineResource).toBeInstanceOf(Function)
  })

  it('should import defineRole', () => {
    expect(defineRole).toBeInstanceOf(Function)
  })

  it('should import validateBlueprint', () => {
    expect(validateBlueprint).toBeInstanceOf(Function)
  })

  it('should import validateCorsOrigin', () => {
    expect(validateCorsOrigin).toBeInstanceOf(Function)
  })

  it('should import validateDataset', () => {
    expect(validateDataset).toBeInstanceOf(Function)
  })

  it('should import validateDocumentFunction', () => {
    expect(validateDocumentFunction).toBeInstanceOf(Function)
  })

  it('should import validateDocumentWebhook', () => {
    expect(validateDocumentWebhook).toBeInstanceOf(Function)
  })

  it('should import validateFunction', () => {
    expect(validateFunction).toBeInstanceOf(Function)
  })

  it('should import validateMediaLibraryAssetFunction', () => {
    expect(validateMediaLibraryAssetFunction).toBeInstanceOf(Function)
  })

  it('should import validateRole', () => {
    expect(validateRole).toBeInstanceOf(Function)
  })

  it('should import validateResource', () => {
    expect(validateResource).toBeInstanceOf(Function)
  })

  it('should import validateRole', () => {
    expect(validateRole).toBeInstanceOf(Function)
  })
})
