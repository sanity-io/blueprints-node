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
