import {
  type ApplicationViewSurface,
  type BlueprintApplicationConfig,
  type BlueprintApplicationResource,
  type BlueprintApplicationView,
  type BlueprintApplicationViewConfig,
  type BlueprintAssetSourceViewConfig,
  type BlueprintPanelViewConfig,
  type BlueprintTileViewConfig,
  type BlueprintWebWorker,
  type BlueprintWebWorkerConfig,
  type BlueprintWindowViewConfig,
  validateApplication,
  validateAssetSourceView,
  validatePanelView,
  validateTileView,
  validateWebWorker,
  validateWindowView,
} from '../index.js'
import {runValidation} from '../utils/validation.js'

/** Maps a view `surface` to the view `type` the backend expects. */
const SURFACE_TO_TYPE = {
  window: 'app',
  panel: 'panel',
  'asset-source': 'asset_source',
  tile: 'tile',
} as const satisfies Record<ApplicationViewSurface, BlueprintApplicationView['type']>

/**
 * Transforms an authored view config (discriminated by `surface`) into the
 * emitted view resource (discriminated by `type`), stripping `surface`.
 */
function viewConfigToResource(view: BlueprintApplicationViewConfig): BlueprintApplicationView {
  const {surface, ...rest} = view
  // The surface→type mapping guarantees a valid member of the emitted union.
  return {...rest, type: SURFACE_TO_TYPE[surface]} as BlueprintApplicationView
}

/**
 * Defines a window view — the navigable, full-page view of an application.
 *
 * ```ts
 * defineWindowView({
 *   name: 'main',
 *   title: 'Design Retro',
 *   src: './src/windows/main.tsx',
 * })
 * ```
 *
 * @example With dock placement
 * ```ts
 * defineWindowView({
 *   name: 'main',
 *   title: 'Design Retro',
 *   src: './src/windows/main.tsx',
 *   dock: {group: 'applications', order: 10},
 * })
 * ```
 * @param config The window view configuration
 * @public
 * @beta Deploying Applications via Blueprints is experimental. This may be subject to breaking changes.
 * @category Definers
 * @expandType BlueprintWindowViewConfig
 * @returns The window view declaration
 * @hidden
 */
export function defineWindowView(config: Omit<BlueprintWindowViewConfig, 'surface' | 'type'>): BlueprintWindowViewConfig {
  const view: BlueprintWindowViewConfig = {...config, surface: 'window', type: 'view'}
  runValidation(() => validateWindowView(view))
  return view
}

/**
 * Defines a panel view — renders in the dock.
 *
 * ```ts
 * definePanelView({
 *   name: 'side',
 *   title: 'Favorites',
 *   src: './src/panels/main.tsx',
 * })
 * ```
 * @param config The panel view configuration
 * @public
 * @beta Deploying Applications via Blueprints is experimental. This may be subject to breaking changes.
 * @category Definers
 * @expandType BlueprintPanelViewConfig
 * @returns The panel view declaration
 * @hidden
 */
export function definePanelView(config: Omit<BlueprintPanelViewConfig, 'surface' | 'type'>): BlueprintPanelViewConfig {
  const view: BlueprintPanelViewConfig = {...config, surface: 'panel', type: 'view'}
  runValidation(() => validatePanelView(view))
  return view
}

/**
 * Defines an asset source view — contributes an asset source.
 *
 * ```ts
 * defineAssetSourceView({
 *   name: 'image-picker',
 *   title: 'Image Picker',
 *   src: './src/asset-sources/image-picker.tsx',
 * })
 * ```
 * @param config The asset source view configuration
 * @public
 * @beta Deploying Applications via Blueprints is experimental. This may be subject to breaking changes.
 * @category Definers
 * @expandType BlueprintAssetSourceViewConfig
 * @returns The asset source view declaration
 * @hidden
 */
export function defineAssetSourceView(config: Omit<BlueprintAssetSourceViewConfig, 'surface' | 'type'>): BlueprintAssetSourceViewConfig {
  const view: BlueprintAssetSourceViewConfig = {...config, surface: 'asset-source', type: 'view'}
  runValidation(() => validateAssetSourceView(view))
  return view
}

