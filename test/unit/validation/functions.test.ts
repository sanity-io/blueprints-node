import {afterEach, describe, expect, test, vi} from 'vitest'
import * as index from '../../../src/index.js'
import * as functions from '../../../src/validation/functions.js'

describe('validateFunction', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('happy paths', () => {
    test('should accept a valid function', () => {
      const errors = functions.validateFunction({name: 'test-function', type: 'test'})
      expect(errors).toHaveLength(0)
    })
    test('should accept a function with undefined env', () => {
      const errors = functions.validateFunction({name: 'test-function', type: 'test', env: undefined})
      expect(errors).toHaveLength(0)
    })
  })
  describe('sad paths', () => {
    test('should return an error if validateResource returns an error', () => {
      const spy = vi.spyOn(index, 'validateResource').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
      const errors = functions.validateFunction({name: 'test-function', type: 'test'})

      expect(errors).toContainEqual({type: 'test', message: 'this is a test'})
      expect(spy).toHaveBeenCalledOnce()
    })

    test('should return an error if config is falsey', () => {
      const errors = functions.validateFunction(undefined)
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: 'Function config must be provided',
      })
    })

    test('should return an error if config is not an object', () => {
      const errors = functions.validateFunction(1)
      expect(errors).toContainEqual({
        type: 'invalid_type',
        message: 'Function config must be an object',
      })
    })

    test('should return an error if name is not provided', () => {
      const errors = functions.validateFunction({})
      expect(errors).toContainEqual({type: 'missing_parameter', message: '`name` is required'})
    })

    test('should return an error if name is not a string', () => {
      const errors = functions.validateFunction({name: 1})
      expect(errors).toContainEqual({type: 'invalid_type', message: '`name` must be a string'})
    })
    test('should validate the name when higher-level functions are called', () => {
      const docFnErrors = functions.validateDocumentFunction({})
      expect(docFnErrors).toContainEqual({type: 'missing_parameter', message: '`name` is required'})

      const mlFnErrors = functions.validateMediaLibraryAssetFunction({})
      expect(mlFnErrors).toContainEqual({type: 'missing_parameter', message: '`name` is required'})
    })

    test('should return an error if the type is not provided', () => {
      const errors = functions.validateFunction({})
      expect(errors).toContainEqual({
        type: 'missing_parameter',
        message: '`type` is required',
      })
    })

    test('should return an error if the type is not a string', () => {
      const errors = functions.validateFunction({type: 1})
      expect(errors).toContainEqual({
        type: 'invalid_type',
        message: '`type` must be a string',
      })
    })

    test('should return an error if memory is not a number', () => {
      const errors = functions.validateFunction({name: 'test', memory: '1'})
      expect(errors).toContainEqual({type: 'invalid_type', message: '`memory` must be a number'})
    })

    test('should return an error if timeout is not a number', () => {
      const errors = functions.validateFunction({name: 'test', timeout: '1'})
      expect(errors).toContainEqual({type: 'invalid_type', message: '`timeout` must be a number'})
    })

    test('should return an error if robotToken is not a string', () => {
      const errors = functions.validateFunction({name: 'test', robotToken: 123})
      expect(errors).toContainEqual({type: 'invalid_type', message: '`robotToken` must be a string'})
    })

    test('should return an error if runtime is not a valid runtime', () => {
      const errors = functions.validateFunction({name: 'test', type: 'test', runtime: 'python'})
      expect(errors).toContainEqual({type: 'invalid_value', message: `\`runtime\` must be one of ${index.VALID_RUNTIMES.join(', ')}`})
    })

    test('should return an error if env is not an object', () => {
      const errors = functions.validateFunction({name: 'test', type: 'test', env: 'string'})
      expect(errors).toContainEqual({type: 'invalid_type', message: '`env` must be an object'})
    })

    test('should return an error if env[key] is not a string', () => {
      const errors = functions.validateFunction({name: 'test', type: 'test', env: {key: 1}})
      expect(errors).toContainEqual({type: 'invalid_type', message: '`env[key]` must be a string'})
    })
  })
})

