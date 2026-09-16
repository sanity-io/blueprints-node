import {describe, expect, test} from 'vitest'
import {type BlueprintMediaLibraryConfigResource, validateInstallationConfig, validateMediaLibraryConfig} from '../../../src/index.js'

const validConfig: BlueprintMediaLibraryConfigResource = {
  type: 'sanity.installation.config',
  name: 'media-library',
  appType: 'media-library',
  root: './media-library',
  fields: [{name: 'brand', title: 'Brand', src: './src/fields/brand.tsx'}],
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

  test('should return an error if root is not provided', () => {
    const {root: _root, ...noRoot} = validConfig
    expect(validateMediaLibraryConfig(noRoot)).toContainEqual({type: 'missing_parameter', message: 'Media Library config root is required'})
  })

  test('should return an error if root is not a string', () => {
    expect(validateMediaLibraryConfig({...validConfig, root: 1})).toContainEqual({
      type: 'invalid_type',
      message: 'Media Library config root must be a string',
    })
  })

  test('should return an error if root is an absolute path', () => {
    expect(validateMediaLibraryConfig({...validConfig, root: '/etc/media-library'})).toContainEqual({
      type: 'invalid_value',
      message: 'Media Library config root must be a relative path within the blueprint directory',
    })
  })

  test('should return an error if root escapes the blueprint directory', () => {
    expect(validateMediaLibraryConfig({...validConfig, root: '../media-library'})).toContainEqual({
      type: 'invalid_value',
      message: 'Media Library config root must be a relative path within the blueprint directory',
    })
  })

  test('should accept a root that is a reference', () => {
    expect(validateMediaLibraryConfig({...validConfig, root: '$.values.mlRoot'})).toStrictEqual([])
  })

  test('should return an error if fields is not provided', () => {
    const {fields: _fields, ...noFields} = validConfig
    expect(validateMediaLibraryConfig(noFields)).toContainEqual({
      type: 'missing_parameter',
      message: 'Media Library config fields is required',
    })
  })

  test('should return an error if fields is empty', () => {
    expect(validateMediaLibraryConfig({...validConfig, fields: []})).toContainEqual({
      type: 'invalid_value',
      message: 'Media Library config must declare at least one field',
    })
  })

  test('should return an error if field names are not unique', () => {
    expect(
      validateMediaLibraryConfig({
        ...validConfig,
        fields: [
          {name: 'brand', title: 'Brand', src: './src/fields/brand.tsx'},
          {name: 'brand', title: 'Brand 2', src: './src/fields/brand2.tsx'},
        ],
      }),
    ).toContainEqual({type: 'invalid_value', message: 'Media Library config field names must be unique'})
  })

  test('should return an error if a field is not an object', () => {
    expect(validateMediaLibraryConfig({...validConfig, fields: [1]})).toContainEqual({
      type: 'invalid_type',
      message: 'Media Library config field must be an object',
    })
  })

  test('should return an error if a field name is not provided', () => {
    expect(validateMediaLibraryConfig({...validConfig, fields: [{title: 'Brand', src: './src/fields/brand.tsx'}]})).toContainEqual({
      type: 'missing_parameter',
      message: 'Media Library config field name is required',
    })
  })

  test('should return an error if a field title is not provided', () => {
    expect(validateMediaLibraryConfig({...validConfig, fields: [{name: 'brand', src: './src/fields/brand.tsx'}]})).toContainEqual({
      type: 'missing_parameter',
      message: 'Media Library config field title is required',
    })
  })

  test('should return an error if a field src is an absolute path', () => {
    expect(validateMediaLibraryConfig({...validConfig, fields: [{name: 'brand', title: 'Brand', src: '/etc/brand.tsx'}]})).toContainEqual({
      type: 'invalid_value',
      message: 'Media Library config field src must be a relative path within the config root',
    })
  })

  test('should return an error if a field src escapes the root', () => {
    expect(validateMediaLibraryConfig({...validConfig, fields: [{name: 'brand', title: 'Brand', src: '../brand.tsx'}]})).toContainEqual({
      type: 'invalid_value',
      message: 'Media Library config field src must be a relative path within the config root',
    })
  })

  test('should return an error if a field public is not a boolean', () => {
    expect(
      validateMediaLibraryConfig({...validConfig, fields: [{name: 'brand', title: 'Brand', src: './src/fields/brand.tsx', public: 'yes'}]}),
    ).toContainEqual({type: 'invalid_type', message: 'Media Library config field public must be a boolean'})
  })

  test('should accept a field src that is a reference', () => {
    expect(validateMediaLibraryConfig({...validConfig, fields: [{name: 'brand', title: 'Brand', src: '$.values.brandSrc'}]})).toStrictEqual(
      [],
    )
  })
})

describe('validateInstallationConfig', () => {
  test('should accept any appType string', () => {
    expect(validateInstallationConfig({...validConfig, appType: 'canvas'})).toStrictEqual([])
  })

  test('should return an error if appType is not provided', () => {
    const {appType: _appType, ...noAppType} = validConfig
    expect(validateInstallationConfig(noAppType)).toContainEqual({
      type: 'missing_parameter',
      message: 'Installation config appType is required',
    })
  })

  test('should use the generic label in error messages', () => {
    expect(validateInstallationConfig(undefined)).toContainEqual({type: 'invalid_value', message: 'Installation config must be provided'})
  })
})
