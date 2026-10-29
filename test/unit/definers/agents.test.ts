import {afterEach, describe, expect, test, vi} from 'vitest'
import * as agents from '../../../src/definers/agents.js'
import * as index from '../../../src/index.js'
import {defineBlueprintForResource} from '../../helpers/index.js'

vi.mock(import('../../../src/index.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    validateBlueprint: vi.fn(() => []),
  }
})

const validModel = {
  provider: 'openrouter',
  id: 'anthropic/claude-haiku-4.5',
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: 'sk-test-key',
}

describe('defineAgent', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should accept a valid configuration and stamp the type', () => {
    const agentResource = agents.defineAgent({
      name: 'demo-agent',
      description: 'valid agent',
      region: 'virginia',
      model: validModel,
    })

    expect(agentResource.type).toStrictEqual('sanity.agent')
    expect(agentResource.name).toStrictEqual('demo-agent')
    expect(agentResource.description).toStrictEqual('valid agent')
  })

  test('should default src to agents/<name> when omitted', () => {
    const agentResource = agents.defineAgent({
      name: 'demo-agent',
      region: 'virginia',
      model: validModel,
    })

    expect(agentResource.src).toStrictEqual('agents/demo-agent')
  })

  test('should respect src when provided', () => {
    const agentResource = agents.defineAgent({
      name: 'demo-agent',
      region: 'virginia',
      src: 'custom/path',
      model: validModel,
    })

    expect(agentResource.src).toStrictEqual('custom/path')
  })

  test('should carry the model through unchanged', () => {
    const agentResource = agents.defineAgent({
      name: 'demo-agent',
      region: 'virginia',
      model: validModel,
    })

    expect(agentResource.model).toStrictEqual(validModel)
  })

  test('should throw if validateAgent returns an error', () => {
    const spy = vi.spyOn(index, 'validateAgent').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      defineBlueprintForResource(
        agents.defineAgent({
          name: 'demo-agent',
          region: 'virginia',
          model: validModel,
        }),
      ),
    ).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })
})
