import {describe, expect, test} from 'vitest'
import {parseScheduleExpression, validateScheduleExpression} from '../../../src/utils/schedule-parser.js'

describe('parseScheduleExpression', () => {
  describe('cron passthrough', () => {
    test('should return valid cron expression unchanged', () => {
      expect(parseScheduleExpression('* * * * *')).toBe('* * * * *')
      expect(parseScheduleExpression('0 9 * * *')).toBe('0 9 * * *')
      expect(parseScheduleExpression('*/5 * * * *')).toBe('*/5 * * * *')
      expect(parseScheduleExpression('0 9 * * 1-5')).toBe('0 9 * * 1-5')
      expect(parseScheduleExpression('0 9,17 * * *')).toBe('0 9,17 * * *')
      expect(parseScheduleExpression('30 14 1 * *')).toBe('30 14 1 * *')
      expect(parseScheduleExpression('0 0 1,15 * *')).toBe('0 0 1,15 * *')
    })
  })

  describe('every N minutes', () => {
    test('should parse "every minute"', () => {
      expect(parseScheduleExpression('every minute')).toBe('* * * * *')
    })

    test('should parse "every N minutes"', () => {
      expect(parseScheduleExpression('every 5 minutes')).toBe('*/5 * * * *')
      expect(parseScheduleExpression('every 15 minutes')).toBe('*/15 * * * *')
      expect(parseScheduleExpression('every 30 minutes')).toBe('*/30 * * * *')
    })
  })

  describe('every N hours', () => {
    test('should parse "every hour"', () => {
      expect(parseScheduleExpression('every hour')).toBe('0 * * * *')
    })

    test('should parse "every N hours"', () => {
      expect(parseScheduleExpression('every 2 hours')).toBe('0 */2 * * *')
      expect(parseScheduleExpression('every 4 hours')).toBe('0 */4 * * *')
      expect(parseScheduleExpression('every 6 hours')).toBe('0 */6 * * *')
    })

    test('should parse "every hour at :MM"', () => {
      expect(parseScheduleExpression('every hour at :30')).toBe('30 * * * *')
      expect(parseScheduleExpression('every hour at :15')).toBe('15 * * * *')
      expect(parseScheduleExpression('every hour at :00')).toBe('0 * * * *')
    })
  })

  describe('daily schedules', () => {
    test('should parse "every day at" with 12hr time', () => {
      expect(parseScheduleExpression('every day at 9am')).toBe('0 9 * * *')
      expect(parseScheduleExpression('every day at 9 am')).toBe('0 9 * * *')
      expect(parseScheduleExpression('every day at 9:30am')).toBe('30 9 * * *')
      expect(parseScheduleExpression('every day at 9:30 am')).toBe('30 9 * * *')
      expect(parseScheduleExpression('every day at 3pm')).toBe('0 15 * * *')
      expect(parseScheduleExpression('every day at 3:45pm')).toBe('45 15 * * *')
      expect(parseScheduleExpression('every day at 12am')).toBe('0 0 * * *')
      expect(parseScheduleExpression('every day at 12pm')).toBe('0 12 * * *')
    })

    test('should parse "every day at" with 24hr time', () => {
      expect(parseScheduleExpression('every day at 09:00')).toBe('0 9 * * *')
      expect(parseScheduleExpression('every day at 14:30')).toBe('30 14 * * *')
      expect(parseScheduleExpression('every day at 00:00')).toBe('0 0 * * *')
      expect(parseScheduleExpression('every day at 23:59')).toBe('59 23 * * *')
    })

    test('should parse "daily at" as alias', () => {
      expect(parseScheduleExpression('daily at 9am')).toBe('0 9 * * *')
      expect(parseScheduleExpression('daily at 14:30')).toBe('30 14 * * *')
    })
  })

  describe('named times', () => {
    test('should parse "at midnight"', () => {
      expect(parseScheduleExpression('at midnight')).toBe('0 0 * * *')
      expect(parseScheduleExpression('every day at midnight')).toBe('0 0 * * *')
    })

    test('should parse "at noon" and "at midday"', () => {
      expect(parseScheduleExpression('at noon')).toBe('0 12 * * *')
      expect(parseScheduleExpression('at midday')).toBe('0 12 * * *')
      expect(parseScheduleExpression('every day at noon')).toBe('0 12 * * *')
    })
  })

  describe('time of day periods', () => {
    test('should parse "every morning"', () => {
      expect(parseScheduleExpression('every morning')).toBe('0 9 * * *')
      expect(parseScheduleExpression('daily in the morning')).toBe('0 9 * * *')
    })

    test('should parse "every afternoon"', () => {
      expect(parseScheduleExpression('every afternoon')).toBe('0 14 * * *')
      expect(parseScheduleExpression('daily in the afternoon')).toBe('0 14 * * *')
    })

    test('should parse "every evening"', () => {
      expect(parseScheduleExpression('every evening')).toBe('0 18 * * *')
      expect(parseScheduleExpression('daily in the evening')).toBe('0 18 * * *')
    })
  })

  describe('specific weekday', () => {
    test('should parse weekday with full name', () => {
      expect(parseScheduleExpression('every monday')).toBe('0 0 * * 1')
      expect(parseScheduleExpression('every tuesday')).toBe('0 0 * * 2')
      expect(parseScheduleExpression('every wednesday')).toBe('0 0 * * 3')
      expect(parseScheduleExpression('every thursday')).toBe('0 0 * * 4')
      expect(parseScheduleExpression('every friday')).toBe('0 0 * * 5')
      expect(parseScheduleExpression('every saturday')).toBe('0 0 * * 6')
      expect(parseScheduleExpression('every sunday')).toBe('0 0 * * 0')
    })

    test('should parse weekday with abbreviation', () => {
      expect(parseScheduleExpression('every mon')).toBe('0 0 * * 1')
      expect(parseScheduleExpression('every tue')).toBe('0 0 * * 2')
      expect(parseScheduleExpression('every wed')).toBe('0 0 * * 3')
      expect(parseScheduleExpression('every thu')).toBe('0 0 * * 4')
      expect(parseScheduleExpression('every fri')).toBe('0 0 * * 5')
      expect(parseScheduleExpression('every sat')).toBe('0 0 * * 6')
      expect(parseScheduleExpression('every sun')).toBe('0 0 * * 0')
    })

    test('should parse plural weekday form', () => {
      expect(parseScheduleExpression('mondays')).toBe('0 0 * * 1')
      expect(parseScheduleExpression('fridays')).toBe('0 0 * * 5')
      expect(parseScheduleExpression('on fridays')).toBe('0 0 * * 5')
    })

    test('should parse weekday with time', () => {
      expect(parseScheduleExpression('every monday at 9am')).toBe('0 9 * * 1')
      expect(parseScheduleExpression('mondays at 9am')).toBe('0 9 * * 1')
      expect(parseScheduleExpression('on mondays at 9am')).toBe('0 9 * * 1')
      expect(parseScheduleExpression('fridays at 9:00')).toBe('0 9 * * 5')
      expect(parseScheduleExpression('every friday at 14:30')).toBe('30 14 * * 5')
    })
  })

  describe('multiple weekdays', () => {
    test('should parse comma-separated weekdays', () => {
      expect(parseScheduleExpression('monday, wednesday, friday')).toBe('0 0 * * 1,3,5')
      expect(parseScheduleExpression('mon, wed, fri')).toBe('0 0 * * 1,3,5')
      expect(parseScheduleExpression('tue, thu')).toBe('0 0 * * 2,4')
    })

    test('should parse "and" separated weekdays', () => {
      expect(parseScheduleExpression('monday and wednesday')).toBe('0 0 * * 1,3')
      expect(parseScheduleExpression('tuesday and thursday')).toBe('0 0 * * 2,4')
    })

    test('should parse multiple weekdays with time', () => {
      expect(parseScheduleExpression('monday, wednesday, friday at 9am')).toBe('0 9 * * 1,3,5')
      expect(parseScheduleExpression('mon, wed, fri at 8am')).toBe('0 8 * * 1,3,5')
      expect(parseScheduleExpression('tuesday and thursday at 14:00')).toBe('0 14 * * 2,4')
    })
  })

  describe('weekdays and weekends', () => {
    test('should parse "weekdays"', () => {
      expect(parseScheduleExpression('weekdays')).toBe('0 0 * * 1-5')
      expect(parseScheduleExpression('every weekday')).toBe('0 0 * * 1-5')
      expect(parseScheduleExpression('on weekdays')).toBe('0 0 * * 1-5')
    })

    test('should parse "weekdays at" with time', () => {
      expect(parseScheduleExpression('weekdays at 9am')).toBe('0 9 * * 1-5')
      expect(parseScheduleExpression('every weekday at 8:30am')).toBe('30 8 * * 1-5')
      expect(parseScheduleExpression('weekdays at 14:00')).toBe('0 14 * * 1-5')
    })

    test('should parse "weekends"', () => {
      expect(parseScheduleExpression('weekends')).toBe('0 0 * * 0,6')
      expect(parseScheduleExpression('every weekend')).toBe('0 0 * * 0,6')
      expect(parseScheduleExpression('on weekends')).toBe('0 0 * * 0,6')
    })

    test('should parse "weekends at" with time', () => {
      expect(parseScheduleExpression('weekends at 10am')).toBe('0 10 * * 0,6')
      expect(parseScheduleExpression('every weekend at 11:30am')).toBe('30 11 * * 0,6')
    })
  })

  describe('combined weekday and time of day', () => {
    test('should parse weekday with time of day period', () => {
      expect(parseScheduleExpression('fridays in the morning')).toBe('0 9 * * 5')
      expect(parseScheduleExpression('every monday in the afternoon')).toBe('0 14 * * 1')
      expect(parseScheduleExpression('saturdays in the evening')).toBe('0 18 * * 6')
    })

    test('should parse weekdays/weekends with time of day period', () => {
      expect(parseScheduleExpression('weekdays in the morning')).toBe('0 9 * * 1-5')
      expect(parseScheduleExpression('weekends in the afternoon')).toBe('0 14 * * 0,6')
    })
  })

  describe('monthly schedules', () => {
    test('should parse "first of the month"', () => {
      expect(parseScheduleExpression('first of the month')).toBe('0 0 1 * *')
      expect(parseScheduleExpression('first of the month at 9am')).toBe('0 9 1 * *')
      expect(parseScheduleExpression('first of every month at noon')).toBe('0 12 1 * *')
    })

    test('should parse "on the Nth"', () => {
      expect(parseScheduleExpression('on the 1st')).toBe('0 0 1 * *')
      expect(parseScheduleExpression('on the 15th')).toBe('0 0 15 * *')
      expect(parseScheduleExpression('on the 15th at noon')).toBe('0 12 15 * *')
      expect(parseScheduleExpression('on the 1st at 9am')).toBe('0 9 1 * *')
    })

    test('should parse ordinal day of month', () => {
      expect(parseScheduleExpression('every 1st')).toBe('0 0 1 * *')
      expect(parseScheduleExpression('every 2nd at 9am')).toBe('0 9 2 * *')
      expect(parseScheduleExpression('every 3rd at noon')).toBe('0 12 3 * *')
      expect(parseScheduleExpression('every 15th at 14:00')).toBe('0 14 15 * *')
    })
  })

  describe('case insensitivity', () => {
    test('should handle uppercase input', () => {
      expect(parseScheduleExpression('EVERY DAY AT 9AM')).toBe('0 9 * * *')
      expect(parseScheduleExpression('MONDAYS AT NOON')).toBe('0 12 * * 1')
      expect(parseScheduleExpression('WEEKDAYS IN THE MORNING')).toBe('0 9 * * 1-5')
    })

    test('should handle mixed case input', () => {
      expect(parseScheduleExpression('Every Monday at 9AM')).toBe('0 9 * * 1')
      expect(parseScheduleExpression('Fridays In The Evening')).toBe('0 18 * * 5')
    })
  })

  describe('whitespace handling', () => {
    test('should handle extra whitespace', () => {
      expect(parseScheduleExpression('  every day at 9am  ')).toBe('0 9 * * *')
      expect(parseScheduleExpression('every   day   at   9am')).toBe('0 9 * * *')
    })
  })

  describe('freeform expressions', () => {
    test('should parse space-separated weekdays with time', () => {
      expect(parseScheduleExpression('mon wed fri 9:00')).toBe('0 9 * * 1,3,5')
      expect(parseScheduleExpression('monday wednesday friday 9am')).toBe('0 9 * * 1,3,5')
      expect(parseScheduleExpression('tue thu 8:30am')).toBe('30 8 * * 2,4')
    })

    test('should parse day ranges', () => {
      expect(parseScheduleExpression('mon-fri 9am')).toBe('0 9 * * 1,2,3,4,5')
      expect(parseScheduleExpression('monday-friday 8:00')).toBe('0 8 * * 1,2,3,4,5')
      expect(parseScheduleExpression('mon-wed 10am')).toBe('0 10 * * 1,2,3')
      expect(parseScheduleExpression('fri-sun noon')).toBe('0 12 * * 0,5,6')
    })

    test('should parse time before days', () => {
      expect(parseScheduleExpression('9pm fridays')).toBe('0 21 * * 5')
      expect(parseScheduleExpression('9:00 mon wed fri')).toBe('0 9 * * 1,3,5')
      expect(parseScheduleExpression('noon weekdays')).toBe('0 12 * * 1-5')
    })

    test('should be forgiving with filler words', () => {
      expect(parseScheduleExpression('every day 12pm')).toBe('0 12 * * *')
      expect(parseScheduleExpression('daily 9am')).toBe('0 9 * * *')
      expect(parseScheduleExpression('mondays 9am')).toBe('0 9 * * 1')
      expect(parseScheduleExpression('weekdays 8am')).toBe('0 8 * * 1-5')
    })

    test('should handle mixed formats', () => {
      expect(parseScheduleExpression('9pm fridays and wed')).toBe('0 21 * * 3,5')
      expect(parseScheduleExpression('wednesday friday 9pm')).toBe('0 21 * * 3,5')
      expect(parseScheduleExpression('fri sat sun morning')).toBe('0 9 * * 0,5,6')
    })

    test('should parse short day abbreviations', () => {
      expect(parseScheduleExpression('mo we fr 9am')).toBe('0 9 * * 1,3,5')
      expect(parseScheduleExpression('tu th 8am')).toBe('0 8 * * 2,4')
      expect(parseScheduleExpression('sa su noon')).toBe('0 12 * * 0,6')
    })

    test('should handle ordinal without strict pattern', () => {
      expect(parseScheduleExpression('1st 9am')).toBe('0 9 1 * *')
      expect(parseScheduleExpression('15th noon')).toBe('0 12 15 * *')
      expect(parseScheduleExpression('first month 9am')).toBe('0 9 1 * *')
    })
  })
})

