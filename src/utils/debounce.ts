import type {QueueDebounceConfig} from '../types/functions/index.js'
import {parseDuration} from './parse-duration.js'

export function createDebounceObject(debounce: string | number | QueueDebounceConfig) {
  if (typeof debounce === 'object') {
    return debounce
  } else {
    return {
      window: parseDuration(debounce, 's'),
    }
  }
}
