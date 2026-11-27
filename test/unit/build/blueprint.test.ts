import {describe, expect, expectTypeOf, test} from 'vitest'

import {buildBlueprint} from '../../../src/build/blueprint.js'
import {defineWindowView} from '../../../src/index.js'

const EXISTING_PROJECT = 'proj1234'
const EXISTING_DATASET = 'existing'

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

      const attachedProject = blueprint.project({
        name: 'attached-project',
        lifecycle: {ownershipAction: {type: 'attach', id: EXISTING_PROJECT}},
      })
      attachedProject.dataset({
        name: 'attached-dataset',
        lifecycle: {ownershipAction: {type: 'attach', id: EXISTING_DATASET, projectId: EXISTING_PROJECT}},
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
      const testResource = blueprint.resource({name: 'test-resource-1', type: 'test', behavior: 'noop'})
      blueprint.resource({name: 'test-resource-2', type: 'test', behavior: testResource.reference('behavior')})
    })

    console.log('output', JSON.stringify(bpModule(), null, 2))
  })

  test('accepts a callback without config', () => {
    const bpModule = buildBlueprint((blueprint) => {
      blueprint.project({name: 'test-project'})
    })

    expect(bpModule().resources).toStrictEqual([expect.objectContaining({name: 'test-project', type: 'sanity.project'})])
  })

  test('handles expose the resource type as a readonly kind', () => {
    buildBlueprint((blueprint) => {
      const project = blueprint.project({name: 'test-project'})
      const dataset = project.dataset({name: 'production'})
      const webhook = project.documentWebhook({
        name: 'test-webhook',
        apiVersion: 'v2026-01-01',
        dataset: dataset.datasetName,
        on: ['update'],
        url: 'https://example.com',
      })
      const kb = blueprint.contextKnowledgeBase({name: 'product-docs', title: 'Product docs', description: 'Product docs'})
      const mcp = blueprint.contextMcpEndpoint({name: 'support-agent', title: 'Support agent', sources: [kb]})
      const cors = project.corsOrigin({name: 'test-cors', origin: 'https://example.com'})
      const resource = blueprint.resource({name: 'test-resource', type: 'test' as const})

      expect(project.kind).toBe('sanity.project')
      expect(dataset.kind).toBe('sanity.project.dataset')
      expect(webhook.kind).toBe('sanity.project.webhook')
      expect(kb.kind).toBe('sanity.context.knowledge-base')
      expect(mcp.kind).toBe('sanity.context.mcp')
      expect(cors.kind).toBe('sanity.project.cors')
      expect(resource.kind).toBe('test')

      expectTypeOf(dataset).not.toEqualTypeOf(cors)
    })
  })

  test('accepts undefined config', () => {
    const bpModule = buildBlueprint(undefined, (blueprint) => {
      blueprint.project({name: 'test-project'})
    })

    expect(bpModule().resources).toHaveLength(1)
  })
})
