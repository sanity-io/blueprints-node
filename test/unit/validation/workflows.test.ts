import {describe, expect, test} from 'vitest'
import {type BlueprintError, type BlueprintWorkflowsResource, validateWorkflows} from '../../../src/index.js'

const articleReviewDefinition = {
  name: 'article-review',
  title: 'Article review',
  initialStage: 'draft',
  stages: [{name: 'draft'}],
}

const validResource: BlueprintWorkflowsResource = {
  name: 'editorial-workflows-production',
  type: 'sanity.workflow',
  lifecycle: {deletionPolicy: 'retain'},
  deployment: {
    name: 'production',
    expectedMinReaderModel: 4,
    tag: 'production',
    workflowResource: {type: 'dataset', id: 'projectId.dataset'},
    definitions: [articleReviewDefinition],
  },
}

function expectDeploymentError(deployment: unknown, error: BlueprintError): void {
  expect(validateWorkflows({...validResource, deployment})).toContainEqual(error)
}

function resourceWithDefinitions(definitions: unknown[]): unknown {
  return {...validResource, deployment: {...validResource.deployment, definitions}}
}

describe('validateWorkflows', () => {
  test('should return an error if config is falsey', () => {
    expect(validateWorkflows(undefined)).toContainEqual({
      type: 'invalid_value',
      message: 'Editorial Workflows config must be provided',
    })
  })

  test('should return an error if config is not an object', () => {
    expect(validateWorkflows(1)).toContainEqual({
      type: 'invalid_type',
      message: 'Editorial Workflows config must be an object',
    })
  })

  test('should report the base resource error once if type is missing', () => {
    const {type: _type, ...resource} = validResource
    expect(validateWorkflows(resource)).toStrictEqual([{type: 'missing_parameter', message: '`type` is required'}])
  })

  test('should require the sanity.workflow resource type', () => {
    expect(validateWorkflows({...validResource, type: 'invalid'})).toContainEqual({
      type: 'invalid_value',
      message: 'Editorial Workflows type must be `sanity.workflow`',
    })
  })

  test('should require a non-empty resource name', () => {
    expect(validateWorkflows({...validResource, name: ''})).toContainEqual({
      type: 'invalid_value',
      message: 'Editorial Workflows resource name must be a non-empty string',
    })
  })

  test.each(['allow', 'replace'] as const)('should reject the %s deletion policy', (deletionPolicy) => {
    expect(validateWorkflows({...validResource, lifecycle: {deletionPolicy}})).toContainEqual({
      type: 'invalid_value',
      message: `Editorial Workflows deletion policy \`${deletionPolicy}\` is not supported; use \`retain\` (the default) or \`protect\``,
    })
  })

  test('should require the lifecycle to be an object', () => {
    expect(validateWorkflows({...validResource, lifecycle: 'retain'})).toContainEqual({
      type: 'invalid_type',
      message: '`lifecycle` must be an object',
    })
  })

  test('should reject ownership actions until the provider defines their semantics', () => {
    expect(validateWorkflows({...validResource, lifecycle: {ownershipAction: {type: 'detach'}}})).toContainEqual({
      type: 'invalid_value',
      message: 'Editorial Workflows ownership actions are not supported until the resource provider defines stable ownership semantics',
    })
  })

  test('should require a deployment', () => {
    const {deployment: _deployment, ...resource} = validResource
    expect(validateWorkflows(resource)).toContainEqual({
      type: 'missing_parameter',
      message: 'Editorial Workflows deployment is required',
    })
  })

  test('should require the deployment to be an object', () => {
    expectDeploymentError('production', {
      type: 'invalid_type',
      message: 'Editorial Workflows deployment must be an object',
    })
  })

  test.each([
    ['name', 1, 'invalid_type', 'Editorial Workflows deployment name must be a string'],
    ['name', '', 'invalid_value', 'Editorial Workflows deployment name must be a non-empty string'],
    ['tag', 1, 'invalid_type', 'Editorial Workflows deployment tag must be a string'],
    ['tag', '', 'invalid_value', 'Editorial Workflows deployment tag must be a non-empty string'],
  ] as const)('should reject invalid deployment %s values', (field, value, type, message) => {
    expectDeploymentError({...validResource.deployment, [field]: value}, {type, message})
  })

  test.each([
    ['name', 'Editorial Workflows deployment name is required'],
    ['tag', 'Editorial Workflows deployment tag is required'],
  ] as const)('should require the deployment %s', (field, message) => {
    const deployment = {...validResource.deployment} as Record<string, unknown>
    delete deployment[field]
    expectDeploymentError(deployment, {type: 'missing_parameter', message})
  })

  test('should require an expected minimum reader model', () => {
    const {expectedMinReaderModel: _expectedMinReaderModel, ...deployment} = validResource.deployment
    expectDeploymentError(deployment, {
      type: 'missing_parameter',
      message: 'Editorial Workflows expected minimum reader model is required',
    })
  })

  test.each([0, 1.5, '4'])('should reject invalid expected minimum reader model %s', (expectedMinReaderModel) => {
    expectDeploymentError(
      {...validResource.deployment, expectedMinReaderModel},
      {
        type: 'invalid_value',
        message: 'Editorial Workflows expected minimum reader model must be a positive integer',
      },
    )
  })

  test('should require a target resource', () => {
    const {workflowResource: _workflowResource, ...deployment} = validResource.deployment
    expectDeploymentError(deployment, {
      type: 'missing_parameter',
      message: 'Editorial Workflows target resource is required',
    })
  })

  test('should require the target resource to be an object', () => {
    expectDeploymentError(
      {...validResource.deployment, workflowResource: 'dataset'},
      {
        type: 'invalid_type',
        message: 'Editorial Workflows target resource must be an object',
      },
    )
  })

  test.each([
    [{type: 'dataset'}, 'missing_parameter', 'Editorial Workflows target resource ID is required'],
    [{type: 'dataset', id: 1}, 'invalid_type', 'Editorial Workflows target resource ID must be a string'],
    [{type: 'dataset', id: ''}, 'invalid_value', 'Editorial Workflows target resource ID must be a non-empty string'],
    [{id: 'resource'}, 'missing_parameter', 'Editorial Workflows target resource type is required'],
    [
      {type: 'invalid', id: 'resource'},
      'invalid_value',
      'Editorial Workflows target resource type must be one of dataset, canvas, media-library, dashboard',
    ],
  ] as const)('should reject an invalid target resource %#', (workflowResource, type, message) => {
    expectDeploymentError({...validResource.deployment, workflowResource}, {type, message})
  })

  test('should require resource aliases to be an array', () => {
    expectDeploymentError(
      {...validResource.deployment, resourceAliases: 'content'},
      {
        type: 'invalid_type',
        message: 'Editorial Workflows resource aliases must be an array',
      },
    )
  })

  test('should require each resource alias to be an object', () => {
    expectDeploymentError(
      {...validResource.deployment, resourceAliases: ['content']},
      {
        type: 'invalid_type',
        message: 'Editorial Workflows resource alias must be an object',
      },
    )
  })

  test.each([
    [{resource: {type: 'dataset', id: 'projectId.content'}}, 'missing_parameter', 'Editorial Workflows resource alias name is required'],
    [
      {name: 1, resource: {type: 'dataset', id: 'projectId.content'}},
      'invalid_type',
      'Editorial Workflows resource alias name must be a string',
    ],
    [
      {name: '', resource: {type: 'dataset', id: 'projectId.content'}},
      'invalid_value',
      'Editorial Workflows resource alias name must be a non-empty string',
    ],
    [{name: 'content'}, 'missing_parameter', 'Editorial Workflows resource alias target is required'],
  ] as const)('should reject an invalid resource alias %#', (binding, type, message) => {
    expectDeploymentError({...validResource.deployment, resourceAliases: [binding]}, {type, message})
  })

  test('should validate a resource alias target', () => {
    expectDeploymentError(
      {
        ...validResource.deployment,
        resourceAliases: [{name: 'content', resource: {type: 'invalid', id: 'resource'}}],
      },
      {
        type: 'invalid_value',
        message: 'Editorial Workflows target resource type must be one of dataset, canvas, media-library, dashboard',
      },
    )
  })

  test('should reject duplicate resource alias names', () => {
    const binding = {name: 'content', resource: {type: 'dataset', id: 'projectId.content'}}
    expectDeploymentError(
      {...validResource.deployment, resourceAliases: [binding, binding]},
      {
        type: 'invalid_value',
        message: 'Editorial Workflows resource alias name `content` is duplicated',
      },
    )
  })

  test('should report every distinct duplicate resource alias name', () => {
    const content = {name: 'content', resource: {type: 'dataset' as const, id: 'projectId.content'}}
    const media = {name: 'media', resource: {type: 'media-library' as const, id: 'mediaLibraryId'}}

    expect(
      validateWorkflows({
        ...validResource,
        deployment: {...validResource.deployment, resourceAliases: [content, content, content, media, media]},
      }),
    ).toStrictEqual([
      {type: 'invalid_value', message: 'Editorial Workflows resource alias name `content` is duplicated'},
      {type: 'invalid_value', message: 'Editorial Workflows resource alias name `media` is duplicated'},
    ])
  })

  test('should accept valid resource aliases', () => {
    expect(
      validateWorkflows({
        ...validResource,
        deployment: {
          ...validResource.deployment,
          resourceAliases: [{name: 'content', resource: {type: 'dataset', id: 'projectId.content'}}],
        },
      }),
    ).toStrictEqual([])
  })

  test('should require a definitions array', () => {
    const {definitions: _definitions, ...deployment} = validResource.deployment
    expectDeploymentError(deployment, {
      type: 'missing_parameter',
      message: 'Editorial Workflows definitions array is required',
    })
  })

  test('should require definitions to be an array', () => {
    expectDeploymentError(
      {...validResource.deployment, definitions: 'article-review'},
      {
        type: 'invalid_type',
        message: 'Editorial Workflows definitions must be an array',
      },
    )
  })

  test('should require at least one definition', () => {
    expectDeploymentError(
      {...validResource.deployment, definitions: []},
      {
        type: 'invalid_value',
        message: 'Editorial Workflows deployment must contain at least one definition',
      },
    )
  })

  test('should require each definition to be an object', () => {
    expect(validateWorkflows(resourceWithDefinitions(['article-review']))).toContainEqual({
      type: 'invalid_type',
      message: 'Editorial Workflows definition must be an object',
    })
  })

  test.each([
    [{}, 'missing_parameter', 'Editorial Workflows definition name is required'],
    [{name: 1}, 'invalid_type', 'Editorial Workflows definition name must be a string'],
    [{name: ''}, 'invalid_value', 'Editorial Workflows definition name must be a non-empty string'],
  ] as const)('should reject an invalid definition %#', (definition, type, message) => {
    expect(validateWorkflows(resourceWithDefinitions([definition]))).toContainEqual({type, message})
  })

  test('should reject duplicate definition names', () => {
    expect(validateWorkflows(resourceWithDefinitions([{name: 'article-review'}, {name: 'article-review'}]))).toContainEqual({
      type: 'invalid_value',
      message: 'Editorial Workflows definition name `article-review` is duplicated',
    })
  })

  test('should report every distinct duplicate definition name', () => {
    expect(
      validateWorkflows(
        resourceWithDefinitions([{name: 'article-review'}, {name: 'article-review'}, {name: 'legal-review'}, {name: 'legal-review'}]),
      ),
    ).toStrictEqual([
      {type: 'invalid_value', message: 'Editorial Workflows definition name `article-review` is duplicated'},
      {type: 'invalid_value', message: 'Editorial Workflows definition name `legal-review` is duplicated'},
    ])
  })

  test('should collect all independent deployment errors in order', () => {
    expect(
      validateWorkflows({
        ...validResource,
        deployment: {
          name: '',
          tag: 1,
          expectedMinReaderModel: 0,
          workflowResource: {type: 'invalid', id: ''},
          resourceAliases: 'content',
          definitions: [{}, {name: ''}],
        },
      }),
    ).toStrictEqual([
      {type: 'invalid_value', message: 'Editorial Workflows deployment name must be a non-empty string'},
      {type: 'invalid_type', message: 'Editorial Workflows deployment tag must be a string'},
      {type: 'invalid_value', message: 'Editorial Workflows expected minimum reader model must be a positive integer'},
      {type: 'invalid_value', message: 'Editorial Workflows target resource ID must be a non-empty string'},
      {
        type: 'invalid_value',
        message: 'Editorial Workflows target resource type must be one of dataset, canvas, media-library, dashboard',
      },
      {type: 'invalid_type', message: 'Editorial Workflows resource aliases must be an array'},
      {type: 'missing_parameter', message: 'Editorial Workflows definition name is required'},
      {type: 'invalid_value', message: 'Editorial Workflows definition name must be a non-empty string'},
    ])
  })

  test('should accept a valid resource', () => {
    expect(validateWorkflows(validResource)).toStrictEqual([])
  })
})
