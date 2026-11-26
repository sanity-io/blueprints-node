import {describe, test} from 'vitest'

import {buildBlueprint} from '../../../src/build/blueprint.ts'
import {defineWindowView} from '../../../src/index.ts'

describe('buildBlueprint', () => {
  test('creates a blueprint manifest', () => {
    const bpModule = buildBlueprint({}, (blueprint) => {
      const project = blueprint.project({name: 'test-project'})
      const dataset = project.dataset({name: 'production'})
      project.documentWebhook({
        name: 'test-webhook',
        apiVersion: 'v2026-01-01',
        dataset: dataset.datasetName,
        on: ['update'],
        url: 'https://example.com',
      })
      const projectPermission = project.permission({
        name: 'project-articles-only',
        permissionType: 'sanity.document.filter.mode',
        config: {filter: '_type == "article"'},
      })
      const projectRole = project.role({
        appliesToRobots: true,
        appliesToUsers: false,
        name: 'test-project-role',
        permissions: [
          {
            name: 'sanity-project-cors',
            action: 'create',
          },
          {
            name: projectPermission.name,
            action: 'create',
          },
        ],
        title: 'Test Role',
      })
      project.robotToken({
        label: 'test-project-robot',
        memberships: [{roleNames: [projectRole.name]}],
        name: 'test-project-robot',
      })
      project.studio({
        name: 'test-project-studio',
        root: './projectstudio',
      })

      blueprint.application({
        name: 'design-retro',
        title: 'Design Retro',
        root: './apps/design-retro',
        views: [defineWindowView({name: 'main', title: 'Design Retro', src: './src/windows/main.tsx'})],
      })
      const kb = blueprint.contextKnowledgeBase({
        name: 'product-docs',
        title: 'Product docs',
        description: 'Everything about the product',
      })
      blueprint.contextMcpEndpoint({
        name: 'support-agent',
        title: 'Support agent',
        sources: [kb, {type: 'dataset', id: 'abc123.production'}],
        instructions: 'Answer questions about the product.',
        groqFilter: '_type in ["article", "faq"]',
      })
      const permission = blueprint.permission({
        name: 'articles-only',
        permissionType: 'sanity.document.filter.mode',
        config: {filter: '_type == "article"'},
      })
      const role = blueprint.role({
        appliesToRobots: true,
        appliesToUsers: false,
        name: 'test-role',
        permissions: [
          {
            name: 'sanity-project-cors',
            action: 'create',
          },
          {
            name: permission.name,
            action: 'create',
          },
        ],
        title: 'Test Role',
      })
      blueprint.robotToken({
        label: 'test-robot',
        memberships: [{roleNames: [role.name]}],
        name: 'test-robot',
      })
      blueprint.studio({
        name: 'test-studio',
        root: './studio',
      })
      const test = blueprint.resource({name: 'test-resource-1', type: 'test', behavior: 'noop'})
      blueprint.resource({name: 'test-resource-2', type: 'test', behavior: test.reference('behavior')})
    })

    console.log('output', JSON.stringify(bpModule(), null, 2))
  })
})
