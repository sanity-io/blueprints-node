import {APPLICATION_TILE_SIZES, APPLICATION_VIEW_SURFACES} from '../types/applications.js'
import type {BlueprintError} from '../types/errors.js'
import {APPLICATION_VISIBILITIES} from '../types/studios.js'
import {isReference} from '../utils/validation.js'
import {validateResource} from './resources.js'

/** hostname validity pattern */
const APPLICATION_SLUG_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/

/** view/worker name pattern */
const VIEW_NAME_PATTERN = /^[a-zA-Z0-9_-]+$/

/**
 * Validates the fields shared by every application view and web worker.
 * @param view The view or web worker
 * @param label The human-readable label used in error messages (e.g. `Window view`)
 * @returns A list of validation errors
 */
function validateViewBase(view: object, label: string): BlueprintError[] {
  const errors: BlueprintError[] = []

  if (!('name' in view) || !view.name) {
    errors.push({type: 'missing_parameter', message: `${label} name is required`})
  } else if (typeof view.name !== 'string') {
    errors.push({type: 'invalid_type', message: `${label} name must be a string`})
  } else if (!VIEW_NAME_PATTERN.test(view.name)) {
    errors.push({type: 'invalid_format', message: `${label} name must match pattern: ${VIEW_NAME_PATTERN.source}`})
  }

  if (!('title' in view) || !view.title) {
    errors.push({type: 'missing_parameter', message: `${label} title is required`})
  } else if (typeof view.title !== 'string') {
    errors.push({type: 'invalid_type', message: `${label} title must be a string`})
  }

  if (!('src' in view) || !view.src) {
    errors.push({type: 'missing_parameter', message: `${label} src is required`})
  } else if (typeof view.src !== 'string') {
    errors.push({type: 'invalid_type', message: `${label} src must be a string`})
  }

  return errors
}

/**
 * Validates the optional `dock` placement of a window view.
 * @param view The window view
 * @param label The human-readable label used in error messages
 * @returns A list of validation errors
 */
function validateDockField(view: object, label: string): BlueprintError[] {
  if (!('dock' in view) || typeof view.dock === 'undefined') return []

  if (typeof view.dock !== 'object' || view.dock === null) {
    return [{type: 'invalid_type', message: `${label} dock must be an object`}]
  }

  const errors: BlueprintError[] = []
  if ('group' in view.dock && typeof view.dock.group !== 'string') {
    errors.push({type: 'invalid_type', message: `${label} dock.group must be a string`})
  }
  if ('order' in view.dock && typeof view.dock.order !== 'number') {
    errors.push({type: 'invalid_type', message: `${label} dock.order must be a number`})
  }
  return errors
}

/**
 * Validates the `size` and optional `order` of a tile view.
 * @param view The tile view
 * @param label The human-readable label used in error messages
 * @returns A list of validation errors
 */
function validateTileFields(view: object, label: string): BlueprintError[] {
  const errors: BlueprintError[] = []

  if (!('size' in view) || !view.size) {
    errors.push({type: 'missing_parameter', message: `${label} size is required`})
  } else if (!APPLICATION_TILE_SIZES.some((size) => size === view.size)) {
    errors.push({type: 'invalid_value', message: `${label} size must be one of ${APPLICATION_TILE_SIZES.join(', ')}`})
  }

  if ('order' in view && typeof view.order !== 'number') {
    errors.push({type: 'invalid_type', message: `${label} order must be a number`})
  }

  return errors
}