describe('validateDocumentFunction', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('happy paths', () => {
    test('should accept a valid document function', () => {
      const errors = functions.validateDocumentFunction({
        name: 'test',
        type: 'sanity.function.document',
        event: {filter: '_type == "post"'},
      })
      expect(errors).toHaveLength(0)
    })
    test('should accept a function with a reference as the resource id', () => {
      const errors = functions.validateDocumentFunction({
        name: 'test',
        type: 'sanity.function.document',
        event: {
          filter: '_type == "post"',
          resource: {
            type: 'dataset',
            id: `$.resources.test-dataset.resourceId`,
          },
        },
      })
      expect(errors).toHaveLength(0)
    })
  })
  describe('sad paths', () => {
    test('should return an error if validateResource returns an error', () => {
      const spy = vi.spyOn(index, 'validateResource').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
      const errors = functions.validateDocumentFunction({
        name: 'test',
        type: 'sanity.function.document',
        event: {filter: '_type == "post"'},
      })

      expect(errors).toContainEqual({type: 'test', message: 'this is a test'})
      expect(spy).toHaveBeenCalledOnce()
    })

    test('should return an error if event keys are defined using a mix of under the event object as well as at the top level', () => {
      const errors = functions.validateDocumentFunction({
        name: 'test',
        event: {on: ['publish']},
        filter: '_type == "post"',
      })
      expect(errors).toContainEqual({
        type: 'invalid_property',
        message:
          '`event` properties should be specified under the `event` key - specifying them at the top level is deprecated. The following keys were specified at the top level: `filter`',
      })
    })

    test('should return an error if the type is not `sanity.function.document`', () => {
      const errors = functions.validateDocumentFunction({type: 'invalid'})
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`type` must be `sanity.function.document`',
      })
    })

    test('should return an error if event.on is not an array', () => {
      const errors = functions.validateDocumentFunction({name: 'test', event: {on: 'publish'}})
      expect(errors).toContainEqual({type: 'invalid_type', message: '`event.on` must be an array'})
    })

    test('should return an error if event.resource.type is empty or not dataset', () => {
      let errors = functions.validateDocumentFunction({name: 'test', event: {on: ['update'], resource: {type: 'a', id: 'myProject.*'}}})
      expect(errors).toContainEqual({type: 'invalid_value', message: '`event.resource.type` must be "dataset"'})

      errors = functions.validateDocumentFunction({name: 'test', event: {on: ['update'], resource: {id: 'myProject.*'}}})
      expect(errors).toContainEqual({type: 'invalid_value', message: '`event.resource.type` must be "dataset"'})
    })

    test('should return an error if event.resource.id is invalid', () => {
      let errors = functions.validateDocumentFunction({
        name: 'test',
        event: {on: ['update'], resource: {type: 'dataset', id: 'notEnoughPeriods'}},
      })
      expect(errors).toContainEqual({
        type: 'invalid_format',
        message: '`event.resource.id` must be in the format <projectId>.<datasetName>',
      })

      errors = functions.validateDocumentFunction({
        name: 'test',
        event: {on: ['update'], resource: {type: 'dataset', id: 'too.many.periods'}},
      })
      expect(errors).toContainEqual({
        type: 'invalid_format',
        message: '`event.resource.id` must be in the format <projectId>.<datasetName>',
      })

      errors = functions.validateDocumentFunction({name: 'test', event: {on: ['update'], resource: {type: 'dataset'}}})
      expect(errors).toContainEqual({
        type: 'invalid_format',
        message: '`event.resource.id` must be in the format <projectId>.<datasetName>',
      })
    })
  })
})

