import {describe, expect, test} from 'vitest'
import {type BlueprintStudioResource, validateStudio} from '../../../src/index.js'

const validStudio: BlueprintStudioResource = {
  name: 'my-studio',
  type: 'sanity.studio',
  root: './studio',
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

  test('should return an error if root is not provided', () => {
    const {root: _root, ...noRoot} = validStudio
    const errors = validateStudio(noRoot)
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Studio root is required'})
  })

  test('should return an error if root is not a string', () => {
    const errors = validateStudio({...validStudio, root: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio root must be a string'})
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

  describe('mfManifest', () => {
    test.each([null, 'manifest', 1, []])('should return an error if mfManifest is not an object: %j', (mfManifest) => {
      const errors = validateStudio({...validStudio, mfManifest})
      expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio mfManifest must be an object'})
    })

    test('should accept an undefined mfManifest', () => {
      const errors = validateStudio({...validStudio, mfManifest: undefined})
      expect(errors, JSON.stringify(errors)).toHaveLength(0)
    })
  })

  describe('workspaces', () => {
    const validWorkspace = {
      projectId: 'abcdefg',
      dataset: 'production',
      schemaDescriptorId: 'descriptor-id',
      name: 'default',
      title: 'Default',
      subtitle: undefined,
      basePath: '/',
      icon: undefined,
    }

    test('should return an error if workspaces is not an array', () => {
      const errors = validateStudio({...validStudio, workspaces: {}})
      expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio workspaces must be an array'})
    })

    test('should return an error if a workspace is not provided', () => {
      const errors = validateStudio({...validStudio, workspaces: [null]})
      expect(errors).toContainEqual({type: 'invalid_value', message: 'Studio workspaces[0] must be provided'})
    })

    test('should return an error if a workspace is not an object', () => {
      const errors = validateStudio({...validStudio, workspaces: [validWorkspace, 'workspace']})
      expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio workspaces[1] must be an object'})
    })

    test.each(['projectId', 'dataset', 'schemaDescriptorId', 'name'])('should return an error if workspace %s is missing', (field) => {
      const errors = validateStudio({...validStudio, workspaces: [{...validWorkspace, [field]: undefined}]})
      expect(errors).toContainEqual({type: 'missing_parameter', message: `Studio workspaces[0].${field} is required`})
    })

    test.each(['projectId', 'dataset', 'schemaDescriptorId', 'name', 'title', 'subtitle', 'basePath', 'icon'])(
      'should return an error if workspace %s is not a string',
      (field) => {
        const errors = validateStudio({...validStudio, workspaces: [{...validWorkspace, [field]: 1}]})
        expect(errors).toContainEqual({type: 'invalid_type', message: `Studio workspaces[0].${field} must be a string`})
      },
    )

    test('should accept valid workspaces', () => {
      const errors = validateStudio({...validStudio, workspaces: [validWorkspace]})
      expect(errors, JSON.stringify(errors)).toHaveLength(0)
    })
  })

  describe('schemaInputs', () => {
    const validSchemaInput = {
      projectId: 'abcdefg',
      dataset: 'production',
      name: 'default',
      title: 'Default',
      manifestSchema: [],
    }

    test('should return an error if schemaInputs is not an array', () => {
      const errors = validateStudio({...validStudio, schemaInputs: 'inputs'})
      expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio schemaInputs must be an array'})
    })

    test('should return an error if a schema input is not provided', () => {
      const errors = validateStudio({...validStudio, schemaInputs: [undefined]})
      expect(errors).toContainEqual({type: 'invalid_value', message: 'Studio schemaInputs[0] must be provided'})
    })

    test('should return an error if a schema input is not an object', () => {
      const errors = validateStudio({...validStudio, schemaInputs: [1]})
      expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio schemaInputs[0] must be an object'})
    })

    test.each(['projectId', 'dataset', 'name', 'manifestSchema'])('should return an error if schema input %s is missing', (field) => {
      const errors = validateStudio({...validStudio, schemaInputs: [{...validSchemaInput, [field]: undefined}]})
      expect(errors).toContainEqual({type: 'missing_parameter', message: `Studio schemaInputs[0].${field} is required`})
    })

    test.each(['projectId', 'dataset', 'name', 'title'])('should return an error if schema input %s is not a string', (field) => {
      const errors = validateStudio({...validStudio, schemaInputs: [{...validSchemaInput, [field]: 1}]})
      expect(errors).toContainEqual({type: 'invalid_type', message: `Studio schemaInputs[0].${field} must be a string`})
    })

    test('should return an error if schema input manifestSchema is not an array', () => {
      const errors = validateStudio({...validStudio, schemaInputs: [{...validSchemaInput, manifestSchema: {}}]})
      expect(errors).toContainEqual({type: 'invalid_type', message: 'Studio schemaInputs[0].manifestSchema must be an array'})
    })

    test('should accept valid schema inputs', () => {
      const errors = validateStudio({...validStudio, schemaInputs: [validSchemaInput]})
      expect(errors, JSON.stringify(errors)).toHaveLength(0)
    })
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
