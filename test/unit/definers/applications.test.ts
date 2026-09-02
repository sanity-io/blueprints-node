import {afterEach, describe, expect, test, vi} from 'vitest'
import * as applications from '../../../src/definers/applications.js'
import * as index from '../../../src/index.js'
import {defineBlueprintForResource} from '../../helpers/index.js'

vi.mock(import('../../../src/index.js'), async (importOriginal) => {
  const originalModule = await importOriginal()
  return {
    ...originalModule,
    validateBlueprint: vi.fn(() => []),
  }
})

describe('defineApplication', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if validateApplication returns an error', () => {
    const spy = vi.spyOn(index, 'validateApplication').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() =>
      defineBlueprintForResource(
        applications.defineApplication({
          name: 'design-retro',
          title: 'Design Retro',
        }),
      ),
    ).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration and set the type', () => {
    const applicationResource = applications.defineApplication({
      name: 'design-retro',
      title: 'Design Retro',
    })

    expect(applicationResource.type).toStrictEqual('sanity.application')
    expect(applicationResource.title).toStrictEqual('Design Retro')
  })

  test('should default the slug to the name', () => {
    const applicationResource = applications.defineApplication({
      name: 'design-retro',
      title: 'Design Retro',
    })

    expect(applicationResource.slug).toStrictEqual('design-retro')
  })

  test('should keep an explicit slug', () => {
    const applicationResource = applications.defineApplication({
      name: 'design-retro-app',
      slug: 'design-retro',
      title: 'Design Retro',
    })

    expect(applicationResource.slug).toStrictEqual('design-retro')
  })

  test('should collect views and webWorkers', () => {
    const applicationResource = applications.defineApplication({
      name: 'design-retro',
      title: 'Design Retro',
      views: [
        applications.defineWindowView({name: 'main', title: 'Design Retro', src: './src/windows/main.tsx'}),
        applications.definePanelView({name: 'side', title: 'Favorites', src: './src/panels/main.tsx'}),
        applications.defineAssetSourceView({name: 'image-picker', title: 'Image Picker', src: './src/asset-sources/image-picker.tsx'}),
        applications.defineTileView({name: 'jump-back-in', title: 'Main Tile', src: './src/tiles/jump-back-in.tsx', size: 'banner'}),
      ],
      webWorkers: [
        applications.defineWebWorker({name: 'background-refresh', title: 'Background Worker', src: './src/workers/background-refresh.ts'}),
      ],
    })

    expect(applicationResource.views).toHaveLength(4)
    expect(applicationResource.webWorkers).toHaveLength(1)
    expect(applicationResource.views?.map((view) => view.type)).toStrictEqual(['app', 'panel', 'asset_source', 'tile'])
    expect(applicationResource.views?.every((view) => !('surface' in view))).toBe(true)
    expect(applicationResource.webWorkers?.[0]?.name).toStrictEqual('background-refresh')
  })

  test('should accept raw surface-discriminated view configs', () => {
    const applicationResource = applications.defineApplication({
      name: 'design-retro',
      title: 'Design Retro',
      views: [
        {type: 'view', surface: 'window', name: 'main', title: 'Design Retro', src: './src/windows/main.tsx'},
        {type: 'view', surface: 'tile', name: 'jump-back-in', title: 'Main Tile', src: './src/tiles/jump-back-in.tsx', size: 'banner'},
      ],
    })

    expect(applicationResource.views?.map((view) => view.type)).toStrictEqual(['app', 'tile'])
    expect(applicationResource.views?.every((view) => !('surface' in view))).toBe(true)
  })

  test('should allow multiple window views', () => {
    const applicationResource = applications.defineApplication({
      name: 'design-retro',
      title: 'Design Retro',
      views: [
        applications.defineWindowView({name: 'main', title: 'Main', src: './src/windows/main.tsx'}),
        applications.defineWindowView({name: 'secondary', title: 'Secondary', src: './src/windows/secondary.tsx'}),
      ],
    })

    expect(applicationResource.views?.filter((view) => view.type === 'app')).toHaveLength(2)
  })

  test('should omit views and webWorkers when none are provided', () => {
    const applicationResource = applications.defineApplication({
      name: 'design-retro',
      title: 'Design Retro',
    })

    expect(applicationResource.views).toBeUndefined()
    expect(applicationResource.webWorkers).toBeUndefined()
  })

  test('should produce a valid resource from a minimal config', () => {
    const applicationResource = applications.defineApplication({
      name: 'design-retro',
      title: 'Design Retro',
    })

    expect(index.validateApplication(applicationResource)).toStrictEqual([])
  })

  test('should accept a valid configuration with a lifecycle', () => {
    const applicationResource = applications.defineApplication({
      name: 'design-retro',
      title: 'Design Retro',
      lifecycle: {
        deletionPolicy: 'allow',
      },
    })

    expect(applicationResource.lifecycle?.deletionPolicy).toStrictEqual('allow')
  })
})

describe('view definers', () => {
  test('defineWindowView sets the surface to window and keeps dock', () => {
    const view = applications.defineWindowView({
      name: 'main',
      title: 'Design Retro',
      src: './src/windows/main.tsx',
      dock: {group: 'applications', order: 10},
    })

    expect(view.surface).toStrictEqual('window')
    expect(view.dock).toStrictEqual({group: 'applications', order: 10})
  })

  test('definePanelView sets the surface to panel', () => {
    const view = applications.definePanelView({name: 'side', title: 'Favorites', src: './src/panels/main.tsx'})
    expect(view.surface).toStrictEqual('panel')
  })

  test('defineAssetSourceView sets the surface to asset-source', () => {
    const view = applications.defineAssetSourceView({
      name: 'image-picker',
      title: 'Image Picker',
      src: './src/asset-sources/image-picker.tsx',
    })
    expect(view.surface).toStrictEqual('asset-source')
  })

  test('defineTileView sets the surface to tile and keeps size', () => {
    const view = applications.defineTileView({
      name: 'jump-back-in',
      title: 'Main Tile',
      src: './src/tiles/jump-back-in.tsx',
      size: 'banner',
    })
    expect(view.surface).toStrictEqual('tile')
    expect(view.size).toStrictEqual('banner')
  })

  test('defineWebWorker sets the type to worker', () => {
    const worker = applications.defineWebWorker({
      name: 'background-refresh',
      title: 'Background Worker',
      src: './src/workers/background-refresh.ts',
    })
    expect(worker.type).toStrictEqual('worker')
  })
})
