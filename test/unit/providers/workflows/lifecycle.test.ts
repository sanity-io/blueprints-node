import {hashDefinitionContent, WORKFLOW_DEFINITION_TYPE, type WorkflowClient} from '@sanity/workflow-engine'
import {createBench} from '@sanity/workflow-engine-test'
import {describe, expect, test} from 'vitest'

import {
  destroyWorkflowResource,
  parseWorkflowResource,
  provisionWorkflowResource,
  readWorkflowResource,
  rollbackWorkflowResource,
  workflowResourceExternalId,
} from '../../../../src/providers/workflows/lifecycle.js'
import {WORKFLOW_RESOURCE_TYPE} from '../../../../src/providers/workflows/resource.js'
import {testWorkflowResource} from './fixtures.js'
import {benchDeployment, parkedFlow, spawningParent} from './lifecycle-fixtures.js'

async function deployBlueprintDemoUpdate(client: WorkflowClient) {
  const v1 = testWorkflowResource(benchDeployment([parkedFlow({title: 'One'})]))
  const resource = testWorkflowResource(benchDeployment([parkedFlow({title: 'Two'})]))
  await provisionWorkflowResource({resource: v1, client})
  const receipt = await provisionWorkflowResource({resource, client})
  return {resource, receipt}
}

async function provisionAndRollback(resource: unknown, client: WorkflowClient): Promise<void> {
  const receipt = await provisionWorkflowResource({resource, client})
  await rollbackWorkflowResource({resource, receipt, client})
}

async function provisionBlueprintDemo() {
  const bench = createBench()
  const resource = testWorkflowResource(benchDeployment([parkedFlow()]))
  const receipt = await provisionWorkflowResource({resource, client: bench.client})
  return {bench, receipt, resource}
}

describe('provisionWorkflowResource', () => {
  test('provisions the definitions as created v1; re-provisioning identical content is unchanged', async () => {
    const bench = createBench()
    const resource = testWorkflowResource(benchDeployment([parkedFlow()]))

    const first = await provisionWorkflowResource({resource, client: bench.client})
    expect(first.results).toEqual([{name: 'blueprint-demo', version: 1, status: 'created'}])

    const second = await provisionWorkflowResource({resource, client: bench.client})
    expect(second.results).toEqual([{name: 'blueprint-demo', version: 1, status: 'unchanged'}])
  })

  test('changed content mints the next immutable version, leaving v1 in the lake', async () => {
    const bench = createBench()
    const {receipt: second} = await deployBlueprintDemoUpdate(bench.client)

    expect(second.results).toEqual([{name: 'blueprint-demo', version: 2, status: 'created'}])
    const versions = await bench.client.fetch<number[]>(`*[_type == "${WORKFLOW_DEFINITION_TYPE}" && name == "blueprint-demo"].version`)
    expect(versions.toSorted()).toEqual([1, 2])
  })

  test('provision expands @<handle>: references — the deployed definition stores physical refs', async () => {
    const bench = createBench()
    const aliased = parkedFlow({when: 'count(*[_id == "@content:cfg"]) > 0'})
    const resource = testWorkflowResource(
      benchDeployment([aliased], {
        resourceAliases: [{name: 'content', resource: {type: 'dataset', id: 'projA.test'}}],
      }),
    )

    await provisionWorkflowResource({resource, client: bench.client})

    const deployedWhen = await bench.client.fetch<string>(
      `*[_type == "${WORKFLOW_DEFINITION_TYPE}" && name == "blueprint-demo"][0].stages[0].transitions[0].when`,
    )
    expect(deployedWhen).toBe('count(*[_id == "dataset:projA:test:cfg"]) > 0')
  })
})

