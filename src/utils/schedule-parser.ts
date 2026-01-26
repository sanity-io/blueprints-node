/**
 * Day of week mappings (cron uses 0=Sunday, 1=Monday, etc.)
 */
const DAYS_OF_WEEK: Record<string, number> = {
  sunday: 0,
  sun: 0,
  monday: 1,
  mon: 1,
  tuesday: 2,
  tue: 2,
  wednesday: 3,
  wed: 3,
  thursday: 4,
  thu: 4,
  friday: 5,
  fri: 5,
  saturday: 6,
  sat: 6,
}

/**
 * Named time mappings (hour, minute)
 */
const NAMED_TIMES: Record<string, {hour: number; minute: number}> = {
  midnight: {hour: 0, minute: 0},
  noon: {hour: 12, minute: 0},
  midday: {hour: 12, minute: 0},
  morning: {hour: 9, minute: 0},
  afternoon: {hour: 14, minute: 0},
  evening: {hour: 18, minute: 0},
}

/**
 * Check if a string looks like a cron expression
 */
function isCronExpression(expr: string): boolean {
  // Cron: 5 space-separated fields with digits, *, /, -, ,
  return /^[\d*,/-]+(\s+[\d*,/-]+){4}$/.test(expr.trim())
}

/**
 * Parse time string to hour and minute
 * Supports: 9am, 9:30am, 9 am, 14:30, 09:00
 */
function parseTime(timeStr: string): {hour: number; minute: number} {
  const normalized = timeStr.toLowerCase().replace(/\s+/g, '')

  // Check named times
  if (normalized in NAMED_TIMES) {
    return NAMED_TIMES[normalized]
  }

  // 12-hour format: 9am, 9:30am, 9:30pm
  const match12hr = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/)
  if (match12hr) {
    let hour = parseInt(match12hr[1], 10)
    const minute = match12hr[2] ? parseInt(match12hr[2], 10) : 0
    const period = match12hr[3]

    if (hour < 1 || hour > 12) {
      throw new Error(`Invalid time: hour must be 1-12 for 12-hour format, got ${hour}`)
    }
    if (minute < 0 || minute > 59) {
      throw new Error(`Invalid time: minute must be 0-59, got ${minute}`)
    }

    // Convert to 24-hour
    if (period === 'am') {
      hour = hour === 12 ? 0 : hour
    } else {
      hour = hour === 12 ? 12 : hour + 12
    }

    return {hour, minute}
  }

  // 24-hour format: 14:30, 09:00
  const match24hr = normalized.match(/^(\d{1,2}):(\d{2})$/)
  if (match24hr) {
    const hour = parseInt(match24hr[1], 10)
    const minute = parseInt(match24hr[2], 10)

    if (hour < 0 || hour > 23) {
      throw new Error(`Invalid time: hour must be 0-23 for 24-hour format, got ${hour}`)
    }
    if (minute < 0 || minute > 59) {
      throw new Error(`Invalid time: minute must be 0-59, got ${minute}`)
    }

    return {hour, minute}
  }

  throw new Error(`Invalid time format: "${timeStr}"`)
}

/**
 * Parse day of week from string
 */
function parseDayOfWeek(dayStr: string): number {
  const normalized = dayStr.toLowerCase().replace(/s$/, '') // Remove trailing 's' for plurals
  if (normalized in DAYS_OF_WEEK) {
    return DAYS_OF_WEEK[normalized]
  }
  throw new Error(`Unknown day of week: "${dayStr}"`)
}

/**
 * Parse multiple days of week from string
 * Supports: "monday, wednesday, friday" or "mon and wed"
 */
function parseDaysOfWeek(daysStr: string): number[] {
  const normalized = daysStr.toLowerCase()
  const parts = normalized.split(/(?:,|\s+and\s+)\s*/).filter(Boolean)
  return parts.map((part) => parseDayOfWeek(part.trim()))
}

/**
 * Parse ordinal number (1st, 2nd, 3rd, 15th) to number
 */
function parseOrdinal(ordinalStr: string): number {
  const match = ordinalStr.match(/^(\d+)(?:st|nd|rd|th)?$/)
  if (!match) {
    throw new Error(`Invalid ordinal: "${ordinalStr}"`)
  }
  const num = parseInt(match[1], 10)
  if (num < 1 || num > 31) {
    throw new Error(`Invalid day of month: must be 1-31, got ${num}`)
  }
  return num
}

/**
 * Extract time from expression, returns time and remaining string
 * Throws if time format is recognized but invalid (e.g., "at 25:00")
 */
