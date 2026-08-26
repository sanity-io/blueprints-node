/**
 * Suite fixtures: minimal real definitions (built through `defineWorkflow`,
 * never hand-crafted literals) and a deployment builder targeting the bench's
 * default tag + resource so bench verbs and provider calls see one another.
 */

import type {WorkflowDefinition, WorkflowDeployment, WorkflowDeploymentInput} from '@sanity/workflow-engine'
import {defineWorkflow} from '@sanity/workflow-engine/define'
import {BENCH_TAG, DEFAULT_WORKFLOW_RESOURCE} from '@sanity/workflow-engine-test'

/** A deployable single-flow: parked on `open` (its one exit gated by `when`,
 *  default never), startable with no fields. */
export function parkedFlow(opts?: {
  name?: string
  title?: string
  when?: string
  fields?: WorkflowDefinition['fields']
}): WorkflowDefinition {
  return defineWorkflow({
    name: opts?.name ?? 'blueprint-demo',
    title: opts?.title ?? 'Blueprint demo',
    ...(opts?.fields === undefined ? {} : {fields: opts.fields}),
    initialStage: 'open',
    stages: [{name: 'open', transitions: [{name: 'hold', to: 'end', when: opts?.when ?? 'false'}]}, {name: 'end'}],
  })
}

/** A parent whose one action spawns `childName`. */
export function spawningParent(childName: string, opts?: {name?: string}): WorkflowDefinition {
  return defineWorkflow({
    name: opts?.name ?? 'blueprint-parent',
    title: 'Blueprint parent',
    initialStage: 'spawning',
    stages: [
      {
        name: 'spawning',
        activities: [
          {
            name: 'fan-out',
            actions: [
              {
                name: 'spawn-child',
                spawn: {forEach: "*[_type == 'item']{_id}", definition: {name: childName}},
              },
              // Terminal-status path — without one the activity can never
              // resolve and defineWorkflow rejects the stage as wedgeable.
              {name: 'settle', status: 'done'},
            ],
          },
        ],
        transitions: [{name: 'hold', to: 'end', when: 'false'}],
      },
      {name: 'end'},
    ],
  })
}

export function benchDeployment(
  definitions: WorkflowDefinition[],
  opts?: {resourceAliases?: WorkflowDeployment['resourceAliases']},
): WorkflowDeploymentInput {
  return {
    name: 'main',
    // The baseline acknowledgement for fixtures without floor-bearing features.
    expectedMinReaderModel: 4,
    tag: BENCH_TAG,
    workflowResource: DEFAULT_WORKFLOW_RESOURCE,
    ...(opts?.resourceAliases === undefined ? {} : {resourceAliases: opts.resourceAliases}),
    definitions,
  }
}