describe('parseWorkflowResource', () => {
  test('rejects a resource of the wrong type', () => {
    expect(() => parseWorkflowResource({name: 'x', type: 'sanity.function.document'})).toThrow(
      'expected type "sanity.workflow", got "sanity.function.document"',
    )
  })

  test('rejects a resource whose deployment fails the config boundary', () => {
    const resource = {
      name: 'x',
      type: WORKFLOW_RESOURCE_TYPE,
      deployment: {
        ...benchDeployment([parkedFlow()]),
        workflowResource: {type: 'dataset', id: 'nodot'},
      },
    }

    expect(() => parseWorkflowResource(resource)).toThrow('invalid dataset resource id')
  })

  test('rejects an unbound resource alias with the provider-boundary attribution', () => {
    const aliased = parkedFlow({when: 'count(*[_id == "@content:cfg"]) > 0'})

    expect(() => testWorkflowResource(benchDeployment([aliased]))).toThrow(
      'workflow resource: definition "blueprint-demo" references unbound resource alias "@content"',
    )
  })

  test('rejects duplicate definition names', () => {
    expect(() => testWorkflowResource(benchDeployment([parkedFlow(), parkedFlow({title: 'Same name, other content'})]))).toThrow(
      'workflow resource: duplicate definition name "blueprint-demo" in deployment',
    )
  })

  test('rejects an empty resource name', () => {
    expect(() => testWorkflowResource(benchDeployment([parkedFlow()]), {name: ''})).toThrow('`name` must be a non-empty string')
  })

  test('rejects missing and insufficient reader-floor acknowledgements', () => {
    const {expectedMinReaderModel: _dropped, ...withoutAcknowledgement} = benchDeployment([parkedFlow()])
    const rawResource = {
      name: 'workflows-main',
      type: WORKFLOW_RESOURCE_TYPE,
      deployment: withoutAcknowledgement,
    }

    expect(() => parseWorkflowResource(rawResource)).toThrow('the submitted definitions require at least 4')
    expect(() =>
      testWorkflowResource({
        ...benchDeployment([parkedFlow()]),
        expectedMinReaderModel: 1,
      }),
    ).toThrow('the submitted definitions require at least 4')
  })

  test('requires model 8 when a definition uses role constraints', () => {
    const constrained = parkedFlow({
      fields: [{type: 'assignee', name: 'reviewer', roles: ['editor']}],
    })

    expect(() => testWorkflowResource(benchDeployment([constrained]))).toThrow('the submitted definitions require at least 8')
    expect(() =>
      testWorkflowResource({
        ...benchDeployment([constrained]),
        expectedMinReaderModel: 8,
      }),
    ).not.toThrow()
  })

  test('rejects an empty definition list', () => {
    expect(() => testWorkflowResource({...benchDeployment([parkedFlow()]), definitions: []})).toThrow(
      'a deployment needs at least one definition',
    )
  })

  test('rejects an unknown deletion policy', () => {
    const resource = testWorkflowResource(benchDeployment([parkedFlow()]))

    expect(() => parseWorkflowResource({...resource, lifecycle: {deletionPolicy: 'nuke'}})).toThrow('deletionPolicy')
  })

  test('rejects a spawn-reference cycle among the resource definitions', () => {
    const resource = {
      name: 'cyclic',
      type: WORKFLOW_RESOURCE_TYPE,
      deployment: benchDeployment([spawningParent('blueprint-b'), spawningParent('blueprint-parent', {name: 'blueprint-b'})]),
    }

    expect(() => parseWorkflowResource(resource)).toThrow('workflow resource: reference cycle among definitions')
  })

  test('merges the retain default into a raw lifecycle carrying a dependency', () => {
    const resource = {
      ...testWorkflowResource(benchDeployment([parkedFlow()])),
      lifecycle: {dependsOn: '$.resources.workflow-dataset'},
    }

    expect(parseWorkflowResource(resource).lifecycle).toEqual({
      deletionPolicy: 'retain',
      dependsOn: '$.resources.workflow-dataset',
    })
  })

  test('rejects raw deletion and ownership lifecycle actions at the provider boundary', () => {
    const resource = testWorkflowResource(benchDeployment([parkedFlow()]))
    const unsupported = [
      {
        lifecycle: {deletionPolicy: 'allow'},
        message: "deletionPolicy 'allow' is not supported",
      },
      {
        lifecycle: {deletionPolicy: 'replace'},
        message: "deletionPolicy 'replace' is not supported",
      },
      {
        lifecycle: {ownershipAction: {type: 'attach', id: 'partition'}},
        message: 'ownershipAction is not supported',
      },
      {
        lifecycle: {ownershipAction: {type: 'detach'}},
        message: 'ownershipAction is not supported',
      },
      {
        lifecycle: {
          ownershipAction: {type: 'reference', name: 'workflows', stack: 'other-stack'},
        },
        message: 'ownershipAction is not supported',
      },
    ]

    for (const {lifecycle, message} of unsupported) {
      expect(() => parseWorkflowResource({...resource, lifecycle})).toThrow(message)
    }
  })

  test('rejects malformed raw lifecycle values at the provider boundary', () => {
    const resource = testWorkflowResource(benchDeployment([parkedFlow()]))

    expect(() => parseWorkflowResource({...resource, lifecycle: 42})).toThrow('`lifecycle` must be an object')
    expect(() => parseWorkflowResource({...resource, lifecycle: {deletionPolicy: null}})).toThrow('`deletionPolicy` must be a string')
  })
})

