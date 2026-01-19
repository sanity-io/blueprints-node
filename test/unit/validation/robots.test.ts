import {afterEach, describe, expect, test, vi} from 'vitest'
import * as index from '../../../src/index.js'
import * as robots from '../../../src/validation/robots.js'

describe('validateRobot', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should accept a valid configuration', () => {
    const errors = robots.validateRobot({
      name: 'robot-name',
      type: 'sanity.access.robot',
      label: 'Robot label',
      memberships: [
        {
          resourceType: 'project',
          resourceId: 'test-project',
          roleNames: ['test-role'],
        },
      ],
    })

    expect(errors).toHaveLength(0)
  })

  test('should return an error if validateResource returns an error', () => {
    const spy = vi.spyOn(index, 'validateResource').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    const errors = robots.validateRobot({
      name: 'robot-name',
      type: 'sanity.access.robot',
      label: 'Robot label',
      memberships: [
        {
          resourceType: 'project',
          resourceId: 'test-project',
          roleNames: ['test-role'],
        },
      ],
    })

    expect(errors).toContainEqual({type: 'test', message: 'this is a test'})
    expect(spy).toHaveBeenCalledOnce()
  })

  test('should return an error if config is falsey', () => {
    const errors = robots.validateRobot(null)
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Robot config must be provided',
    })
  })

  test('should return an error if config is not an object', () => {
    const errors = robots.validateRobot(1)
    expect(errors).toContainEqual({
      type: 'invalid_type',
      message: 'Robot config must be an object',
    })
  })

  test('should return an error if name is not provided', () => {
    const errors = robots.validateRobot({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Robot name is required'})
  })

  test('should return an error if name is not a string', () => {
    const errors = robots.validateRobot({name: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Robot name must be a string'})
  })

  test('should return an error if type is not sanity.access.robot', () => {
    const errors = robots.validateRobot({type: 'invalid'})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Robot type must be `sanity.access.robot`'})
  })

  test('should return an error if label is not provided', () => {
    const errors = robots.validateRobot({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Robot label is required'})
  })

  test('should return an error if label is not a string', () => {
    const errors = robots.validateRobot({label: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Robot label must be a string'})
  })

  test('should return an error if memberships array is not provided', () => {
    const errors = robots.validateRobot({})
    expect(errors).toContainEqual({type: 'missing_parameter', message: 'Robot memberships array is required'})
  })

  test('should return an error if memberships is not an array', () => {
    const errors = robots.validateRobot({memberships: 1})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Robot memberships must be an array'})
  })

  test('should return an error if memberships is an empty array', () => {
    const errors = robots.validateRobot({memberships: []})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Robot must have at least one membership'})
  })

  test('should return an error if membership is falsey', () => {
    const errors = robots.validateRobot({memberships: [null]})
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Membership config must be provided',
    })
  })

  test('should return an error if membership is not an object', () => {
    const errors = robots.validateRobot({memberships: [1]})
    expect(errors).toContainEqual({
      type: 'invalid_type',
      message: 'Membership config must be an object',
    })
  })

  test('should return an error if membership resource type is not provided', () => {
    const errors = robots.validateRobot({memberships: [{}]})
    expect(errors).toContainEqual({
      type: 'missing_parameter',
      message: 'Membership resource type is required',
    })
  })

  test('should return an error if membership resource type is not project or organization', () => {
    const errors = robots.validateRobot({memberships: [{resourceType: 'invalid'}]})
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Membership resource type must be `organization` or `project`',
    })
  })

  test('should return an error if membership resource ID is not provided', () => {
    const errors = robots.validateRobot({memberships: [{}]})
    expect(errors).toContainEqual({
      type: 'missing_parameter',
      message: 'Membership resource ID is required',
    })
  })

  test('should return an error if membership resource ID is not a string', () => {
    const errors = robots.validateRobot({memberships: [{resourceId: 1}]})
    expect(errors).toContainEqual({
      type: 'invalid_type',
      message: 'Membership resource ID must be a string',
    })
  })

  test('should return an error if membership role names array is not provided', () => {
    const errors = robots.validateRobot({memberships: [{}]})
    expect(errors).toContainEqual({
      type: 'missing_parameter',
      message: 'Membership role names array is required',
    })
  })

  test('should return an error if memberships is not an array', () => {
    const errors = robots.validateRobot({memberships: [{roleNames: 1}]})
    expect(errors).toContainEqual({type: 'invalid_type', message: 'Membership role names must be an array'})
  })

  test('should return an error if memberships is an empty array', () => {
    const errors = robots.validateRobot({memberships: [{roleNames: []}]})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Membership must have at least one role name'})
  })

  test('should return an error if role name is falsey', () => {
    const errors = robots.validateRobot({memberships: [{roleNames: [null]}]})
    expect(errors).toContainEqual({type: 'invalid_value', message: 'Membership role name must have at least one character'})
  })

  test('should return an error if resource type is provided and resource ID is not provided', () => {
    const errors = robots.validateRobot({resourceType: 'project'})
    expect(errors).toContainEqual({
      type: 'missing_parameter',
      message: 'Robot resource ID is required when resource type is provided',
    })
  })

  test('should return an error if resource type is not project or organization', () => {
    const errors = robots.validateRobot({resourceType: 'invalid'})
    expect(errors).toContainEqual({
      type: 'invalid_value',
      message: 'Robot resource type must be `organization` or `project`',
    })
  })

  test('should return an error if resource ID is provided and resource type is not provided', () => {
    const errors = robots.validateRobot({resourceId: 'test-resource'})
    expect(errors).toContainEqual({
      type: 'missing_parameter',
      message: 'Robot resource type is required when resource ID is provided',
    })
  })

  test('should return an error if membership resource ID is not a string', () => {
    const errors = robots.validateRobot({resourceId: 1})
    expect(errors).toContainEqual({
      type: 'invalid_type',
      message: 'Robot resource ID must be a string',
    })
  })
})
