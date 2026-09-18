import {afterEach, describe, expect, test, vi} from 'vitest'
import * as workflows from '../../../src/definers/workflows.js'
import * as index from '../../../src/index.js'
import {defineBlueprintForResource} from '../../helpers/index.js'

vi.mock(import('../../../src/index.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    validateBlueprint: vi.fn(() => []),
  }
})

const deployment = {
  name: 'production',
  tag: 'production',
  expectedMinReaderModel: 4,
  workflowResource: {type: 'dataset' as const, id: 'abc123.production'},
  definitions: [{name: 'article-review'}],
}

describe('defineWorkflows', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if validateWorkflows returns an error', () => {
    const spy = vi.spyOn(index, 'validateWorkflows').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() => defineBlueprintForResource(workflows.defineWorkflows(deployment))).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })

  test('should set the type and derive the resource name from the deployment', () => {
    const workflowsResource = workflows.defineWorkflows(deployment)

    expect(workflowsResource).toStrictEqual({
      name: 'workflows-production',
      type: 'sanity.workflow',
      deployment,
    })
  })

  test('should accept an explicit resource name and lifecycle', () => {
    const workflowsResource = workflows.defineWorkflows(deployment, {
      name: 'editorial-workflows',
      lifecycle: {deletionPolicy: 'protect'},
    })

    expect(workflowsResource).toStrictEqual({
      name: 'editorial-workflows',
      type: 'sanity.workflow',
      lifecycle: {deletionPolicy: 'protect'},
      deployment,
    })
  })

  test('should accept a valid configuration with lifecycle.dependsOn', () => {
    const workflowsResource = workflows.defineWorkflows(deployment, {
      lifecycle: {dependsOn: '$.resources.workflow-dataset'},
    })

    expect(workflowsResource.lifecycle?.dependsOn).toStrictEqual('$.resources.workflow-dataset')
  })

  test.each(['allow', 'replace'] as const)('should reject the %s deletion policy', (deletionPolicy) => {
    expect(() => defineBlueprintForResource(workflows.defineWorkflows(deployment, {lifecycle: {deletionPolicy}}))).toThrow(
      `Editorial Workflows deletion policy \`${deletionPolicy}\` is not supported`,
    )
  })

  test('should reject duplicate definition names', () => {
    expect(() =>
      defineBlueprintForResource(
        workflows.defineWorkflows({...deployment, definitions: [{name: 'article-review'}, {name: 'article-review'}]}),
      ),
    ).toThrow('Editorial Workflows definition name `article-review` is duplicated')
  })

  test('should preserve the type of the deployment', () => {
    const workflowsResource = workflows.defineWorkflows({
      ...deployment,
      definitions: [{name: 'article-review', initialStage: 'draft', stages: [{name: 'draft'}]}],
    })

    const [definition] = workflowsResource.deployment.definitions
    // compiles only if the definition type (not just `name`) is preserved on the resource
    const initialStage: string | undefined = definition?.initialStage
    expect(initialStage).toStrictEqual('draft')
    expect(definition?.stages).toStrictEqual([{name: 'draft'}])
  })
})
