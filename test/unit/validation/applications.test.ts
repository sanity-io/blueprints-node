import {describe, expect, test} from 'vitest'
import {
  type BlueprintAssetSourceViewConfig,
  type BlueprintPanelViewConfig,
  type BlueprintTileViewConfig,
  type BlueprintWebWorker,
  type BlueprintWindowViewConfig,
  validateApplication,
  validateAssetSourceView,
  validatePanelView,
  validateTileView,
  validateWebWorker,
  validateWindowView,
} from '../../../src/index.js'

const validWindowView: BlueprintWindowViewConfig = {
  type: 'view',
  surface: 'window',
  name: 'main',
  title: 'Design Retro',
  src: './src/windows/main.tsx',
}

const validPanelView: BlueprintPanelViewConfig = {
  type: 'view',
  surface: 'panel',
  name: 'side',
  title: 'Favorites',
  src: './src/panels/main.tsx',
}

const validAssetSourceView: BlueprintAssetSourceViewConfig = {
  type: 'view',
  surface: 'asset-source',
  name: 'image-picker',
  title: 'Image Picker',
  src: './src/asset-sources/image-picker.tsx',
}

const validTileView: BlueprintTileViewConfig = {
  type: 'view',
  surface: 'tile',
  name: 'jump-back-in',
  title: 'Main Tile',
  src: './src/tiles/jump-back-in.tsx',
  size: 'banner',
}

const validWebWorker: BlueprintWebWorker = {
  type: 'worker',
  name: 'background-refresh',
  title: 'Background Worker',
  src: './src/workers/background-refresh.ts',
}

const validApplication = {
  type: 'sanity.application',
  name: 'design-retro',
  slug: 'design-retro',
  title: 'Design Retro',
  views: [validWindowView, validPanelView, validAssetSourceView, validTileView],
  webWorkers: [validWebWorker],
}

describe('validateApplication', () => {
  test('should return an error if config is falsey', () => {
    expect(validateApplication(undefined)).toContainEqual({type: 'invalid_value', message: 'Application config must be provided'})
  })

  test('should return an error if config is not an object', () => {
    expect(validateApplication(1)).toContainEqual({type: 'invalid_type', message: 'Application config must be an object'})
  })

  test('should accept a valid application', () => {
    expect(validateApplication(validApplication)).toStrictEqual([])
  })

  test('should return an error if type is not sanity.application', () => {
    expect(validateApplication({...validApplication, type: 'invalid'})).toContainEqual({
      type: 'invalid_value',
      message: 'Application type must be `sanity.application`',
    })
  })

  test('should return an error if slug is not provided', () => {
    const {slug: _slug, ...noSlug} = validApplication
    expect(validateApplication(noSlug)).toContainEqual({type: 'missing_parameter', message: 'Application slug is required'})
  })

  test('should return an error if slug is not a string', () => {
    expect(validateApplication({...validApplication, slug: 1})).toContainEqual({
      type: 'invalid_type',
      message: 'Application slug must be a string',
    })
  })

  test('should return an error if slug is not a valid hostname label', () => {
    expect(validateApplication({...validApplication, slug: 'Design Retro'})).toContainEqual({
      type: 'invalid_format',
      message: 'Application slug must match pattern: ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$',
    })
  })

  test('should accept a slug that is a reference', () => {
    expect(validateApplication({...validApplication, slug: '$.resources.my-slug'})).toStrictEqual([])
  })

  test('should return an error if title is not provided', () => {
    const {title: _title, ...noTitle} = validApplication
    expect(validateApplication(noTitle)).toContainEqual({type: 'missing_parameter', message: 'Application title is required'})
  })

  test('should return an error if icon is not a string', () => {
    expect(validateApplication({...validApplication, icon: 1})).toContainEqual({
      type: 'invalid_type',
      message: 'Application icon must be a string',
    })
  })

  test('should return an error if visibility is invalid', () => {
    expect(validateApplication({...validApplication, visibility: 'nope'})).toContainEqual({
      type: 'invalid_value',
      message: 'visibility must be one of `default`, `unlisted`, or `disabled`',
    })
  })

  test('should return an error if views is not an array', () => {
    expect(validateApplication({...validApplication, views: 'nope'})).toContainEqual({
      type: 'invalid_type',
      message: 'Application views must be an array',
    })
  })

  test('should return an error if webWorkers is not an array', () => {
    expect(validateApplication({...validApplication, webWorkers: 'nope'})).toContainEqual({
      type: 'invalid_type',
      message: 'Application webWorkers must be an array',
    })
  })

  test('should surface errors from nested views', () => {
    expect(validateApplication({...validApplication, views: [{...validPanelView, src: undefined}]})).toContainEqual({
      type: 'missing_parameter',
      message: 'Panel view src is required',
    })
  })

  test('should surface errors from nested web workers', () => {
    expect(validateApplication({...validApplication, webWorkers: [{...validWebWorker, name: undefined}]})).toContainEqual({
      type: 'missing_parameter',
      message: 'Web worker name is required',
    })
  })

  test('should return an error for an unknown view surface', () => {
    expect(validateApplication({...validApplication, views: [{surface: 'nope', name: 'x', title: 'x', src: 'x'}]})).toContainEqual({
      type: 'invalid_value',
      message: 'Application view surface must be one of window, panel, asset-source, tile',
    })
  })
})

