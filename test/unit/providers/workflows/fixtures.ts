import type {WorkflowDeploymentInput, WorkflowResource} from '@sanity/workflow-engine'
import {defineWorkflow} from '@sanity/workflow-engine/define'

import {defineWorkflows} from '../../../../src/definers/workflows.js'
import {parseWorkflowResource} from '../../../../src/providers/workflows/lifecycle.js'
import type {WorkflowsResource} from '../../../../src/providers/workflows/resource.js'
import type {BlueprintWorkflowsOptions} from '../../../../src/types/workflows.js'

interface WorkflowResourceOptions {
  target?: WorkflowResource
  title?: string
}

export function testWorkflowResource(
  deployment: WorkflowDeploymentInput,
  options?: {lifecycle?: BlueprintWorkflowsOptions['lifecycle']; name?: string},
): WorkflowsResource {
  return parseWorkflowResource(
    defineWorkflows(deployment, {
      name: options?.name ?? `workflows-${deployment.name}`,
      ...(options?.lifecycle === undefined ? {} : {lifecycle: options.lifecycle}),
    }),
  )
}

export function workflowResource({
  target = {type: 'dataset', id: 'abc123.production'},
  title = 'Article review',
}: WorkflowResourceOptions = {}): WorkflowsResource {
  return testWorkflowResource(
    {
      name: 'production',
      expectedMinReaderModel: 4,
      tag: 'production',
      workflowResource: target,
      definitions: [
        defineWorkflow({
          name: 'article-review',
          title,
          initialStage: 'draft',
          stages: [{name: 'draft'}],
        }),
      ],
    },
    {name: 'workflows-production'},
  )
}