describe('validateMediaLibraryAssetFunction', () => {
  const resource = {type: 'media-library' as const, id: 'ml12345'}

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('happy paths', () => {
    test('should accept a valid media library function', () => {
      const errors = functions.validateMediaLibraryAssetFunction({
        name: 'test',
        type: 'sanity.function.media-library.asset',
        event: {filter: '_type == "post"', resource},
      })
      expect(errors).toHaveLength(0)
    })
  })
  describe('sad paths', () => {
    test('should return an error if validateResource returns an error', () => {
      const spy = vi.spyOn(index, 'validateResource').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
      const errors = functions.validateMediaLibraryAssetFunction({
        name: 'test',
        type: 'sanity.function.media-library.asset',
        event: {filter: '_type == "post"', resource},
      })

      expect(errors).toContainEqual({type: 'test', message: 'this is a test'})
      expect(spy).toHaveBeenCalledOnce()
    })

    test('should return an error if the type is not `sanity.function.document`', () => {
      const errors = functions.validateMediaLibraryAssetFunction({type: 'invalid'})
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`type` must be `sanity.function.media-library.asset`',
      })
    })

    test('should return an error if event.on is not an array', () => {
      const errors = functions.validateMediaLibraryAssetFunction({name: 'test', event: {on: 'publish'}})
      expect(errors).toContainEqual({type: 'invalid_type', message: '`event.on` must be an array'})
    })

    test('should return an error if event.resource.type is empty or not media-library', () => {
      let errors = functions.validateMediaLibraryAssetFunction({
        name: 'test',
        event: {on: ['update'], resource: {type: 'a', id: 'ml12345'}},
      })
      expect(errors).toContainEqual({type: 'invalid_value', message: '`event.resource.type` must be "media-library"'})

      errors = functions.validateMediaLibraryAssetFunction({name: 'test', event: {on: ['update'], resource: {id: 'ml12345'}}})
      expect(errors).toContainEqual({type: 'invalid_value', message: '`event.resource.type` must be "media-library"'})
    })
  })
})

