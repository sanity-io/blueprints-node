import {afterEach, describe, expect, test, vi} from 'vitest'
import * as context from '../../../src/definers/context.js'
import * as index from '../../../src/index.js'
import {defineBlueprintForResource} from '../../helpers/index.js'

describe('defineContextKnowledgeBase', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if validateContextKnowledgeBase returns an error', () => {
    const spy = vi.spyOn(index, 'validateContextKnowledgeBase').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      defineBlueprintForResource(context.defineContextKnowledgeBase({name: 'product-docs', title: 'Product docs', description: 'Docs'})),
    ).toThrow(/this is a test/)
    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration and set the type', () => {
    const knowledgeBase = context.defineContextKnowledgeBase({name: 'product-docs', title: 'Product docs', description: 'Docs'})
    expect(knowledgeBase).toStrictEqual({
      name: 'product-docs',
      title: 'Product docs',
      description: 'Docs',
      type: 'sanity.context.knowledge-base',
    })
  })

  test('should accept an attach lifecycle', () => {
    const knowledgeBase = context.defineContextKnowledgeBase({
      name: 'product-docs',
      title: 'Product docs',
      description: 'Docs',
      lifecycle: {ownershipAction: {type: 'attach', id: 'kb3do82whm'}},
    })
    expect(knowledgeBase.lifecycle?.ownershipAction).toStrictEqual({type: 'attach', id: 'kb3do82whm'})
  })
})

describe('defineContextMcpEndpoint', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if validateContextMcpEndpoint returns an error', () => {
    const spy = vi.spyOn(index, 'validateContextMcpEndpoint').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      defineBlueprintForResource(
        context.defineContextMcpEndpoint({
          name: 'support-agent',
          title: 'Support agent',
          sources: [{type: 'knowledge-base', id: 'kb3do82whm'}],
        }),
      ),
    ).toThrow(/this is a test/)
    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration and set the type', () => {
    const endpoint = context.defineContextMcpEndpoint({
      name: 'support-agent',
      title: 'Support agent',
      sources: [
        {type: 'knowledge-base', id: '$.resources.product-docs'},
        {type: 'dataset', id: 'abc123.production'},
      ],
      groqFilter: '_type == "article"',
      instructions: 'Answer support questions.',
    })
    expect(endpoint.type).toStrictEqual('sanity.context.mcp')
    expect(endpoint.sources).toStrictEqual([
      {type: 'knowledge-base', id: '$.resources.product-docs'},
      {type: 'dataset', id: 'abc123.production'},
    ])
  })

  test('should turn a knowledge base resource into a reference to it', () => {
    const productDocs = context.defineContextKnowledgeBase({name: 'product-docs', title: 'Product docs', description: 'Docs'})
    const endpoint = context.defineContextMcpEndpoint({
      name: 'support-agent',
      title: 'Support agent',
      sources: [productDocs, {type: 'knowledge-base', id: 'kb3do82whm'}],
    })
    expect(endpoint.sources).toStrictEqual([
      {type: 'knowledge-base', id: '$.resources.product-docs'},
      {type: 'knowledge-base', id: 'kb3do82whm'},
    ])
  })

  test('should report malformed sources through validation instead of throwing', () => {
    for (const sources of [undefined, 'not-a-list', [null]]) {
      expect(() =>
        defineBlueprintForResource(
          context.defineContextMcpEndpoint({
            name: 'support-agent',
            title: 'Support agent',
            sources,
          } as unknown as index.BlueprintContextMcpEndpointConfig),
        ),
      ).toThrow(/MCP endpoint (sources are required|must have at least one source|source needs)/)
    }
  })

  test('should define a blueprint with knowledge bases and endpoints that reference them', () => {
    const productDocs = context.defineContextKnowledgeBase({name: 'product-docs', title: 'Product docs', description: 'Docs'})
    const blueprint = index.defineBlueprint({
      resources: [productDocs, context.defineContextMcpEndpoint({name: 'support-agent', title: 'Support agent', sources: [productDocs]})],
    })({})
    expect(blueprint.resources?.map((resource) => resource.type)).toStrictEqual(['sanity.context.knowledge-base', 'sanity.context.mcp'])
  })
})
