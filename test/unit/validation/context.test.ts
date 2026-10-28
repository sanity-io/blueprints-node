import {describe, expect, test} from 'vitest'
import {validateContextKnowledgeBase, validateContextMcpEndpoint} from '../../../src/validation/context.js'

const knowledgeBase = {name: 'product-docs', type: 'sanity.context.knowledge-base', title: 'Product docs', description: 'Docs'}
const endpoint = {
  name: 'support-agent',
  type: 'sanity.context.mcp',
  title: 'Support agent',
  sources: [{type: 'knowledge-base', id: '$.resources.product-docs'}],
}

describe('validateContextKnowledgeBase', () => {
  test('should accept a valid knowledge base', () => {
    expect(validateContextKnowledgeBase(knowledgeBase)).toStrictEqual([])
  })

  test('should require a title and a description', () => {
    const errors = validateContextKnowledgeBase({name: 'product-docs', type: 'sanity.context.knowledge-base'})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Knowledge base title is required'})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Knowledge base description is required'})
  })

  test('should reject a title or description that is too long', () => {
    const errors = validateContextKnowledgeBase({...knowledgeBase, title: 'a'.repeat(101), description: 'a'.repeat(2001)})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Knowledge base title must be 100 characters or less'})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Knowledge base description must be 2000 characters or less'})
  })

  test('should reject the wrong type', () => {
    expect(validateContextKnowledgeBase({...knowledgeBase, type: 'sanity.context.mcp'})).toContainEqual({
      type: 'invalid_value',
      message: 'Knowledge base type must be `sanity.context.knowledge-base`',
    })
  })
})

describe('validateContextMcpEndpoint', () => {
  test('should accept a valid endpoint', () => {
    expect(validateContextMcpEndpoint(endpoint)).toStrictEqual([])
    expect(
      validateContextMcpEndpoint({
        ...endpoint,
        sources: [...endpoint.sources, {type: 'dataset', id: 'abc123.production'}],
        groqFilter: '_type == "article"',
        instructions: 'Answer support questions.',
      }),
    ).toStrictEqual([])
  })

  test('should reject a name that does not fit in a URL, and reserved names', () => {
    for (const name of ['Support Agent', 'support--agent', 'a'.repeat(65)]) {
      expect(validateContextMcpEndpoint({...endpoint, name})).toContainEqual({
        type: 'invalid_format',
        message: 'MCP endpoint name must be lowercase letters, digits and single hyphens, up to 64 characters',
      })
    }
    for (const name of ['by-name', 'mcpabc12345']) {
      expect(validateContextMcpEndpoint({...endpoint, name})).toContainEqual({
        type: 'invalid_value',
        message: `MCP endpoint name "${name}" is reserved`,
      })
    }
  })

  test('should require at least one source', () => {
    expect(validateContextMcpEndpoint({...endpoint, sources: []})).toContainEqual({
      type: 'invalid_value',
      message: 'MCP endpoint must have at least one source',
    })
  })

  test('should allow at most one dataset, in the right format', () => {
    const errors = validateContextMcpEndpoint({
      ...endpoint,
      sources: [
        {type: 'dataset', id: 'abc123.production'},
        {type: 'dataset', id: 'not-a-dataset'},
      ],
    })
    expect(errors).toContainEqual({type: 'invalid_value', message: 'MCP endpoint can have at most one dataset source'})
    expect(errors).toContainEqual({
      type: 'invalid_format',
      message: 'Dataset source "not-a-dataset" must be "<projectId>.<datasetName>"',
    })
  })

  test('should reject a dataset source that references a resource', () => {
    expect(validateContextMcpEndpoint({...endpoint, sources: [{type: 'dataset', id: '$.resources.production'}]})).toContainEqual({
      type: 'invalid_value',
      message: 'Dataset source "$.resources.production" must be "<projectId>.<datasetName>", not a resource reference',
    })
    expect(validateContextMcpEndpoint({...endpoint, sources: [{type: 'dataset', id: '$.values.dataset'}]})).toStrictEqual([])
  })

  test('should reject an unknown source type', () => {
    expect(validateContextMcpEndpoint({...endpoint, sources: [{type: 'website', id: 'https://example.com'}]})).toContainEqual({
      type: 'invalid_value',
      message: 'MCP endpoint source `type` must be `knowledge-base` or `dataset`',
    })
  })

  test('should only allow a GROQ filter with a dataset source', () => {
    expect(validateContextMcpEndpoint({...endpoint, groqFilter: '_type == "article"'})).toContainEqual({
      type: 'invalid_value',
      message: 'MCP endpoint GROQ filter requires a dataset source',
    })
  })
})