describe('validateScheduledFunction', () => {
  const validEvent = {minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'}

  describe('happy paths', () => {
    test('should accept a valid scheduled function', () => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: validEvent,
      })
      expect(errors).toHaveLength(0)
    })

    test.each(['*', '0', '59', '0-30', '*/5', '0-30/5', '0,15,30,45', '5,*/15'])('should accept valid minute expression %s', (minute) => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: {...validEvent, minute},
      })
      expect(errors).toHaveLength(0)
    })

    test.each(['*', '0', '23', '0-23', '*/2', '0-12/3', '0,6,12,18'])('should accept valid hour expression %s', (hour) => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: {...validEvent, hour},
      })
      expect(errors).toHaveLength(0)
    })

    test.each(['*', '1', '31', '1-15', '*/2', '1-15/2', '1,15,30'])('should accept valid dayOfMonth expression %s', (dayOfMonth) => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: {...validEvent, dayOfMonth},
      })
      expect(errors).toHaveLength(0)
    })

    test.each([
      '*',
      '1',
      '12',
      'JAN',
      'DEC',
      'JAN-MAR',
      'jan-mar',
      '*/3',
      '1,6,12',
      'JAN,JUL',
    ])('should accept valid month expression %s', (month) => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: {...validEvent, month},
      })
      expect(errors).toHaveLength(0)
    })

    test.each([
      '*',
      '0',
      '7',
      'SUN',
      'SAT',
      'MON-FRI',
      'mon-fri',
      '*/2',
      '1,3,5',
    ])('should accept valid dayOfWeek expression %s', (dayOfWeek) => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: {...validEvent, dayOfWeek},
      })
      expect(errors).toHaveLength(0)
    })

    test.each([
      'UTC',
      'America/New_York',
      'America/Los_Angeles',
      'America/Chicago',
      'America/Denver',
      'America/Sao_Paulo',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Moscow',
      'Africa/Cairo',
      'Africa/Nairobi',
      'Asia/Tokyo',
      'Asia/Shanghai',
      'Asia/Kolkata',
      'Asia/Dubai',
      'Asia/Singapore',
      'Australia/Sydney',
      'Pacific/Auckland',
      'Pacific/Honolulu',
    ])('should accept valid timezone %s', (timezone) => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: validEvent,
        timezone,
      })
      expect(errors).toHaveLength(0)
    })
  })
  describe('sad paths', () => {
    test('should return an error if the type is not `sanity.function.cron`', () => {
      const errors = functions.validateScheduledFunction({type: 'invalid'})
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`type` must be `sanity.function.cron`',
      })
    })

    test('should return an error if event specifies expression and explicit properties', () => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: {expression: '* * * * *', minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'},
      })
      expect(errors).toContainEqual({
        type: 'invalid_property',
        message: 'Cannot specify `expression`. Use `defineScheduledFunction` to convert this to explicit fields',
      })
    })

    test.each([
      'America/Duckberg',
      'Canada/Letterkenny',
      'Europe/Atlantis',
      'Asia/Shangri_La',
      'Tatooine/Mos_Eisley',
      'invalid',
      '',
    ])('should return an error for invalid timezone %s', (timezone) => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: validEvent,
        timezone,
      })
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`timezone` must be a valid IANA timezone',
      })
    })

    test.each([123, true, null, {}, []])('should return an error if timezone is not a string (%s)', (timezone) => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: validEvent,
        timezone,
      })
      expect(errors).toContainEqual({
        type: 'invalid_type',
        message: 'Function timezone must be a string',
      })
    })

    test('should return an error if event does not specify expression or explicit properties', () => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: {},
      })
      expect(errors).toContainEqual({
        type: 'missing_parameter',
        message: '`minute` must be provided',
      })
    })

    test('should return an error if event is missing properties', () => {
      const func = {name: 'test', type: 'sanity.function.cron'}
      let errors = functions.validateScheduledFunction({
        ...func,
        event: {hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'},
      })
      expect(errors).toContainEqual({type: 'missing_parameter', message: '`minute` must be provided'})

      errors = functions.validateScheduledFunction({
        ...func,
        event: {minute: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'},
      })
      expect(errors).toContainEqual({type: 'missing_parameter', message: '`hour` must be provided'})

      errors = functions.validateScheduledFunction({
        ...func,
        event: {hour: '*', minute: '*', month: '*', dayOfWeek: '*'},
      })
      expect(errors).toContainEqual({type: 'missing_parameter', message: '`dayOfMonth` must be provided'})

      errors = functions.validateScheduledFunction({
        ...func,
        event: {hour: '*', minute: '*', dayOfMonth: '*', dayOfWeek: '*'},
      })
      expect(errors).toContainEqual({type: 'missing_parameter', message: '`month` must be provided'})

      errors = functions.validateScheduledFunction({
        ...func,
        event: {hour: '*', minute: '*', dayOfMonth: '*', month: '*'},
      })
      expect(errors).toContainEqual({type: 'missing_parameter', message: '`dayOfWeek` must be provided'})
    })

    test('should return an error if event are not string properties', () => {
      const func = {name: 'test', type: 'sanity.function.cron'}
      let errors = functions.validateScheduledFunction({
        ...func,
        event: {minute: 1, hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*'},
      })
      expect(errors).toContainEqual({type: 'invalid_type', message: '`minute` must be a string'})

      errors = functions.validateScheduledFunction({
        ...func,
        event: {minute: '*', hour: 1, dayOfMonth: '*', month: '*', dayOfWeek: '*'},
      })
      expect(errors).toContainEqual({type: 'invalid_type', message: '`hour` must be a string'})

      errors = functions.validateScheduledFunction({
        ...func,
        event: {minute: '*', hour: '*', dayOfMonth: 1, month: '*', dayOfWeek: '*'},
      })
      expect(errors).toContainEqual({type: 'invalid_type', message: '`dayOfMonth` must be a string'})

      errors = functions.validateScheduledFunction({
        ...func,
        event: {minute: '*', hour: '*', dayOfMonth: '*', month: 1, dayOfWeek: '*'},
      })
      expect(errors).toContainEqual({type: 'invalid_type', message: '`month` must be a string'})

      errors = functions.validateScheduledFunction({
        ...func,
        event: {minute: '*', hour: '*', dayOfMonth: '*', month: '*', dayOfWeek: 1},
      })
      expect(errors).toContainEqual({type: 'invalid_type', message: '`dayOfWeek` must be a string'})
    })

    test.each([
      '60',
      '-1',
      'abc',
      '*/60',
      '60-70',
      '0-60',
      '0,60',
      '*/',
      '5/',
      ' ',
      '*  *',
    ])('should return an error for invalid minute expression %s', (minute) => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: {...validEvent, minute},
      })
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'invalid_value',
          message: expect.stringMatching(/Invalid minute field:/),
        }),
      )
    })

    test.each([
      '24',
      '25',
      '-1',
      'abc',
      '*/0',
      '*/24',
      '0-24',
      '24-25',
      '0,24',
    ])('should return an error for invalid hour expression %s', (hour) => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: {...validEvent, hour},
      })
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'invalid_value',
          message: expect.stringMatching(/Invalid hour field:/),
        }),
      )
    })

    test.each([
      '0',
      '32',
      '-1',
      'abc',
      '*/0',
      '*/32',
      '0-15',
      '1-32',
      '0,15',
    ])('should return an error for invalid dayOfMonth expression %s', (dayOfMonth) => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: {...validEvent, dayOfMonth},
      })
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'invalid_value',
          message: expect.stringMatching(/Invalid dayOfMonth field:/),
        }),
      )
    })

    test.each([
      '0',
      '13',
      '-1',
      'abc',
      'JANUARY',
      'XYZ',
      '*/0',
      '*/13',
      '0-6',
      '1-13',
      'JAN-XYZ',
    ])('should return an error for invalid month expression %s', (month) => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: {...validEvent, month},
      })
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'invalid_value',
          message: expect.stringMatching(/Invalid month field:/),
        }),
      )
    })

    test.each([
      '8',
      '9',
      '-1',
      'abc',
      'MONDAY',
      'XYZ',
      '*/8',
      '0-8',
      'MON-XYZ',
    ])('should return an error for invalid dayOfWeek expression %s', (dayOfWeek) => {
      const errors = functions.validateScheduledFunction({
        name: 'test',
        type: 'sanity.function.cron',
        event: {...validEvent, dayOfWeek},
      })
      expect(errors).toContainEqual(
        expect.objectContaining({
          type: 'invalid_value',
          message: expect.stringMatching(/Invalid dayOfWeek field:/),
        }),
      )
    })
  })
})

