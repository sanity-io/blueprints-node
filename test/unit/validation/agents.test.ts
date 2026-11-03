import {afterEach, describe, expect, test, vi} from 'vitest'
import {validateAgent} from '../../../src/index.js'

const validModel = {
  provider: 'openrouter',
  id: 'anthropic/claude-haiku-4.5',
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: 'sk-test-key',
}

const validAgent = {
  name: 'demo-agent',
  type: 'sanity.agent',
  description: 'valid agent',
  region: 'virginia',
  src: 'agents/demo-agent',
  model: validModel,
}

describe('validateAgent', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('happy paths', () => {
    test('should accept a valid configuration', () => {
      const errors = validateAgent(validAgent)
      expect(errors).toHaveLength(0)
    })

    test('should accept a valid configuration without an optional baseURL', () => {
      const errors = validateAgent({
        ...validAgent,
        model: {provider: 'openrouter', id: 'anthropic/claude-haiku-4.5', apiKey: 'sk-test-key'},
      })
      expect(errors).toHaveLength(0)
    })

    test('should accept a valid configuration without an optional description', () => {
      const {description: _description, ...rest} = validAgent
      const errors = validateAgent(rest)
      expect(errors).toHaveLength(0)
    })
  })

  describe('sad paths', () => {
    test('should return an error if config is falsey', () => {
      const errors = validateAgent(undefined)
      expect(errors).toContainEqual({type: 'invalid_value', message: 'Agent config must be provided'})
    })

    test('should return an error if config is not an object', () => {
      const errors = validateAgent(1)
      expect(errors).toContainEqual({type: 'invalid_type', message: 'Agent config must be an object'})
    })

    test('should return an error if type is not sanity.agent', () => {
      const errors = validateAgent({...validAgent, type: 'invalid'})
      expect(errors).toContainEqual({type: 'invalid_value', message: 'Agent type must be `sanity.agent`'})
    })

    test('should return an error if name is missing', () => {
      const {name: _name, ...rest} = validAgent
      const errors = validateAgent(rest)
      expect(errors).toContainEqual({type: 'missing_parameter', message: '`name` is required'})
    })

    test('should reject a bad name slug', () => {
      const errors = validateAgent({...validAgent, name: 'Demo_Agent'})
      expect(errors).toContainEqual({
        type: 'invalid_format',
        message: '`name` must match the slug pattern `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`',
      })
    })

    test('should reject a name longer than 63 characters', () => {
      const errors = validateAgent({...validAgent, name: 'a'.repeat(64)})
      expect(errors).toContainEqual({type: 'invalid_value', message: '`name` must be at most 63 characters'})
    })

    test('should reject a description longer than 255 characters', () => {
      const errors = validateAgent({...validAgent, description: 'a'.repeat(256)})
      expect(errors).toContainEqual({type: 'invalid_value', message: '`description` must be at most 255 characters'})
    })

    test('should reject an unknown region', () => {
      const errors = validateAgent({...validAgent, region: 'atlantis'})
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message:
          '`region` must be one of virginia, ohio, california, portland, montreal, calgary, ireland, london, paris, frankfurt, zurich, stockholm, milan, spain',
      })
    })

    test('should accept every allowlisted region', () => {
      const regions = [
        'virginia',
        'ohio',
        'california',
        'portland',
        'montreal',
        'calgary',
        'ireland',
        'london',
        'paris',
        'frankfurt',
        'zurich',
        'stockholm',
        'milan',
        'spain',
      ]
      for (const region of regions) {
        const errors = validateAgent({...validAgent, region})
        expect(errors).toHaveLength(0)
      }
    })

    test('should fail validation if model is missing', () => {
      const {model: _model, ...rest} = validAgent
      const errors = validateAgent(rest)
      expect(errors).toContainEqual({type: 'missing_parameter', message: '`model` is required'})
    })

    test('should fail validation with a named error if model.apiKey is empty', () => {
      const errors = validateAgent({...validAgent, model: {...validModel, apiKey: ''}})
      expect(errors).toContainEqual({type: 'invalid_value', message: 'model.apiKey is empty'})
    })

    test('should fail validation if model.apiKey is missing', () => {
      const {apiKey: _apiKey, ...modelRest} = validModel
      const errors = validateAgent({...validAgent, model: modelRest})
      expect(errors).toContainEqual({type: 'missing_parameter', message: '`model.apiKey` is required'})
    })

    test('should require a non-empty model.provider', () => {
      const errors = validateAgent({...validAgent, model: {...validModel, provider: ''}})
      expect(errors).toContainEqual({type: 'invalid_value', message: '`model.provider` must be a non-empty string'})
    })

    test('should require a non-empty model.id', () => {
      const errors = validateAgent({...validAgent, model: {...validModel, id: ''}})
      expect(errors).toContainEqual({type: 'invalid_value', message: '`model.id` must be a non-empty string'})
    })

    test('should reject a malformed model.baseURL', () => {
      const errors = validateAgent({...validAgent, model: {...validModel, baseURL: 'not a url'}})
      expect(errors).toContainEqual({type: 'invalid_format', message: '`model.baseURL` must be a well-formed URL'})
    })

    test('should check apiKey presence only, never inspecting or logging the value', () => {
      const secret = 'sk-super-secret-value-should-never-surface'
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const errors = validateAgent({...validAgent, model: {...validModel, apiKey: secret}})

      // presence-only: a supplied key passes without emitting any error
      expect(errors).toHaveLength(0)
      // the secret value never appears in any error message
      expect(errors.some((err) => err.message.includes(secret))).toBe(false)
      // the secret value is never logged
      for (const spy of [logSpy, errorSpy, warnSpy]) {
        for (const call of spy.mock.calls) {
          expect(JSON.stringify(call)).not.toContain(secret)
        }
      }
    })
  })
})