describe('validateWindowView', () => {
  test('should accept a valid window view', () => {
    expect(validateWindowView(validWindowView)).toStrictEqual([])
  })

  test('should accept a valid window view with dock', () => {
    expect(validateWindowView({...validWindowView, dock: {group: 'applications', order: 10}})).toStrictEqual([])
  })

  test('should return an error if surface is not window', () => {
    expect(validateWindowView({...validWindowView, surface: 'panel'})).toContainEqual({
      type: 'invalid_value',
      message: 'Window view surface must be `window`',
    })
  })

  test('should return an error if name does not match the pattern', () => {
    expect(validateWindowView({...validWindowView, name: 'not valid'})).toContainEqual({
      type: 'invalid_format',
      message: 'Window view name must match pattern: ^[a-zA-Z0-9_-]+$',
    })
  })

  test('should accept a reference as the name', () => {
    expect(validateWindowView({...validWindowView, name: '$.resources.my-view'})).toStrictEqual([])
  })

  test('should return an error if dock is not an object', () => {
    expect(validateWindowView({...validWindowView, dock: 'nope'})).toContainEqual({
      type: 'invalid_type',
      message: 'Window view dock must be an object',
    })
  })

  test('should return an error if dock.group is not an allowed value', () => {
    expect(validateWindowView({...validWindowView, dock: {group: 'nope'}})).toContainEqual({
      type: 'invalid_value',
      message: 'Window view dock.group must be one of system, applications, user',
    })
  })

  test('should return an error if dock.order is not a number', () => {
    expect(validateWindowView({...validWindowView, dock: {order: 'nope'}})).toContainEqual({
      type: 'invalid_type',
      message: 'Window view dock.order must be a number',
    })
  })
})

describe('validatePanelView', () => {
  test('should accept a valid panel view', () => {
    expect(validatePanelView(validPanelView)).toStrictEqual([])
  })

  test('should return an error if src is not provided', () => {
    const {src: _src, ...noSrc} = validPanelView
    expect(validatePanelView(noSrc)).toContainEqual({type: 'missing_parameter', message: 'Panel view src is required'})
  })
})

describe('validateAssetSourceView', () => {
  test('should accept a valid asset source view', () => {
    expect(validateAssetSourceView(validAssetSourceView)).toStrictEqual([])
  })

  test('should return an error if surface is wrong', () => {
    expect(validateAssetSourceView({...validAssetSourceView, surface: 'panel'})).toContainEqual({
      type: 'invalid_value',
      message: 'Asset source view surface must be `asset-source`',
    })
  })
})

describe('validateTileView', () => {
  test('should accept a valid tile view', () => {
    expect(validateTileView(validTileView)).toStrictEqual([])
  })

  test('should return an error if size is not provided', () => {
    const {size: _size, ...noSize} = validTileView
    expect(validateTileView(noSize)).toContainEqual({type: 'missing_parameter', message: 'Tile view size is required'})
  })

  test('should return an error if size is invalid', () => {
    expect(validateTileView({...validTileView, size: 'huge'})).toContainEqual({
      type: 'invalid_value',
      message: 'Tile view size must be one of small, large, banner',
    })
  })

  test('should return an error if order is not a number', () => {
    expect(validateTileView({...validTileView, order: 'nope'})).toContainEqual({
      type: 'invalid_type',
      message: 'Tile view order must be a number',
    })
  })
})

describe('validateWebWorker', () => {
  test('should accept a valid web worker', () => {
    expect(validateWebWorker(validWebWorker)).toStrictEqual([])
  })

  test('should return an error if type is wrong', () => {
    expect(validateWebWorker({...validWebWorker, type: 'app'})).toContainEqual({
      type: 'invalid_value',
      message: 'Web worker type must be `worker`',
    })
  })

  test('should return an error if title is not provided', () => {
    const {title: _title, ...noTitle} = validWebWorker
    expect(validateWebWorker(noTitle)).toContainEqual({type: 'missing_parameter', message: 'Web worker title is required'})
  })
})