describe('validateSyncTagInvalidateFunction', () => {
  describe('happy paths', () => {
    test('should accept a valid sync tag invalidate function without any optional properties', () => {
      const errors = functions.validateSyncTagInvalidateFunction({
        name: 'test',
        type: 'sanity.function.sync-tag-invalidate',
      })
      expect(errors).toStrictEqual([])
    })
    test('should accept a valid sync tag invalidate function with optional dataset specifier', () => {
      const errors = functions.validateSyncTagInvalidateFunction({
        name: 'test',
        type: 'sanity.function.sync-tag-invalidate',
        event: {resource: {type: 'dataset', id: 'myProj.myDataset'}},
      })
      expect(errors).toStrictEqual([])
    })
    test('should accept a function with a reference as the resource id', () => {
      const errors = functions.validateSyncTagInvalidateFunction({
        name: 'test',
        type: 'sanity.function.sync-tag-invalidate',
        event: {resource: {type: 'dataset', id: '$.resources.test-dataset.resourceId'}},
      })
      expect(errors).toStrictEqual([])
    })
  })
  describe('sad paths', () => {
    test('should return an error if the type is not `sanity.function.sync-tag-invalidate`', () => {
      const errors = functions.validateSyncTagInvalidateFunction({type: 'invalid'})
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`type` must be `sanity.function.sync-tag-invalidate`',
      })
    })
    test('should return an error if event.resource is invalid', () => {
      let errors = functions.validateSyncTagInvalidateFunction({
        name: 'test',
        type: 'sanity.function.sync-tag-invalidate',
        event: {resource: true},
      })
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`event.resource` must be an object',
      })
      errors = functions.validateSyncTagInvalidateFunction({
        name: 'test',
        type: 'sanity.function.sync-tag-invalidate',
        event: {resource: {id: 'proj.dataset'}},
      })
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`event.resource.type` must be "dataset"',
      })
      errors = functions.validateSyncTagInvalidateFunction({
        name: 'test',
        type: 'sanity.function.sync-tag-invalidate',
        event: {resource: {type: 'dataset'}},
      })
      expect(errors).toContainEqual({
        type: 'invalid_format',
        message: '`event.resource.id` must be in the format <projectId>.<datasetName>',
      })
    })
  })
})

