import {afterEach, describe, expect, test, vi} from 'vitest'
import * as workflows from '../../../src/definers/workflows.js'
import * as index from '../../../src/index.js'

const deployment = {
  name: 'production',
  expectedMinReaderModel: 4,
  tag: 'production',
  workflowResource: {type: 'dataset' as const, id: 'projectId.dataset'},
  definitions: [{name: 'article-review'}],
}

describe('defineWorkflows', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if validateWorkflows returns an error', () => {
    const spy = vi.spyOn(index, 'validateWorkflows').mockImplementation(() => [{type: 'test', message: 'this is a test'}])

    expect(() => workflows.defineWorkflows(deployment)).toThrow('this is a test')
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
      workflows.defineWorkflows(deployment, {
        lifecycle: {
          // @ts-expect-error Intentionally wrong type
          deletionPolicy,
        },
      }),
    ).toThrow(`Editorial Workflows deletion policy \`${deletionPolicy}\` is not supported`)
  })

  test('should reject duplicate definition names at define time', () => {
    expect(() =>
      workflows.defineWorkflows({
        ...deployment,
        definitions: [{name: 'article-review'}, {name: 'article-review'}],
      }),
    ).toThrow('Editorial Workflows definition name `article-review` is duplicated')
  })

  test('should reject an in-set spawn reference cycle at define time', () => {
    expect(() =>
      workflows.defineWorkflows({
        ...deployment,
        definitions: [
          {
            name: 'article-review',
            stages: [{activities: [{actions: [{spawn: {definition: {name: 'legal-review'}}}]}]}],
          },
          {
            name: 'legal-review',
            stages: [{activities: [{actions: [{spawn: {definition: {name: 'article-review'}}}]}]}],
          },
        ],
      }),
    ).toThrow('Editorial Workflows definitions contain a reference cycle')
  })
})
