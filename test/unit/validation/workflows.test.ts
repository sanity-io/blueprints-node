import {describe, expect, test} from 'vitest'
import {validateWorkflows} from '../../../src/index.js'

const validResource = {
  name: 'editorial-workflows-production',
  type: 'sanity.workflow',
  lifecycle: {deletionPolicy: 'retain'},
  deployment: {
    name: 'production',
    expectedMinReaderModel: 4,
    tag: 'production',
    workflowResource: {type: 'dataset', id: 'projectId.dataset'},
    definitions: [{name: 'article-review'}],
  },
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

  test('should require a deployment', () => {
    const {deployment: _deployment, ...resource} = validResource
    expect(validateWorkflows(resource)).toContainEqual({
      type: 'missing_parameter',
      message: 'Editorial Workflows deployment is required',
    })
  })

  test('should require a positive expected minimum reader model', () => {
    expect(
      validateWorkflows({
        ...validResource,
        deployment: {...validResource.deployment, expectedMinReaderModel: 0},
      }),
    ).toContainEqual({
      type: 'invalid_value',
      message: 'Editorial Workflows expected minimum reader model must be a positive integer',
    })
  })

  test('should require a supported target resource type', () => {
    expect(
      validateWorkflows({
        ...validResource,
        deployment: {...validResource.deployment, workflowResource: {type: 'invalid', id: 'resource'}},
      }),
    ).toContainEqual({
      type: 'invalid_value',
      message: 'Editorial Workflows target resource type must be one of dataset, canvas, media-library, dashboard',
    })
  })

  test('should require at least one definition', () => {
    expect(
      validateWorkflows({
        ...validResource,
        deployment: {...validResource.deployment, definitions: []},
      }),
    ).toContainEqual({
      type: 'invalid_value',
      message: 'Editorial Workflows deployment must contain at least one definition',
    })
  })

  test('should allow references to definitions outside the deployment', () => {
    const errors = validateWorkflows({
      ...validResource,
      deployment: {
        ...validResource.deployment,
        definitions: [
          {
            name: 'article-review',
            stages: [{activities: [{actions: [{spawn: {definition: {name: 'external-review'}}}]}]}],
          },
        ],
      },
    })

    expect(errors).toStrictEqual([])
  })

  test('should accept a valid resource', () => {
    expect(validateWorkflows(validResource)).toStrictEqual([])
  })
})