/**
 * Defines a tile view — docks on the dashboard with a footprint `size`.
 *
 * ```ts
 * defineTileView({
 *   name: 'jump-back-in',
 *   title: 'Main Tile',
 *   src: './src/tiles/jump-back-in.tsx',
 *   size: 'banner',
 * })
 * ```
 * @param config The tile view configuration
 * @public
 * @beta Deploying Applications via Blueprints is experimental. This may be subject to breaking changes.
 * @category Definers
 * @expandType BlueprintTileViewConfig
 * @returns The tile view declaration
 * @hidden
 */
export function defineTileView(config: Omit<BlueprintTileViewConfig, 'surface' | 'type'>): BlueprintTileViewConfig {
  const view: BlueprintTileViewConfig = {...config, surface: 'tile', type: 'view'}
  runValidation(() => validateTileView(view))
  return view
}

/**
 * Defines a background web worker an application runs.
 *
 * ```ts
 * defineWebWorker({
 *   name: 'background-refresh',
 *   title: 'Background Worker',
 *   src: './src/workers/background-refresh.ts',
 * })
 * ```
 * @param config The web worker configuration
 * @public
 * @beta Deploying Applications via Blueprints is experimental. This may be subject to breaking changes.
 * @category Definers
 * @expandType BlueprintWebWorkerConfig
 * @returns The web worker declaration
 * @hidden
 */
export function defineWebWorker(config: BlueprintWebWorkerConfig): BlueprintWebWorker {
  const worker: BlueprintWebWorker = {...config, type: 'worker'}
  runValidation(() => validateWebWorker(worker))
  return worker
}

/**
 * Defines an application.
 *
 * @remarks
 * Views are authored in `views` and web workers in `webWorkers`, mirroring the
 * emitted resource. Views are discriminated by `surface` (`window`, `panel`,
 * `asset-source`, `tile`) and transformed to the emitted view `type` the
 * backend expects. The `slug` defaults to the resource `name`.
 *
 * ```ts
 * defineApplication({
 *   name: 'design-retro',
 *   title: 'Design Retro',
 *   views: [
 *     defineWindowView({name: 'main', title: 'Design Retro', src: './src/windows/main.tsx'}),
 *   ],
 * })
 * ```
 *
 * @example With views and web workers
 * ```ts
 * defineApplication({
 *   name: 'design-retro',
 *   title: 'Design Retro',
 *   slug: 'design-retro',
 *   icon: './src/icons/app-icon.svg',
 *   visibility: 'unlisted',
 *   views: [
 *     defineWindowView({
 *       name: 'main',
 *       title: 'Design Retro',
 *       src: './src/windows/main.tsx',
 *       dock: {group: 'applications', order: 10},
 *     }),
 *     definePanelView({name: 'side', title: 'Favorites', src: './src/panels/main.tsx'}),
 *     defineAssetSourceView({name: 'image-picker', title: 'Image Picker', src: './src/asset-sources/image-picker.tsx'}),
 *     defineTileView({name: 'jump-back-in', title: 'Main Tile', src: './src/tiles/jump-back-in.tsx', size: 'banner'}),
 *   ],
 *   webWorkers: [
 *     defineWebWorker({name: 'background-refresh', title: 'Background Worker', src: './src/workers/background-refresh.ts'}),
 *   ],
 * })
 * ```
 * @param config The application configuration
 * @public
 * @beta Deploying Applications via Blueprints is experimental. This may be subject to breaking changes.
 * @category Definers
 * @expandType BlueprintApplicationConfig
 * @returns The application resource
 * @hidden
 */
export function defineApplication(config: BlueprintApplicationConfig): BlueprintApplicationResource {
  const {views, webWorkers, slug, ...rest} = config

  const applicationResource: BlueprintApplicationResource = {...rest, type: 'sanity.application', slug: slug ?? rest.name}
  if (views && views.length > 0) applicationResource.views = views.map(viewConfigToResource)
  if (webWorkers && webWorkers.length > 0) applicationResource.webWorkers = webWorkers

  // Validate the authored (surface-discriminated) views, which the resource
  // stores transformed to their emitted `type`; everything else is validated as-is.
  runValidation(() => validateApplication(views && views.length > 0 ? {...applicationResource, views} : applicationResource))

  return applicationResource
}
