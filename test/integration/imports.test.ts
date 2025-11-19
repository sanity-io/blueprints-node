import {
  defineBlueprint,
  defineCorsOrigin,
  defineDataset,
  defineDocumentFunction,
  defineDocumentWebhook,
  defineFunction,
  defineMediaLibraryAssetFunction,
  defineResource,
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

  it('should import defineResource', () => {
    expect(defineResource).toBeInstanceOf(Function)
  })
})