function extractTime(expr: string): {time: {hour: number; minute: number} | null; remaining: string} {
  const normalized = expr.toLowerCase()

  // Check for "in the morning/afternoon/evening"
  const periodMatch = normalized.match(/\s+in\s+the\s+(morning|afternoon|evening)\s*$/i)
  if (periodMatch) {
    return {
      time: NAMED_TIMES[periodMatch[1]],
      remaining: expr.slice(0, expr.length - periodMatch[0].length).trim(),
    }
  }

  // Check for "at <time>" at end
  const atMatch = normalized.match(/\s+at\s+(.+?)\s*$/i)
  if (atMatch) {
    const timeStr = atMatch[1]
    // Check if it's a named time
    if (timeStr in NAMED_TIMES) {
      return {
        time: NAMED_TIMES[timeStr],
        remaining: expr.slice(0, expr.length - atMatch[0].length).trim(),
      }
    }
    // Check if it looks like a time format - if so, parse it and let errors propagate
    const looksLikeTime = /^\d{1,2}(:\d{2})?\s*(am|pm)?$|^\d{1,2}:\d{2}$/.test(timeStr.toLowerCase().replace(/\s+/g, ''))
    if (looksLikeTime) {
      // This will throw if the time is invalid (e.g., 25:00, 13am)
      const time = parseTime(timeStr)
      return {
        time,
        remaining: expr.slice(0, expr.length - atMatch[0].length).trim(),
      }
    }
  }

  return {time: null, remaining: expr}
}

/**
 * Suggest corrections for common typos
 */
function suggestCorrection(expr: string): string | null {
  const normalized = expr.toLowerCase()

  const suggestions: Array<{pattern: RegExp; suggestion: string}> = [
    // Missing letters in "every"
    {pattern: /\bevry\b/, suggestion: 'every'},
    {pattern: /\bevey\b/, suggestion: 'every'},
    {pattern: /\beery\b/, suggestion: 'every'},
    // Double letters at end of weekdays (mondayss, fridayss, etc.)
    {pattern: /\bmondayss/, suggestion: 'mondays'},
    {pattern: /\btuesdayss/, suggestion: 'tuesdays'},
    {pattern: /\bwednesdayss/, suggestion: 'wednesdays'},
    {pattern: /\bthursdayss/, suggestion: 'thursdays'},
    {pattern: /\bfridayss/, suggestion: 'fridays'},
    {pattern: /\bsaturdayss/, suggestion: 'saturdays'},
    {pattern: /\bsundayss/, suggestion: 'sundays'},
    // Common misspellings
    {pattern: /\bweakdays\b/, suggestion: 'weekdays'},
    {pattern: /\bweakends?\b/, suggestion: 'weekends'},
    {pattern: /\bweekdyas\b/, suggestion: 'weekdays'},
  ]

  for (const {pattern, suggestion} of suggestions) {
    if (pattern.test(normalized)) {
      return suggestion
    }
  }

  return null
}

/**
 * Parse a natural language schedule expression into a cron expression.
 *
 * Supports patterns like:
 * - "every minute", "every 5 minutes"
 * - "every hour", "every 2 hours"
 * - "every day at 9am", "daily at 14:30"
 * - "at midnight", "at noon"
 * - "every morning", "every evening"
 * - "mondays at 9am", "every friday"
 * - "mon, wed, fri at 8am"
 * - "weekdays at 9am", "weekends at 10am"
 * - "first of the month at 9am", "on the 15th at noon"
 *
 * If the input is already a valid cron expression, it is returned unchanged.
 *
 * @param expression - Natural language schedule or cron expression
 * @returns Cron expression string
 * @throws Error if the expression cannot be parsed
 */
