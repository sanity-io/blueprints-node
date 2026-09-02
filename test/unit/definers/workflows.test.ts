import {defineWorkflows as defineWorkflowResource} from '@sanity/workflow-blueprint'
import {describe, expect, test} from 'vitest'
import {defineWorkflows} from '../../../src/definers/workflows.js'
import {workflowDeployment as deployment} from '../fixtures/workflows.js'

describe('defineWorkflows', () => {
  test('should return the Workflows-owned resource unchanged', () => {
    expect(defineWorkflows(deployment)).toStrictEqual(defineWorkflowResource(deployment))
  })

  test('should delegate resource options unchanged', () => {
    const options = {
      name: 'editorial-workflows',
      lifecycle: {
        deletionPolicy: 'protect' as const,
        dependsOn: '$.resources.content',
      },
    }

    expect(defineWorkflows(deployment, options)).toStrictEqual(defineWorkflowResource(deployment, options))
  })

  test('should preserve Workflows validation at manifest evaluation', () => {
    const invalidDeployment = {
      ...deployment,
      definitions: [deployment.definitions[0], deployment.definitions[0]],
    }

    expect(() => defineWorkflows(invalidDeployment)).toThrow(/duplicate definition name "article-review"/)
  })
})
