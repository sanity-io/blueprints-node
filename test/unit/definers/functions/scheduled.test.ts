import {afterEach, describe, expect, test, vi} from 'vitest'
import {defineScheduledFunction, defineScheduleFunction} from '../../../../src/definers/functions/scheduled.js'
import * as index from '../../../../src/index.js'
import {defineBlueprintForResource} from '../../../helpers/index.js'

describe('defineScheduledFunction', () => {
  describe('happy paths', () => {
    test('should create a scheduled event with explicit cron fields', () => {
      const event = {minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'}
      const fn = defineScheduledFunction({
        name: 'test',
        event,
      })
      expect(fn.event).toEqual({minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'})
    })

    test('should normalize expression to explicit cron fields', () => {
      const event = {expression: '* * * * *'}
      const fn = defineScheduledFunction({
        name: 'test',
        event,
      })
      expect(fn.event).toEqual({minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'})
    })

    test('should create a scheduled function with optional timezone', () => {
      const fn = defineScheduledFunction({
        name: 'test',
        event: {expression: '* * * * *'},
        timezone: 'America/New_York',
      })
      expect(fn.timezone).toEqual('America/New_York')
      expect(fn.event).toEqual({minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'})
    })

    test('should parse natural language expression to explicit cron fields', () => {
      const fn = defineScheduledFunction({
        name: 'test',
        event: {expression: 'every day at 9am'},
      })
      expect(fn.event).toEqual({minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '*'})
    })

    test('should normalize cron expression to explicit fields', () => {
      const fn = defineScheduledFunction({
        name: 'test',
        event: {expression: '0 9 * * 1-5'},
      })
      expect(fn.event).toEqual({minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1-5'})
    })

    test('should parse weekday natural language', () => {
      const fn = defineScheduledFunction({
        name: 'test',
        event: {expression: 'weekdays at 8am'},
      })
      expect(fn.event).toEqual({minute: '0', hour: '8', dayOfMonth: '*', month: '*', dayOfWeek: '1-5'})
    })

    test('should parse specific weekday with time', () => {
      const fn = defineScheduledFunction({
        name: 'test',
        event: {expression: 'fridays at 9am'},
      })
      expect(fn.event).toEqual({minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '5'})
    })

    test('should parse time of day period', () => {
      const fn = defineScheduledFunction({
        name: 'test',
        event: {expression: 'fridays in the evening'},
      })
      expect(fn.event).toEqual({minute: '0', hour: '18', dayOfMonth: '*', month: '*', dayOfWeek: '5'})
    })

    test('should parse multiple weekdays', () => {
      const fn = defineScheduledFunction({
        name: 'test',
        event: {expression: 'mon, wed, fri at 9am'},
      })
      expect(fn.event).toEqual({minute: '0', hour: '9', dayOfMonth: '*', month: '*', dayOfWeek: '1,3,5'})
    })

    test('should parse interval schedules', () => {
      const fn = defineScheduledFunction({
        name: 'test',
        event: {expression: 'every 15 minutes'},
      })
      expect(fn.event).toEqual({minute: '*/15', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'})
    })

    test('deprecated method defineScheduleFunction should work', () => {
      const fn = defineScheduleFunction({
        name: 'test',
        event: {expression: 'every 15 minutes'},
      })
      expect(fn.event).toEqual({minute: '*/15', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'})
    })
  })

  describe('sad paths', () => {
    afterEach(() => {
      vi.resetAllMocks()
    })

    test('should throw an error if validateScheduledFunction returns an error', () => {
      const spy = vi.spyOn(index, 'validateScheduledFunction').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
      expect(() =>
        defineBlueprintForResource(
          defineScheduledFunction({name: 'test', event: {minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'}}),
        ),
      ).toThrow('this is a test')

      expect(spy).toHaveBeenCalledOnce()
    })
  })
})