describe('validateQueueFunction', () => {
  describe('happy paths', () => {
    test('should accept a valid queue function without any optional properties', () => {
      const errors = functions.validateQueueFunction({
        name: 'test',
        type: 'sanity.function.queue',
      })
      expect(errors).toStrictEqual([])
    })
    test('should accept a valid queue function with default event properties', () => {
      const errors = functions.validateQueueFunction({
        name: 'test',
        type: 'sanity.function.queue',
        event: {concurrency: 1, fifo: true, dlq: true},
      })
      expect(errors).toStrictEqual([])
    })
    test('should accept a valid queue function with custom concurrency', () => {
      const errors = functions.validateQueueFunction({
        name: 'test',
        type: 'sanity.function.queue',
        event: {concurrency: 5, fifo: false, dlq: false},
      })
      expect(errors).toStrictEqual([])
    })
  })
  describe('sad paths', () => {
    test('should return an error if the type is not `sanity.function.queue`', () => {
      const errors = functions.validateQueueFunction({type: 'invalid'})
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`type` must be `sanity.function.queue`',
      })
    })
    test('should return an error if event.concurrency is invalid', () => {
      let errors = functions.validateQueueFunction({
        name: 'test',
        type: 'sanity.function.queue',
        event: {fifo: true, dlq: true},
      })
      expect(errors).toContainEqual({
        type: 'invalid_type',
        message: '`event.concurrency` must be a number',
      })
      errors = functions.validateQueueFunction({
        name: 'test',
        type: 'sanity.function.queue',
        event: {concurrency: 'five', fifo: true, dlq: true},
      })
      expect(errors).toContainEqual({
        type: 'invalid_type',
        message: '`event.concurrency` must be a number',
      })
      errors = functions.validateQueueFunction({
        name: 'test',
        type: 'sanity.function.queue',
        event: {concurrency: 0, fifo: true, dlq: true},
      })
      expect(errors).toContainEqual({
        type: 'invalid_type',
        message: '`event.concurrency` must be at least 1',
      })
    })
    test('should return an error if event.fifo is invalid', () => {
      let errors = functions.validateQueueFunction({
        name: 'test',
        type: 'sanity.function.queue',
        event: {concurrency: 1, dlq: true},
      })
      expect(errors).toContainEqual({
        type: 'invalid_type',
        message: '`event.fifo` must be a boolean',
      })
      errors = functions.validateQueueFunction({
        name: 'test',
        type: 'sanity.function.queue',
        event: {concurrency: 1, fifo: 'yes', dlq: true},
      })
      expect(errors).toContainEqual({
        type: 'invalid_type',
        message: '`event.fifo` must be a boolean',
      })
    })
    test('should return an error if event.dlq is invalid', () => {
      let errors = functions.validateQueueFunction({
        name: 'test',
        type: 'sanity.function.queue',
        event: {concurrency: 1, fifo: true},
      })
      expect(errors).toContainEqual({
        type: 'invalid_type',
        message: '`event.dlq` must be a boolean',
      })
      errors = functions.validateQueueFunction({
        name: 'test',
        type: 'sanity.function.queue',
        event: {concurrency: 1, fifo: true, dlq: 'yes'},
      })
      expect(errors).toContainEqual({
        type: 'invalid_type',
        message: '`event.dlq` must be a boolean',
      })
    })
  })
})

