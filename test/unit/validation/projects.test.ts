import {afterEach, describe, expect, test, vi} from 'vitest'
import * as index from '../../../src/index.js'
import * as projects from '../../../src/validation/projects.js'

describe('defineProject', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should accept a valid configuration', () => {
    const errors = projects.validateProject({
      name: 'project-name',
      type: 'sanity.project',
    })

    expect(errors).toHaveLength(0)
  })

  test('should return an error if validateResource returns an error', () => {
    const spy = vi.spyOn(index, 'validateResource').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    const errors = projects.validateProject({
      name: 'project-name',
      type: 'sanity.project',
    })

    expect(errors).toContainEqual({type: 'test', message: 'this is a test'})
    expect(spy).toHaveBeenCalledOnce()
  })

  test('should return an error if config is falsey', () => {
    const errors = projects.validateProject(undefined)
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Project config must be provided',
    })
  })

  test('should return an error if config is not an object', () => {
    const errors = projects.validateProject(1)
    expect(errors).toContainEqual({
      type: 'invalid_type',
      message: 'Project config must be an object',
    })
  })

  test('should return an error if name is not provided', () => {
    const errors = projects.validateProject({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: '`name` is required'})
  })

  test('should return an error if name is not a string', () => {
    const errors = projects.validateProject({name: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: '`name` must be a string'})
  })

  test('should return an error if type is not sanity.project', () => {
    const errors = projects.validateProject({type: 'invalid'})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Project type must be `sanity.project`'})
  })
})
