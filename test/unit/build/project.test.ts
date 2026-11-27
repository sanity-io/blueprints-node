import {afterEach, describe, expect, test} from 'vitest'

import {ProjectHandle} from '../../../src/build/project.js'
import type {BlueprintResource} from '../../../src/index.js'
import {getCollectedErrors, resetCollectedErrors} from '../../../src/utils/validation.js'

const projectReference = '$.resources.my-project'

function setup() {
  const resources: BlueprintResource[] = []
  return {resources, project: new ProjectHandle('my-project', resources)}
}

afterEach(() => resetCollectedErrors())

describe('ProjectHandle', () => {
  test('references the project by name', () => {
    const {project} = setup()

    expect(project.reference()).toBe(projectReference)
    expect(project.reference('id')).toBe(`${projectReference}.id`)
  })

  test.each<[string, (project: ProjectHandle) => unknown]>([
    ['corsOrigin', (p) => p.corsOrigin({name: 'localhost', origin: 'http://localhost:3333'})],
    ['dataset', (p) => p.dataset({name: 'production'})],
    ['documentFunction', (p) => p.documentFunction({name: 'update-search-index', event: {on: ['publish']}})],
    [
      'documentWebhook',
      (p) =>
        p.documentWebhook({
          name: 'my-webhook',
          apiVersion: 'v2026-01-01',
          dataset: 'production',
          on: ['create'],
          url: 'https://example.com/webhook',
        }),
    ],
    [
      'durableFunction',
      (p) => p.durableFunction({name: 'daily-cleanup', event: {type: 'document', on: ['create'], filter: "_type == 'post'"}}),
    ],
    [
      'mediaLibraryAssetFunction',
      (p) =>
        p.mediaLibraryAssetFunction({
          name: 'process-uploads',
          event: {on: ['create'], resource: {type: 'media-library', id: 'my-media-library-id'}},
        }),
    ],
    [
      'permission',
      (p) => p.permission({name: 'articles-only', permissionType: 'sanity.document.filter.mode', config: {filter: '_type == "article"'}}),
    ],
    ['pubSubFunction', (p) => p.pubSubFunction({name: 'send-email'})],
    ['studio', (p) => p.studio({name: 'my-studio', root: 'studios/my-studio'})],
    ['syncTagInvalidateFunction', (p) => p.syncTagInvalidateFunction({name: 'bust-caches'})],
  ])('%s sets the project', (_, add) => {
    const {resources, project} = setup()

    add(project)

    expect(resources).toHaveLength(1)
    expect(resources[0]).toHaveProperty('project', projectReference)
    expect(getCollectedErrors()).toStrictEqual([])
  })

  test('robotToken scopes the token to the project', () => {
    const {resources, project} = setup()

    project.robotToken({name: 'ci-robot', memberships: [{roleNames: ['editor']}]})

    expect(resources[0]).toMatchObject({type: 'sanity.access.robot', resourceType: 'project', resourceId: projectReference})
    expect(getCollectedErrors()).toStrictEqual([])
  })

  test('role scopes the role to the project', () => {
    const {resources, project} = setup()

    project.role({
      name: 'ci-deploy-role',
      title: 'CI Deploy Role',
      appliesToRobots: true,
      appliesToUsers: false,
      permissions: [{name: 'sanity-project-cors', action: 'create'}],
    })

    expect(resources[0]).toMatchObject({type: 'sanity.access.role', resourceType: 'project', resourceId: projectReference})
    expect(getCollectedErrors()).toStrictEqual([])
  })

  test('dataset returns a handle that references the resource name, not the dataset name', () => {
    const {project} = setup()

    const dataset = project.dataset({name: 'staging-dataset', datasetName: 'staging'})

    expect(dataset.datasetName).toBe('$.resources.staging-dataset.datasetName')
  })
})
