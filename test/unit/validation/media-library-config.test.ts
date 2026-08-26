import {describe, expect, test} from 'vitest'
import {type BlueprintMediaLibraryConfigResource, validateMediaLibraryConfig} from '../../../src/index.js'

const validConfig: BlueprintMediaLibraryConfigResource = {
  type: 'sanity.installation.config',
  name: 'media-library',
  appType: 'media-library',
  src: './media-library.config.ts',
}

describe('validateMediaLibraryConfig', () => {
  test('should return an error if config is falsey', () => {
    expect(validateMediaLibraryConfig(undefined)).toContainEqual({type: 'invalid_value', message: 'Media Library config must be provided'})
  })

  test('should return an error if config is not an object', () => {
    expect(validateMediaLibraryConfig(1)).toContainEqual({type: 'invalid_type', message: 'Media Library config must be an object'})
  })

  test('should accept a valid config', () => {
    expect(validateMediaLibraryConfig(validConfig)).toStrictEqual([])
  })

  test('should return an error if type is not sanity.installation.config', () => {
    expect(validateMediaLibraryConfig({...validConfig, type: 'invalid'})).toContainEqual({
      type: 'invalid_value',
      message: 'Media Library config type must be `sanity.installation.config`',
    })
  })

  test('should return an error if appType is not media-library', () => {
    expect(validateMediaLibraryConfig({...validConfig, appType: 'canvas'})).toContainEqual({
      type: 'invalid_value',
      message: 'Media Library config appType must be `media-library`',
    })
  })

  test('should return an error if src is not provided', () => {
    const {src: _src, ...noSrc} = validConfig
    expect(validateMediaLibraryConfig(noSrc)).toContainEqual({type: 'missing_parameter', message: 'Media Library config src is required'})
  })

  test('should return an error if src is not a string', () => {
    expect(validateMediaLibraryConfig({...validConfig, src: 1})).toContainEqual({
      type: 'invalid_type',
      message: 'Media Library config src must be a string',
    })
  })
})
