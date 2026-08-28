import {describe, expect, test} from 'vitest'
import {type BlueprintStudioResource, validateStudio} from '../../../src/index.js'

const validStudio: BlueprintStudioResource = {
  name: 'my-studio',
  type: 'sanity.studio',
  src: './studio',
  slug: 'my-studio',
  project: 'abcdefg',
  title: 'My Studio',
  autoUpdates: {enabled: true},
}

describe('validateStudio', () => {
  test('should return an error if config is falsey', () => {
    const errors = validateStudio(undefined)
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Studio config must be provided'})
  })

  test('should return an error if config is not an object', () => {
    const errors = validateStudio(1)
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio config must be an object'})
  })

  test('should return an error if type is not sanity.studio', () => {
    const errors = validateStudio({...validStudio, type: 'invalid'})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Studio type must be `sanity.studio`'})
  })

  test('should return an error if src is not provided', () => {
    const {src: _src, ...noSrc} = validStudio
    const errors = validateStudio(noSrc)
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Studio src is required'})
  })

  test('should return an error if src is not a string', () => {
    const errors = validateStudio({...validStudio, src: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio src must be a string'})
  })

  test('should return an error if autoUpdates is not provided', () => {
    const {autoUpdates: _au, ...noAutoUpdates} = validStudio
    const errors = validateStudio(noAutoUpdates)
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Studio autoUpdates is required'})
  })

  test('should return an error if autoUpdates is not an object', () => {
    const errors = validateStudio({...validStudio, autoUpdates: 'yes'})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio autoUpdates must be an object'})
  })

  test('should return an error if autoUpdates.enabled is not provided', () => {
    const errors = validateStudio({...validStudio, autoUpdates: {}})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Studio autoUpdates.enabled is required'})
  })

  test('should return an error if autoUpdates.enabled is not a boolean', () => {
    const errors = validateStudio({...validStudio, autoUpdates: {enabled: 'yes'}})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio autoUpdates.enabled must be a boolean'})
  })

  test('should return an error if autoUpdates.version is not a string', () => {
    const errors = validateStudio({...validStudio, autoUpdates: {enabled: true, version: 1}})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio autoUpdates.version must be a string'})
  })

  test('should return an error if basePath is not a string', () => {
    const errors = validateStudio({...validStudio, basePath: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio basePath must be a string'})
  })

  test('should return an error if minify is not a boolean', () => {
    const errors = validateStudio({...validStudio, minify: 'yes'})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio minify must be a boolean'})
  })

  test('should return an error if reactCompiler is not a boolean', () => {
    const errors = validateStudio({...validStudio, reactCompiler: 'yes'})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio reactCompiler must be a boolean'})
  })

  test('should return an error if sourceMap is not a boolean', () => {
    const errors = validateStudio({...validStudio, sourceMap: 'yes'})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio sourceMap must be a boolean'})
  })

  test.each(['My Studio', 'my_studio', 'My-Studio', '-my-studio', 'my-studio-', 'café'])(
    'should return an error if slug is not a valid hostname label: %s',
    (slug) => {
      const errors = validateStudio({...validStudio, slug})
      expect(errors).toContainEqual({type: 'invalid_format', message: 'Studio slug must match pattern: ^[a-z0-9]([a-z0-9-]*[a-z0-9])?$'})
    },
  )

  test.each(['my-studio', 'studio', 's', '2024', 'my-studio-2'])('should accept a valid slug: %s', (slug) => {
    const errors = validateStudio({...validStudio, slug})
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should not check the slug pattern for a reference', () => {
    const errors = validateStudio({...validStudio, slug: '$.parameters.studioSlug'})
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should return an error if project is not a string', () => {
    const errors = validateStudio({...validStudio, project: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio project must be a string'})
  })

  test('should accept a configuration without a project', () => {
    const {project: _project, ...noProject} = validStudio
    const errors = validateStudio(noProject)
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should accept a valid configuration', () => {
    const errors = validateStudio({
      ...validStudio,
      icon: 'icon1234',
      visibility: 'default',
      autoUpdates: {enabled: true, version: '^3.0.0'},
      basePath: '/studio',
      minify: true,
      reactCompiler: false,
      sourceMap: true,
    })
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })
})