describe('malformed Context configs', () => {
  test('should reject a missing or non-object config', () => {
    expect(validateContextKnowledgeBase(undefined)).toStrictEqual([
      {type: 'invalid_value', message: 'Knowledge base config must be provided'},
    ])
    expect(validateContextKnowledgeBase('docs')).toStrictEqual([{type: 'invalid_type', message: 'Knowledge base config must be an object'}])
    expect(validateContextMcpEndpoint(undefined)).toStrictEqual([{type: 'invalid_value', message: 'MCP endpoint config must be provided'}])
    expect(validateContextMcpEndpoint('agent')).toStrictEqual([{type: 'invalid_type', message: 'MCP endpoint config must be an object'}])
  })

  test('should reject text fields that are not strings or are empty', () => {
    expect(validateContextKnowledgeBase({...knowledgeBase, title: 1})).toContainEqual({
      type: 'invalid_type',
      message: 'Knowledge base title must be a string',
    })
    expect(validateContextMcpEndpoint({...endpoint, instructions: ''})).toContainEqual({
      type: 'invalid_value',
      message: 'MCP endpoint instructions must not be empty',
    })
  })

  test('should reject the wrong type, missing sources, and too many sources', () => {
    expect(validateContextMcpEndpoint({...endpoint, type: 'sanity.context.knowledge-base'})).toContainEqual({
      type: 'invalid_value',
      message: 'MCP endpoint type must be `sanity.context.mcp`',
    })
    const {sources: _sources, ...withoutSources} = endpoint
    expect(validateContextMcpEndpoint(withoutSources)).toContainEqual({
      type: 'missing_parameter',
      message: 'MCP endpoint sources are required',
    })
    const tooMany = Array.from({length: 101}, (_, i) => ({type: 'knowledge-base', id: `kb${i}`}))
    expect(validateContextMcpEndpoint({...endpoint, sources: tooMany})).toContainEqual({
      type: 'invalid_value',
      message: 'MCP endpoint can have at most 100 sources',
    })
  })

  test('should validate the dataset source settings', () => {
    const dataset = {type: 'dataset', id: 'abc123.production'}
    for (const settings of [
      {workspace: 'marketing', perspective: 'drafts', semanticSearch: false},
      {workspace: null, perspective: null, semanticSearch: null},
      {perspective: '$.values.perspective'},
    ]) {
      expect(validateContextMcpEndpoint({...endpoint, sources: [{...dataset, ...settings}]})).toStrictEqual([])
    }

    const errors = validateContextMcpEndpoint({
      ...endpoint,
      sources: [{...dataset, workspace: '', perspective: 'previewDrafts', semanticSearch: 'auto'}],
    })
    expect(errors).toStrictEqual([
      {type: 'invalid_type', message: 'Dataset source `workspace` must be a non-empty string or null'},
      {type: 'invalid_value', message: 'Dataset source `perspective` must be `published`, `drafts`, `raw` or null'},
      {type: 'invalid_type', message: 'Dataset source `semanticSearch` must be a boolean or null'},
    ])
  })

  test('should reject sources without a type and id, or with a non-string id', () => {
    const errors = validateContextMcpEndpoint({...endpoint, sources: [null, {type: 'dataset'}, {type: 'knowledge-base', id: 1}]})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Each MCP endpoint source needs a `type` and an `id`'})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'MCP endpoint source `id` must be a non-empty string'})
  })
})