describe('workflowResourceExternalId', () => {
  test('identifies the physical resource and tag without separator collisions', () => {
    expect(
      workflowResourceExternalId({
        workflowResource: {type: 'dataset', id: 'project.dataset'},
        tag: 'production',
      }),
    ).toBe('sanity.workflow:["dataset","project.dataset","production"]')

    const splitAfterId = workflowResourceExternalId({
      workflowResource: {type: 'canvas', id: 'resource:west'},
      tag: 'prod',
    })
    const splitBeforeId = workflowResourceExternalId({
      workflowResource: {type: 'canvas', id: 'resource'},
      tag: 'west:prod',
    })
    expect(splitAfterId).not.toBe(splitBeforeId)
  })
})

describe('readWorkflowResource', () => {
  test('reports actual latest versions for only the names managed by this manifest', async () => {
    const bench = createBench()
    const managedV1 = parkedFlow({name: 'managed', title: 'One'})
    const unmanaged = parkedFlow({name: 'removed', title: 'Still retained'})
    await provisionWorkflowResource({
      resource: testWorkflowResource(benchDeployment([managedV1, unmanaged])),
      client: bench.client,
    })
    const managedV2 = parkedFlow({name: 'managed', title: 'Two'})
    const resource = testWorkflowResource(benchDeployment([managedV2]))
    await provisionWorkflowResource({resource, client: bench.client})

    expect(await readWorkflowResource({resource, client: bench.client})).toEqual({
      externalId: workflowResourceExternalId(resource.deployment),
      definitions: [{name: 'managed', version: 2, contentHash: hashDefinitionContent(managedV2)}],
    })
    const retained = await bench.client.fetch<string[]>(`*[_type == "${WORKFLOW_DEFINITION_TYPE}" && name == "removed"].name`)
    expect(retained).toEqual(['removed'])
  })
})