export function parseScheduleExpression(expression: string): string {
  if (!expression || expression.trim() === '') {
    throw new Error('Schedule expression cannot be empty')
  }

  const trimmed = expression.trim()

  // If it's already a cron expression, return as-is
  if (isCronExpression(trimmed)) {
    return trimmed
  }

  // Check for typos early, before pattern matching
  const earlySuggestion = suggestCorrection(trimmed)
  if (earlySuggestion) {
    throw new Error(`Could not parse schedule expression: "${trimmed}". Did you mean "${earlySuggestion}"?`)
  }

  // Normalize: lowercase, collapse whitespace
  const normalized = trimmed.toLowerCase().replace(/\s+/g, ' ')

  // Extract time if present
  const {time, remaining} = extractTime(normalized)
  const defaultTime = time || {hour: 0, minute: 0}

  // --- Pattern matching ---

  // "every minute"
  if (/^every\s+minute$/.test(remaining)) {
    return '* * * * *'
  }

  // "every N minutes"
  const everyNMinutes = remaining.match(/^every\s+(\d+)\s+minutes?$/)
  if (everyNMinutes) {
    const n = parseInt(everyNMinutes[1], 10)
    if (n < 1 || n > 59) {
      throw new Error(`Invalid interval: minutes must be 1-59, got ${n}`)
    }
    return `*/${n} * * * *`
  }

  // "every hour"
  if (/^every\s+hour$/.test(remaining)) {
    return `${defaultTime.minute} * * * *`
  }

  // "every N hours"
  const everyNHours = remaining.match(/^every\s+(\d+)\s+hours?$/)
  if (everyNHours) {
    const n = parseInt(everyNHours[1], 10)
    if (n < 1 || n > 23) {
      throw new Error(`Invalid interval: hours must be 1-23, got ${n}`)
    }
    return `0 */${n} * * *`
  }

  // "every hour at :MM"
  const everyHourAt = remaining.match(/^every\s+hour\s+at\s+:(\d{1,2})$/)
  if (everyHourAt) {
    const minute = parseInt(everyHourAt[1], 10)
    if (minute < 0 || minute > 59) {
      throw new Error(`Invalid time: minute must be 0-59, got ${minute}`)
    }
    return `${minute} * * * *`
  }

  // "every day at ..." / "daily at ..." / "at midnight" / "at noon"
  if (/^(every\s+day|daily)$/.test(remaining) || /^at\s+(midnight|noon|midday)$/.test(normalized)) {
    // If we matched "at midnight/noon" directly, extract that time
    const directTimeMatch = normalized.match(/^at\s+(midnight|noon|midday)$/)
    if (directTimeMatch) {
      const t = NAMED_TIMES[directTimeMatch[1]]
      return `${t.minute} ${t.hour} * * *`
    }
    return `${defaultTime.minute} ${defaultTime.hour} * * *`
  }

  // "every morning/afternoon/evening" / "daily in the morning/afternoon/evening"
  const periodOnly = normalized.match(/^(every|daily\s+in\s+the)\s+(morning|afternoon|evening)$/)
  if (periodOnly) {
    const t = NAMED_TIMES[periodOnly[2]]
    return `${t.minute} ${t.hour} * * *`
  }

  // "weekdays" / "every weekday" / "on weekdays"
  if (/^(every\s+)?weekdays?$/.test(remaining) || /^on\s+weekdays$/.test(remaining)) {
    return `${defaultTime.minute} ${defaultTime.hour} * * 1-5`
  }

  // "weekends" / "every weekend" / "on weekends"
  if (/^(every\s+)?weekends?$/.test(remaining) || /^on\s+weekends$/.test(remaining)) {
    return `${defaultTime.minute} ${defaultTime.hour} * * 0,6`
  }

  // Specific weekday: "every monday", "mondays", "on fridays"
  const singleDayMatch = remaining.match(/^(?:every\s+|on\s+)?(\w+?)(s)?$/)
  if (singleDayMatch) {
    const dayStr = singleDayMatch[1]
    try {
      const day = parseDayOfWeek(dayStr)
      return `${defaultTime.minute} ${defaultTime.hour} * * ${day}`
    } catch {
      // Not a valid day, continue to other patterns
    }
  }

  // Multiple weekdays: "monday, wednesday, friday" or "mon and wed"
  const multiDayMatch = remaining.match(/^(?:every\s+)?(\w+(?:\s*,\s*\w+)+|\w+\s+and\s+\w+)$/)
  if (multiDayMatch) {
    try {
      const days = parseDaysOfWeek(multiDayMatch[1])
      const sortedDays = [...new Set(days)].sort((a, b) => a - b)
      return `${defaultTime.minute} ${defaultTime.hour} * * ${sortedDays.join(',')}`
    } catch {
      // Not valid days, continue
    }
  }

  // "first of the month" / "first of every month"
  if (/^first\s+of\s+(the|every)\s+month$/.test(remaining)) {
    return `${defaultTime.minute} ${defaultTime.hour} 1 * *`
  }

  // "on the Nth" / "every Nth"
  const dayOfMonthMatch = remaining.match(/^(?:on\s+the|every)\s+(\d+(?:st|nd|rd|th))$/)
  if (dayOfMonthMatch) {
    const day = parseOrdinal(dayOfMonthMatch[1])
    return `${defaultTime.minute} ${defaultTime.hour} ${day} * *`
  }

  // --- No pattern matched ---
  const suggestion = suggestCorrection(trimmed)
  if (suggestion) {
    throw new Error(`Could not parse schedule expression: "${trimmed}". Did you mean "${suggestion}"?`)
  }

  throw new Error(
    `Could not parse schedule expression: "${trimmed}". ` +
      'Supported patterns include: "every day at 9am", "weekdays at 8am", "mondays at noon", "every 15 minutes", etc.',
  )
}