describe('validateEventFunction', () => {
  describe('happy paths', () => {
    test('should accept a valid event function without any optional properties', () => {
      const errors = functions.validateEventFunction({
        name: 'test',
        type: 'sanity.function.event',
      })
      expect(errors).toStrictEqual([])
    })
  })
  describe('sad paths', () => {
    test('should return an error if the type is not `sanity.function.event`', () => {
      const errors = functions.validateEventFunction({type: 'invalid'})
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`type` must be `sanity.function.event`',
      })
    })
  })
})

describe('validateWorkflowFunction', () => {
  describe('happy paths', () => {
    test('should accept a valid workflow function without any optional properties', () => {
      const errors = functions.validateWorkflowFunction({
        name: 'test',
        type: 'sanity.function.workflow',
        event: {type: 'document', filter: "_type == 'article'"},
      })
      expect(errors).toStrictEqual([])
    })
  })

  describe('sad paths', () => {
    test('should return an error if the type is not `sanity.function.workflow`', () => {
      const errors = functions.validateWorkflowFunction({type: 'invalid'})
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`type` must be `sanity.function.workflow`',
      })
    })

    test('should return an error if the event type is invalid', () => {
      const errors = functions.validateWorkflowFunction({
        name: 'test',
        type: 'sanity.function.workflow',
        event: {type: 'invalid', filter: "_type == 'article'"},
      })
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`event.type` must be either `document`, `sync-tag-invalidate`, or `media-library`',
      })
    })

    test('should return an error if concurrency is not a number', () => {
      const errors = functions.validateWorkflowFunction({
        name: 'test',
        type: 'sanity.function.workflow',
        concurrency: 'invalid',
      })
      expect(errors).toContainEqual({
        type: 'invalid_type',
        message: '`concurrency` must be a number',
      })
    })

    test('should return an error if concurrency is less than 1', () => {
      const errors = functions.validateWorkflowFunction({
        name: 'test',
        type: 'sanity.function.workflow',
        concurrency: 0,
      })
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`concurrency` must be at least 1',
      })
    })

    test('should return an error if concurrency is greater than 500', () => {
      const errors = functions.validateWorkflowFunction({
        name: 'test',
        type: 'sanity.function.workflow',
        concurrency: 600,
      })
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`concurrency` must be less than 500',
      })
    })

    test('should return an error if debounce is not a number', () => {
      const errors = functions.validateWorkflowFunction({
        name: 'test',
        type: 'sanity.function.workflow',
        event: {type: 'document', filter: "_type == 'article'"},
        debounce: 'invalid',
      })
      expect(errors).toContainEqual({
        type: 'invalid_type',
        message: '`debounce` must be a number',
      })
    })

    test('should return an error if debounceKey is set and not a string', () => {
      const errors = functions.validateWorkflowFunction({
        name: 'test',
        type: 'sanity.function.workflow',
        event: {type: 'document', filter: "_type == 'article'"},
        debounce: 1,
        debounceKey: 123,
      })
      expect(errors).toContainEqual({
        type: 'invalid_type',
        message: '`debounceKey` must be a string',
      })
    })

    test('should return an error if debounceKey is set but debounce is empty', () => {
      const errors = functions.validateWorkflowFunction({
        name: 'test',
        type: 'sanity.function.workflow',
        event: {type: 'document', filter: "_type == 'article'"},
        debounceKey: '_document.id',
      })
      expect(errors).toContainEqual({
        type: 'invalid_value',
        message: '`debounceKey` requires a `debounce` to be set',
      })
    })
  })
})