describe('rollbackWorkflowResource', () => {
  test('deletes first-deploy creations in reverse dependency order', async () => {
    const bench = createBench()
    const child = parkedFlow({name: 'blueprint-child'})
    const parent = spawningParent('blueprint-child')
    const resource = testWorkflowResource(benchDeployment([parent, child]))
    await provisionAndRollback(resource, bench.client)

    const remaining = await bench.client.fetch<string[]>(`*[_type == "${WORKFLOW_DEFINITION_TYPE}"].name`)
    expect(remaining).toEqual([])
  })

  test('deletes only created receipt versions and preserves unchanged definitions', async () => {
    const bench = createBench()
    const existing = parkedFlow({name: 'existing'})
    await provisionWorkflowResource({
      resource: testWorkflowResource(benchDeployment([existing])),
      client: bench.client,
    })
    const resource = testWorkflowResource(benchDeployment([existing, parkedFlow({name: 'new-definition'})]))
    await provisionAndRollback(resource, bench.client)

    const remaining = await bench.client.fetch<Array<{name: string; version: number}>>(
      `*[_type == "${WORKFLOW_DEFINITION_TYPE}"]{name, version} | order(name asc)`,
    )
    expect(remaining).toEqual([{name: 'existing', version: 1}])
  })

  test('deletes the exact updated version and preserves its predecessor', async () => {
    const bench = createBench()
    const {resource, receipt} = await deployBlueprintDemoUpdate(bench.client)

    await rollbackWorkflowResource({resource, receipt, client: bench.client})

    const remaining = await bench.client.fetch<number[]>(`*[_type == "${WORKFLOW_DEFINITION_TYPE}" && name == "blueprint-demo"].version`)
    expect(remaining).toEqual([1])
  })

  test('treats an already-rolled-back exact receipt as complete', async () => {
    const bench = createBench()
    const resource = testWorkflowResource(benchDeployment([parkedFlow()]))
    const receipt = await provisionWorkflowResource({resource, client: bench.client})
    await rollbackWorkflowResource({resource, receipt, client: bench.client})

    await expect(rollbackWorkflowResource({resource, receipt, client: bench.client})).resolves.toBeUndefined()
  })

  test('rejects a tag-mismatched receipt before deleting from either partition', async () => {
    const bench = createBench()
    const first = testWorkflowResource({...benchDeployment([parkedFlow()]), tag: 'first'})
    const second = testWorkflowResource({...benchDeployment([parkedFlow()]), tag: 'second'})
    const receipt = await provisionWorkflowResource({resource: first, client: bench.client})
    await provisionWorkflowResource({resource: second, client: bench.client})

    await expect(rollbackWorkflowResource({resource: second, receipt, client: bench.client})).rejects.toThrow('rollback receipt belongs to')
    const remaining = await bench.client.fetch<string[]>(`*[_type == "${WORKFLOW_DEFINITION_TYPE}"].tag | order(@ asc)`)
    expect(remaining).toEqual(['first', 'second'])
  })

  test('rejects a workflow-resource-mismatched receipt before deleting', async () => {
    const {bench, receipt, resource} = await provisionBlueprintDemo()
    const otherResource = {
      ...resource,
      deployment: {
        ...resource.deployment,
        workflowResource: {type: 'dataset' as const, id: 'other.workflows'},
      },
    }

    await expect(rollbackWorkflowResource({resource: otherResource, receipt, client: bench.client})).rejects.toThrow(
      'rollback receipt belongs to',
    )
    const remaining = await bench.client.fetch<string[]>(`*[_type == "${WORKFLOW_DEFINITION_TYPE}"].name`)
    expect(remaining).toEqual(['blueprint-demo'])
  })

  test('rejects a malformed receipt before an absent version can widen deletion scope', async () => {
    const {bench, receipt, resource} = await provisionBlueprintDemo()
    const malformed = {...receipt, results: [{name: 'blueprint-demo', status: 'created'}]}

    await expect(rollbackWorkflowResource({resource, receipt: malformed, client: bench.client})).rejects.toThrow(
      'version must be a positive integer',
    )
    const remaining = await bench.client.fetch<number[]>(`*[_type == "${WORKFLOW_DEFINITION_TYPE}"].version`)
    expect(remaining).toEqual([1])
  })

  test('rejects receipt names outside the resource before deleting', async () => {
    const {bench, receipt, resource} = await provisionBlueprintDemo()
    const malformed = {
      ...receipt,
      results: [{name: 'other-definition', version: 1, status: 'created'}],
    }

    await expect(rollbackWorkflowResource({resource, receipt: malformed, client: bench.client})).rejects.toThrow(
      'contains unmanaged definition "other-definition"',
    )
    const remaining = await bench.client.fetch<string[]>(`*[_type == "${WORKFLOW_DEFINITION_TYPE}"].name`)
    expect(remaining).toEqual(['blueprint-demo'])
  })
})

describe('destroyWorkflowResource', () => {
  test('always refuses — definitions are retain-only through blueprints', async () => {
    const bench = createBench()
    const resource = testWorkflowResource(benchDeployment([parkedFlow()]))
    await provisionWorkflowResource({resource, client: bench.client})

    expect(() => destroyWorkflowResource()).toThrow(
      'destroy is not supported — Editorial Workflows definitions are retain-only through Blueprints',
    )

    // Nothing left the lake: the provisioned definition survives untouched.
    const remaining = await bench.client.fetch<string[]>(`*[_type == "${WORKFLOW_DEFINITION_TYPE}"].name`)
    expect(remaining).toEqual(['blueprint-demo'])
  })
})