describe('validateScheduleExpression', () => {
  describe('valid expressions', () => {
    test('should return empty array for valid cron expression', () => {
      expect(validateScheduleExpression('* * * * *')).toStrictEqual([])
      expect(validateScheduleExpression('0 9 * * *')).toStrictEqual([])
    })

    test('should return empty array for valid natural language', () => {
      expect(validateScheduleExpression('every day at 9am')).toStrictEqual([])
      expect(validateScheduleExpression('weekdays at 8am')).toStrictEqual([])
      expect(validateScheduleExpression('mon wed fri 9:00')).toStrictEqual([])
      expect(validateScheduleExpression('every 15 minutes')).toStrictEqual([])
    })
  })

  describe('empty expression', () => {
    test('should return error for empty string', () => {
      const errors = validateScheduleExpression('')
      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`expression` cannot be empty',
      })
    })

    test('should return error for whitespace-only string', () => {
      const errors = validateScheduleExpression('   ')
      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`expression` cannot be empty',
      })
    })
  })

  describe('unrecognized patterns', () => {
    test('should return error for unrecognized pattern', () => {
      const errors = validateScheduleExpression('sometime next week')
      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: 'Could not parse schedule expression `sometime next week`',
      })
    })

    test('should return error for gibberish', () => {
      const errors = validateScheduleExpression('whenever')
      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: 'Could not parse schedule expression `whenever`',
      })
    })
  })

  describe('invalid time format', () => {
    test('should return error for hour out of range (24hr format)', () => {
      const errors = validateScheduleExpression('every day at 25:00')
      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: 'Invalid time: hour must be 0-23 for 24-hour format, got `25`',
      })
    })

    test('should return error for hour out of range (12hr format)', () => {
      const errors = validateScheduleExpression('every day at 13am')
      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: 'Invalid time: hour must be 1-12 for 12-hour format, got `13`',
      })
    })

    test('should return error for minute out of range', () => {
      const errors = validateScheduleExpression('every day at 9:60am')
      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: 'Invalid time: minute must be 0-59, got `60`',
      })
    })
  })

  describe('invalid day of month', () => {
    test('should return error for day > 31', () => {
      const errors = validateScheduleExpression('on the 32nd')
      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: 'Invalid day of month: must be 1-31, got `32`',
      })
    })

    test('should return error for day = 0', () => {
      const errors = validateScheduleExpression('on the 0th')
      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: 'Invalid day of month: must be 1-31, got `0`',
      })
    })
  })

  describe('invalid intervals', () => {
    test('should return error for minutes = 0', () => {
      const errors = validateScheduleExpression('every 0 minutes')
      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: 'Invalid interval: minutes must be 1-59, got `0`',
      })
    })

    test('should return error for minutes > 59', () => {
      const errors = validateScheduleExpression('every 61 minutes')
      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: 'Invalid interval: minutes must be 1-59, got `61`',
      })
    })

    test('should return error for hours = 0', () => {
      const errors = validateScheduleExpression('every 0 hours')
      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: 'Invalid interval: hours must be 1-23, got `0`',
      })
    })

    test('should return error for hours > 23', () => {
      const errors = validateScheduleExpression('every 25 hours')
      expect(errors).toHaveLength(1)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: 'Invalid interval: hours must be 1-23, got `25`',
      })
    })
  })

  describe('multiple errors', () => {
    test('should collect multiple errors for invalid interval and time', () => {
      // "every 0 minutes at 25:00" has invalid interval AND invalid time
      const errors = validateScheduleExpression('every 0 minutes at 25:00')
      expect(errors).toHaveLength(2)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: 'Invalid interval: minutes must be 1-59, got `0`',
      })
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: 'Invalid time: hour must be 0-23 for 24-hour format, got `25`',
      })
    })

    test('should collect multiple time errors', () => {
      // "25:60" has both invalid hour and minute - though parsed as one token
      const errors = validateScheduleExpression('every day at 25:60')
      expect(errors).toHaveLength(1) // 25:60 fails on first check (hour)
      expect(errors[0].message).toMatch(/hour/)
    })
  })
})
