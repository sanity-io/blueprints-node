import {afterEach, describe, expect, test, vi} from 'vitest'
import * as index from '../../../src/index.js'
import * as workflows from '../../../src/validation/workflows.js'

const validResource = {
  name: 'workflows-production',
  type: 'sanity.workflow',
  deployment: {
    name: 'production',
    tag: 'production',
    expectedMinReaderModel: 4,
    workflowResource: {type: 'dataset', id: 'abc123.production'},
    definitions: [{name: 'article-review'}],
  },
}

function withDeployment(deployment: Record<string, unknown>) {
  return {...validResource, deployment: {...validResource.deployment, ...deployment}}
}

describe('validateWorkflows', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should return an error if config is falsey', () => {
    const errors = workflows.validateWorkflows(undefined)
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Editorial Workflows config must be provided'})
  })

  test('should return an error if config is not an object', () => {
    const errors = workflows.validateWorkflows(1)
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Editorial Workflows config must be an object'})
  })

  test('should return an error if validateResource returns an error', () => {
    const spy = vi.spyOn(index, 'validateResource').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    const errors = workflows.validateWorkflows(validResource)
    expect(errors).toContainEqual({type: 'test', message: 'this is a test'})
    expect(spy).toHaveBeenCalledOnce()
  })

  test('should return an error if name is empty', () => {
    const errors = workflows.validateWorkflows({...validResource, name: ''})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Editorial Workflows resource name must be a non-empty string'})
  })

  test('should return an error if type is not provided', () => {
    const {type: _type, ...resource} = validResource
    const errors = workflows.validateWorkflows(resource)
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Editorial Workflows type is required'})
  })

  test('should return an error if type is not sanity.workflow', () => {
    const errors = workflows.validateWorkflows({...validResource, type: 'invalid'})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Editorial Workflows type must be `sanity.workflow`'})
  })

  test.each(['allow', 'replace'])('should return an error if deletionPolicy is %s', (deletionPolicy) => {
    const errors = workflows.validateWorkflows({...validResource, lifecycle: {deletionPolicy}})
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: `Editorial Workflows deletion policy \`${deletionPolicy}\` is not supported; definitions are retain-only through Blueprints`,
    })
  })

  test.each(['retain', 'protect'])('should accept the %s deletionPolicy', (deletionPolicy) => {
    const errors = workflows.validateWorkflows({...validResource, lifecycle: {deletionPolicy}})
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should return an error if deployment is not provided', () => {
    const {deployment: _deployment, ...resource} = validResource
    const errors = workflows.validateWorkflows(resource)
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Editorial Workflows deployment is required'})
  })

  test('should return an error if deployment is not an object', () => {
    const errors = workflows.validateWorkflows({...validResource, deployment: 'production'})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Editorial Workflows deployment must be an object'})
  })

  test('should return an error if deployment name is not provided', () => {
    const {name: _name, ...deployment} = validResource.deployment
    const errors = workflows.validateWorkflows({...validResource, deployment})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Editorial Workflows deployment name is required'})
  })

  test('should return an error if deployment name is not a string', () => {
    const errors = workflows.validateWorkflows(withDeployment({name: 1}))
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Editorial Workflows deployment name must be a string'})
  })

  test('should return an error if deployment tag is empty', () => {
    const errors = workflows.validateWorkflows(withDeployment({tag: ''}))
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Editorial Workflows deployment tag must be a non-empty string'})
  })

  test.each(['Production', 'prod_1', '-prod', 'prod.1'])('should return an error if deployment tag is %s', (tag) => {
    const errors = workflows.validateWorkflows(withDeployment({tag}))
    expect(errors).toContainEqual({
      type: 'invalid_format',
      message: 'Editorial Workflows deployment tag must contain only lowercase letters, digits, and dashes, and must not start with a dash',
    })
  })

  test('should return an error if deployment name has an invalid format', () => {
    const errors = workflows.validateWorkflows(withDeployment({name: 'Production'}))
    expect(errors).toContainEqual({
      type: 'invalid_format',
      message:
        'Editorial Workflows deployment name must contain only lowercase letters, digits, and dashes, and must not start with a dash',
    })
  })

  test('should skip format validation when name and tag are references', () => {
    const errors = workflows.validateWorkflows(withDeployment({name: '$.values.deployment', tag: '$.values.tag'}))
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should return an error if expectedMinReaderModel is not provided', () => {
    const {expectedMinReaderModel: _model, ...deployment} = validResource.deployment
    const errors = workflows.validateWorkflows({...validResource, deployment})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Editorial Workflows expected minimum reader model is required'})
  })

  test.each([0, -1, 1.5, '4'])('should return an error if expectedMinReaderModel is %s', (expectedMinReaderModel) => {
    const errors = workflows.validateWorkflows(withDeployment({expectedMinReaderModel}))
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Editorial Workflows expected minimum reader model must be a positive integer',
    })
  })

  test('should return an error if workflowResource is not provided', () => {
    const {workflowResource: _target, ...deployment} = validResource.deployment
    const errors = workflows.validateWorkflows({...validResource, deployment})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Editorial Workflows target resource is required'})
  })

  test('should return an error if workflowResource is not an object', () => {
    const errors = workflows.validateWorkflows(withDeployment({workflowResource: 'abc123.production'}))
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Editorial Workflows target resource must be an object'})
  })

  test('should return an error if workflowResource type is not supported', () => {
    const errors = workflows.validateWorkflows(withDeployment({workflowResource: {type: 'invalid', id: 'resource'}}))
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Editorial Workflows target resource type must be one of dataset, canvas, media-library, dashboard',
    })
  })

  test('should return an error if workflowResource id is not provided', () => {
    const errors = workflows.validateWorkflows(withDeployment({workflowResource: {type: 'dataset'}}))
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Editorial Workflows target resource ID is required'})
  })

  test('should return an error if a dataset workflowResource id is not projectId.dataset', () => {
    const errors = workflows.validateWorkflows(withDeployment({workflowResource: {type: 'dataset', id: 'production'}}))
    expect(errors).toContainEqual({
      type: 'invalid_format',
      message: 'Editorial Workflows dataset target resource ID must be in the form `<projectId>.<dataset>`',
    })
  })

  test('should skip dataset id format validation when the id is a reference', () => {
    const errors = workflows.validateWorkflows(withDeployment({workflowResource: {type: 'dataset', id: '$.values.workflow-dataset'}}))
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should accept a non-dataset workflowResource id without a dot', () => {
    const errors = workflows.validateWorkflows(withDeployment({workflowResource: {type: 'media-library', id: 'ml123'}}))
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should return an error if resourceAliases is not an array', () => {
    const errors = workflows.validateWorkflows(withDeployment({resourceAliases: {}}))
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Editorial Workflows resource aliases must be an array'})
  })

  test('should return an error if a resource alias is missing its resource', () => {
    const errors = workflows.validateWorkflows(withDeployment({resourceAliases: [{name: 'content'}]}))
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Editorial Workflows resource alias resource is required'})
  })

  test('should return an error if a resource alias name is empty', () => {
    const errors = workflows.validateWorkflows(
      withDeployment({resourceAliases: [{name: '', resource: {type: 'dataset', id: 'abc123.content'}}]}),
    )
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Editorial Workflows resource alias name must be a non-empty string'})
  })

  test('should validate the resource of each alias', () => {
    const errors = workflows.validateWorkflows(withDeployment({resourceAliases: [{name: 'content', resource: {type: 'invalid', id: 'x'}}]}))
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Editorial Workflows target resource type must be one of dataset, canvas, media-library, dashboard',
    })
  })

  test('should accept valid resource aliases', () => {
    const errors = workflows.validateWorkflows(
      withDeployment({resourceAliases: [{name: 'content', resource: {type: 'dataset', id: 'abc123.content'}}]}),
    )
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should return an error if definitions is not provided', () => {
    const {definitions: _definitions, ...deployment} = validResource.deployment
    const errors = workflows.validateWorkflows({...validResource, deployment})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Editorial Workflows definitions array is required'})
  })

  test('should return an error if definitions is not an array', () => {
    const errors = workflows.validateWorkflows(withDeployment({definitions: {}}))
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Editorial Workflows definitions must be an array'})
  })

  test('should return an error if definitions is empty', () => {
    const errors = workflows.validateWorkflows(withDeployment({definitions: []}))
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Editorial Workflows deployment must contain at least one definition'})
  })

  test('should return an error if a definition is not an object', () => {
    const errors = workflows.validateWorkflows(withDeployment({definitions: ['article-review']}))
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Editorial Workflows definition must be an object'})
  })

  test('should return an error if a definition has no name', () => {
    const errors = workflows.validateWorkflows(withDeployment({definitions: [{title: 'Article review'}]}))
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Editorial Workflows definition name is required'})
  })

  test('should return an error for each duplicated definition name', () => {
    const errors = workflows.validateWorkflows(
      withDeployment({definitions: [{name: 'article-review'}, {name: 'article-review'}, {name: 'legal-review'}, {name: 'legal-review'}]}),
    )
    expect(errors).toStrictEqual([
      {type: 'invalid_value', message: 'Editorial Workflows definition name `article-review` is duplicated'},
      {type: 'invalid_value', message: 'Editorial Workflows definition name `legal-review` is duplicated'},
    ])
  })

  test('should not inspect definition fields other than name', () => {
    const errors = workflows.validateWorkflows(
      withDeployment({definitions: [{name: 'article-review', title: 'Article review', initialStage: 'draft', stages: [{name: 'draft'}]}]}),
    )
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })

  test('should accept a valid resource', () => {
    const errors = workflows.validateWorkflows(validResource)
    expect(errors, JSON.stringify(errors)).toHaveLength(0)
  })
})
