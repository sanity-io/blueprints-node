import {afterEach, describe, expect, test, vi} from 'vitest'
import * as workflows from '../../../src/definers/workflows.js'
import * as index from '../../../src/index.js'
import {defineBlueprintForResource} from '../../helpers/index.js'

const deployment = {
  name: 'production',
  expectedMinReaderModel: 4,
  tag: 'production',
  workflowResource: {type: 'dataset' as const, id: 'projectId.dataset'},
  definitions: [{name: 'article-review', title: 'Article review', initialStage: 'draft', stages: [{name: 'draft'}]}],
}

describe('defineWorkflows', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should surface validation errors when the blueprint is defined', () => {
    const spy = vi.spyOn(index, 'validateWorkflows').mockImplementation(() => [{type: 'test', message: 'this is a test'}])

    expect(() => defineBlueprintForResource(workflows.defineWorkflows(deployment))).toThrow('this is a test')
    expect(spy).toHaveBeenCalledOnce()
  })

  test('should set the resource type, retain lifecycle, and deployment-derived name', () => {
    expect(workflows.defineWorkflows(deployment)).toStrictEqual({
      name: 'editorial-workflows-production',
      type: 'sanity.workflow',
      lifecycle: {deletionPolicy: 'retain'},
      deployment,
    })
  })

  test('should accept an explicit resource name and protected lifecycle', () => {
    expect(
      workflows.defineWorkflows(deployment, {
        name: 'editorial-workflows',
        lifecycle: {deletionPolicy: 'protect'},
      }),
    ).toStrictEqual({
      name: 'editorial-workflows',
      type: 'sanity.workflow',
      lifecycle: {deletionPolicy: 'protect'},
      deployment,
    })
  })

  test('should retain the deletion policy when other lifecycle fields are provided', () => {
    expect(
      workflows.defineWorkflows(deployment, {
        lifecycle: {dependsOn: '$.resources.content'},
      }).lifecycle,
    ).toStrictEqual({
      deletionPolicy: 'retain',
      dependsOn: '$.resources.content',
    })
  })

  test.each(['allow', 'replace'] as const)('should reject the %s deletion policy', (deletionPolicy) => {
    expect(() =>
      defineBlueprintForResource(
        workflows.defineWorkflows(deployment, {
          lifecycle: {
            // @ts-expect-error Intentionally wrong type
            deletionPolicy,
          },
        }),
      ),
    ).toThrow(`Editorial Workflows deletion policy \`${deletionPolicy}\` is not supported`)
  })

  test('should reject duplicate definition names when the blueprint is defined', () => {
    expect(() =>
      defineBlueprintForResource(
        workflows.defineWorkflows({
          ...deployment,
          definitions: [deployment.definitions[0], deployment.definitions[0]],
        }),
      ),
    ).toThrow('Editorial Workflows definition name `article-review` is duplicated')
  })

  test('should reject ownership actions until the provider defines their semantics', () => {
    expect(() =>
      defineBlueprintForResource(
        workflows.defineWorkflows(deployment, {
          lifecycle: {
            // @ts-expect-error Intentionally unsupported until the provider defines ownership semantics
            ownershipAction: {type: 'detach'},
          },
        }),
      ),
    ).toThrow('Editorial Workflows ownership actions are not supported')
  })
})
