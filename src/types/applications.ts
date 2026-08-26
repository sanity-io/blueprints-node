import type {ApplicationVisibility, BlueprintResource} from '../index.js'

/**
 * The set of valid tile footprint families.
 *
 * Modelled on widget families rather than a linear scale: `banner` is
 * full-width and shallow, which a `small` → `large` magnitude can't express.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export const APPLICATION_TILE_SIZES = ['small', 'large', 'banner'] as const

/**
 * The footprint family a tile view occupies on the dashboard.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export type ApplicationTileSize = (typeof APPLICATION_TILE_SIZES)[number]

/**
 * The set of surfaces a view can target within the Dashboard/Workbench.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export const APPLICATION_VIEW_SURFACES = ['window', 'panel', 'asset-source', 'tile'] as const

/**
 * The surface a view targets. Used as the discriminator on view configs; the
 * definers transform it to the emitted view `type` the backend expects.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export type ApplicationViewSurface = (typeof APPLICATION_VIEW_SURFACES)[number]

/**
 * Dock placement for a window view.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 * @hidden
 */
export interface BlueprintApplicationDock {
  /**
   * The dock group the window or panel view is placed into.
   */
  group?: 'system' | 'applications' | 'user'

  /** Sort position within the group, ascending. */
  order?: number
}

/**
 * Fields shared by every view an application exposes.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export interface BlueprintApplicationViewBase {
  /** Unique within the application. Must match `^[a-zA-Z0-9_-]+$`. */
  name: string

  /** Human-readable title for the view. */
  title: string

  /** The relative location of the view source code. */
  src: string
}

/**
 * A window view — the navigable, full-page view of an application.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export interface BlueprintWindowView extends BlueprintApplicationViewBase {
  type: 'app'

  /** Dock placement for the window view. */
  dock?: BlueprintApplicationDock
}

/**
 * A panel view — renders in the dock.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export interface BlueprintPanelView extends BlueprintApplicationViewBase {
  type: 'panel'

  /** Dock placement for the panel view. */
  dock?: BlueprintApplicationDock
}

/**
 * An asset source view — contributes an asset source.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export interface BlueprintAssetSourceView extends BlueprintApplicationViewBase {
  type: 'asset_source'
}

/**
 * A tile view — docks on the dashboard with a footprint `size`.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export interface BlueprintTileView extends BlueprintApplicationViewBase {
  type: 'tile'

  /** The footprint family the dashboard lays the tile out by. */
  size: ApplicationTileSize

  /** Sort position within its layout track, ascending. */
  order?: number
}

/**
 * A background web worker an application runs.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export interface BlueprintWebWorker extends BlueprintApplicationViewBase {
  type: 'worker'
}

/**
 * A union of all view declarations an application can expose.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 * @hidden
 */
export type BlueprintApplicationView = BlueprintWindowView | BlueprintPanelView | BlueprintAssetSourceView | BlueprintTileView

/**
 * A union of everything an application declares in its `resources` array.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export type BlueprintApplicationChild = BlueprintApplicationView | BlueprintWebWorker

/**
 * Represents an Application resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export interface BlueprintApplicationResource extends BlueprintResource {
  type: 'sanity.application'

  /** The slug to be used in the application hostname. Must match `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`. */
  slug: string

  /** User-facing title for the application. */
  title: string

  /** Icon for the application (path to an SVG). */
  icon?: string

  /** Dashboard visibility. */
  visibility?: ApplicationVisibility

  /** The window, panel, asset source, and tile views the application exposes. */
  views?: BlueprintApplicationView[]

  /** The background web workers the application runs. */
  webWorkers?: BlueprintWebWorker[]
}

export interface BlueprintViewConfigBase {
  type: 'view'
}

/**
 * Configuration for a window view.
 *
 * @remarks
 * Discriminated by `surface`. The definer transforms `surface: 'window'` to the
 * emitted view `type: 'app'`.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 * @hidden
 */
export type BlueprintWindowViewConfig = Omit<BlueprintWindowView, 'type'> &
  BlueprintViewConfigBase & {
    /** The surface the view targets. */
    surface: 'window'
  }

/**
 * Configuration for a panel view.
 *
 * @remarks
 * Discriminated by `surface`. The definer transforms `surface: 'panel'` to the
 * emitted view `type: 'panel'`.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 * @hidden
 */
export type BlueprintPanelViewConfig = Omit<BlueprintPanelView, 'type'> &
  BlueprintViewConfigBase & {
    /** The surface the view targets. */
    surface: 'panel'
  }

/**
 * Configuration for an asset source view.
 *
 * @remarks
 * Discriminated by `surface`. The definer transforms `surface: 'asset-source'`
 * to the emitted view `type: 'asset_source'`.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 * @hidden
 */
export type BlueprintAssetSourceViewConfig = Omit<BlueprintAssetSourceView, 'type'> &
  BlueprintViewConfigBase & {
    /** The surface the view targets. */
    surface: 'asset-source'
  }

/**
 * Configuration for a tile view.
 *
 * @remarks
 * Discriminated by `surface`. The definer transforms `surface: 'tile'` to the
 * emitted view `type: 'tile'`.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 * @hidden
 */
export type BlueprintTileViewConfig = Omit<BlueprintTileView, 'type'> &
  BlueprintViewConfigBase & {
    /** The surface the view targets. */
    surface: 'tile'
  }

/**
 * Configuration for a web worker.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 * @hidden
 */
export type BlueprintWebWorkerConfig = Omit<BlueprintWebWorker, 'type'>

/**
 * A union of all view configs an application can declare, discriminated by `surface`.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @expand
 * @hidden
 */
export type BlueprintApplicationViewConfig =
  | BlueprintWindowViewConfig
  | BlueprintPanelViewConfig
  | BlueprintAssetSourceViewConfig
  | BlueprintTileViewConfig

/**
 * A union of everything an application can declare in its `resources` array.
 *
 * @remarks
 * Views are discriminated by `surface`; web workers by `type: 'worker'`.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @hidden
 */
export type BlueprintApplicationChildConfig = BlueprintApplicationViewConfig | BlueprintWebWorker

/**
 * Configuration for an Application resource.
 * @beta This feature is subject to breaking changes.
 * @category Resource Types
 * @interface
 * @hidden
 */
export type BlueprintApplicationConfig = Omit<BlueprintApplicationResource, 'type' | 'name' | 'slug' | 'views' | 'webWorkers'> & {
  /**
   * The name of the resource. Unique within the blueprint.
   *
   * Defaults to the `slug`.
   */
  name?: string

  /** The slug to be used in the application hostname. Must match `^[a-z0-9]([a-z0-9-]*[a-z0-9])?$`. */
  slug: string

  /**
   * The views and web workers the application declares.
   *
   * Window, panel, asset source, and tile views are collected into `views`;
   * web workers are collected into `webWorkers`.
   */
  resources?: BlueprintApplicationChildConfig[]
}