/**
 * Validates that the given resource is a valid window view.
 * @param resource The window view
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validateWindowView(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'Window view config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'Window view config must be an object'}]

  const errors: BlueprintError[] = validateViewBase(resource, 'Window view')

  if ('surface' in resource && resource.surface !== 'window') {
    errors.push({type: 'invalid_value', message: 'Window view surface must be `window`'})
  }

  errors.push(...validateDockField(resource, 'Window view'))

  return errors
}

/**
 * Validates that the given resource is a valid panel view.
 * @param resource The panel view
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validatePanelView(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'Panel view config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'Panel view config must be an object'}]

  const errors: BlueprintError[] = validateViewBase(resource, 'Panel view')

  if ('surface' in resource && resource.surface !== 'panel') {
    errors.push({type: 'invalid_value', message: 'Panel view surface must be `panel`'})
  }

  return errors
}

/**
 * Validates that the given resource is a valid asset source view.
 * @param resource The asset source view
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validateAssetSourceView(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'Asset source view config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'Asset source view config must be an object'}]

  const errors: BlueprintError[] = validateViewBase(resource, 'Asset source view')

  if ('surface' in resource && resource.surface !== 'asset-source') {
    errors.push({type: 'invalid_value', message: 'Asset source view surface must be `asset-source`'})
  }

  return errors
}

/**
 * Validates that the given resource is a valid tile view.
 * @param resource The tile view
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validateTileView(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'Tile view config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'Tile view config must be an object'}]

  const errors: BlueprintError[] = validateViewBase(resource, 'Tile view')

  if ('surface' in resource && resource.surface !== 'tile') {
    errors.push({type: 'invalid_value', message: 'Tile view surface must be `tile`'})
  }

  errors.push(...validateTileFields(resource, 'Tile view'))

  return errors
}

/**
 * Validates that the given resource is a valid web worker.
 * @param resource The web worker
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validateWebWorker(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'Web worker config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'Web worker config must be an object'}]

  const errors: BlueprintError[] = validateViewBase(resource, 'Web worker')

  if ('type' in resource && resource.type !== 'worker') {
    errors.push({type: 'invalid_value', message: 'Web worker type must be `worker`'})
  }

  return errors
}

/**
 * Validates a single application view config by its `surface` discriminator.
 * @param view The view config
 * @returns A list of validation errors
 */
function validateApplicationView(view: unknown): BlueprintError[] {
  if (!view || typeof view !== 'object' || !('surface' in view)) {
    return [{type: 'invalid_value', message: 'Application view must be an object with a `surface`'}]
  }

  switch (view.surface) {
    case 'window':
      return validateWindowView(view)
    case 'panel':
      return validatePanelView(view)
    case 'asset-source':
      return validateAssetSourceView(view)
    case 'tile':
      return validateTileView(view)
    default:
      return [{type: 'invalid_value', message: `Application view surface must be one of ${APPLICATION_VIEW_SURFACES.join(', ')}`}]
  }
}

/**
 * Validates that the given resource is a valid Application.
 * @param resource The Application resource
 * @hidden
 * @category Validation
 * @returns A list of validation errors
 */
export function validateApplication(resource: unknown): BlueprintError[] {
  if (!resource) return [{type: 'invalid_value', message: 'Application config must be provided'}]
  if (typeof resource !== 'object') return [{type: 'invalid_type', message: 'Application config must be an object'}]

  const errors: BlueprintError[] = validateResource(resource)

  if ('type' in resource && resource.type !== 'sanity.application') {
    errors.push({type: 'invalid_value', message: 'Application type must be `sanity.application`'})
  }

  if (!('slug' in resource) || !resource.slug) {
    errors.push({type: 'missing_parameter', message: 'Application slug is required'})
  } else if (typeof resource.slug !== 'string') {
    errors.push({type: 'invalid_type', message: 'Application slug must be a string'})
  } else if (!isReference(resource.slug) && !APPLICATION_SLUG_PATTERN.test(resource.slug)) {
    errors.push({type: 'invalid_format', message: `Application slug must match pattern: ${APPLICATION_SLUG_PATTERN.source}`})
  }

  if (!('title' in resource) || !resource.title) {
    errors.push({type: 'missing_parameter', message: 'Application title is required'})
  } else if (typeof resource.title !== 'string') {
    errors.push({type: 'invalid_type', message: 'Application title must be a string'})
  }

  if ('icon' in resource && typeof resource.icon !== 'string') {
    errors.push({type: 'invalid_type', message: 'Application icon must be a string'})
  }

  if (
    'visibility' in resource &&
    typeof resource.visibility !== 'undefined' &&
    !APPLICATION_VISIBILITIES.some((av) => av === resource.visibility)
  ) {
    errors.push({type: 'invalid_value', message: 'visibility must be one of `default`, `unlisted`, or `disabled`'})
  }

  if ('views' in resource && typeof resource.views !== 'undefined') {
    if (!Array.isArray(resource.views)) {
      errors.push({type: 'invalid_type', message: 'Application views must be an array'})
    } else {
      for (const view of resource.views) {
        errors.push(...validateApplicationView(view))
      }
    }
  }

  if ('webWorkers' in resource && typeof resource.webWorkers !== 'undefined') {
    if (!Array.isArray(resource.webWorkers)) {
      errors.push({type: 'invalid_type', message: 'Application webWorkers must be an array'})
    } else {
      for (const worker of resource.webWorkers) {
        errors.push(...validateWebWorker(worker))
      }
    }
  }

  return errors
}
