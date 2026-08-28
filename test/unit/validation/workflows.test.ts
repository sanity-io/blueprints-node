import {defineWorkflows} from '@sanity/workflow-blueprint'
import {describe, expect, test} from 'vitest'
import {validateWorkflows} from '../../../src/validation/workflows.js'

const deployment = {
  name: 'production',
  expectedMinReaderModel: 4,
  tag: 'production',
  workflowResource: {type: 'dataset' as const, id: 'projectId.dataset'},
  definitions: [
    {
      name: 'article-review',
      title: 'Article review',
      initialStage: 'draft',
      stages: [{name: 'draft'}],
    },
  ],
}

describe('validateWorkflows', () => {
  test('should accept a resource created by the canonical Workflows definer', () => {
    expect(validateWorkflows(defineWorkflows(deployment))).toStrictEqual([])
  })

  test('should return the canonical validation error for an invalid raw resource', () => {
    const resource = {
      ...defineWorkflows(deployment),
      lifecycle: {deletionPolicy: 'allow'},
    }

    expect(validateWorkflows(resource)).toContainEqual({
      type: 'invalid_value',
      message:
        "workflow resource: deletionPolicy 'allow' is not supported — Workflows definitions are retain-only through blueprints; delete deliberately with the workflow CLI's `definition delete`.",
    })
  })
})
