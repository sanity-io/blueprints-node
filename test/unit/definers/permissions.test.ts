import {afterEach, describe, expect, test, vi} from 'vitest'
import * as permissions from '../../../src/definers/permissions.js'
import * as index from '../../../src/index.js'
import {defineBlueprintForResource} from '../../helpers/index.js'

const articlesOnly = {
  name: 'articles-only',
  permissionType: 'sanity.document.filter.mode',
  config: {filter: '_type == "article"'},
} as const

describe('definePermission', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should throw an error if validatePermission returns an error', () => {
    const spy = vi.spyOn(index, 'validatePermission').mockImplementation(() => [{type: 'test', message: 'this is a test'}])
    expect(() => defineBlueprintForResource(permissions.definePermission(articlesOnly))).toThrow(/this is a test/)

    expect(spy).toHaveBeenCalledOnce()
  })

  test('should accept a valid configuration and set the type', () => {
    const permissionResource = permissions.definePermission(articlesOnly)

    expect(permissionResource).toStrictEqual({
      name: 'articles-only',
      type: 'sanity.access.permission',
      permissionType: 'sanity.document.filter.mode',
      config: {filter: '_type == "article"'},
    })
  })

  test('should keep all options', () => {
    const permissionResource = permissions.definePermission({
      name: 'articles-only',
      title: 'Articles only',
      description: 'Access to article documents',
      permissionType: 'sanity.document.filter',
      config: {filter: '_type == "article"'},
      project: '$.resources.my-project.id',
      lifecycle: {
        deletionPolicy: 'retain',
      },
    })

    expect(permissionResource).toStrictEqual({
      name: 'articles-only',
      type: 'sanity.access.permission',
      title: 'Articles only',
      description: 'Access to article documents',
      permissionType: 'sanity.document.filter',
      config: {filter: '_type == "article"'},
      project: '$.resources.my-project.id',
      lifecycle: {
        deletionPolicy: 'retain',
      },
    })
  })

  test('should accept a valid configuration with an attach lifecycle', () => {
    const permissionResource = permissions.definePermission({
      ...articlesOnly,
      lifecycle: {
        ownershipAction: {
          type: 'attach',
          projectId: 'test-project',
          id: 'articles-only',
        },
      },
    })

    if (permissionResource.lifecycle?.ownershipAction?.type !== 'attach') {
      throw new Error('expected ownershipAction with type attach')
    }
    expect(permissionResource.lifecycle?.ownershipAction?.projectId).toStrictEqual('test-project')
  })
})

describe('defineContentResource', () => {
  afterEach(() => {
    vi.resetAllMocks()
  })

  test('should define a sanity.document.filter.mode permission', () => {
    expect(permissions.defineContentResource({name: 'movies', documentTypes: ['movie']})).toStrictEqual({
      name: 'movies',
      type: 'sanity.access.permission',
      permissionType: 'sanity.document.filter.mode',
      config: {filter: '_type == "movie"'},
    })
  })

  const filters: [string, Partial<index.BlueprintContentResourceConfig>, string][] = [
    ['several document types', {documentTypes: ['movie', 'person']}, '_type in ["movie", "person"]'],
    ['a filter', {filter: 'year > 2000'}, 'year > 2000'],
    ['an empty documentTypes and a filter', {documentTypes: [], filter: 'year > 2000'}, 'year > 2000'],
    ['document types and a filter', {documentTypes: ['movie'], filter: 'a || b'}, '_type == "movie" && (a || b)'],
  ]

  for (const [label, input, filter] of filters) {
    test(`should build the filter from ${label}`, () => {
      expect(permissions.defineContentResource({name: 'movies', ...input}).config.filter).toBe(filter)
    })
  }

  test('should keep the permission options', () => {
    const permissionResource = permissions.defineContentResource({
      name: 'movies',
      title: 'Movies',
      description: 'Movie documents',
      documentTypes: ['movie'],
      project: '$.resources.my-project.id',
      lifecycle: {
        deletionPolicy: 'retain',
      },
    })

    expect(permissionResource).toStrictEqual({
      name: 'movies',
      type: 'sanity.access.permission',
      title: 'Movies',
      description: 'Movie documents',
      permissionType: 'sanity.document.filter.mode',
      config: {filter: '_type == "movie"'},
      project: '$.resources.my-project.id',
      lifecycle: {
        deletionPolicy: 'retain',
      },
    })
  })

  test('should validate the content resource and the permission', () => {
    const contentSpy = vi.spyOn(index, 'validateContentResource').mockImplementation(() => [{type: 'test', message: 'content error'}])
    const permissionSpy = vi.spyOn(index, 'validatePermission')

    expect(() => defineBlueprintForResource(permissions.defineContentResource({name: 'movies', documentTypes: ['movie']}))).toThrow(
      /content error/,
    )
    expect(contentSpy).toHaveBeenCalledOnce()
    expect(permissionSpy).toHaveBeenCalledOnce()
  })

  test('should require document types or a filter', () => {
    expect(() => defineBlueprintForResource(permissions.defineContentResource({name: 'movies'}))).toThrow(/Permission filter is required/)
  })
})

describe('grantContentResource', () => {
  const movies = permissions.defineContentResource({name: 'movies', documentTypes: ['movie']})

  test('should grant a mode on all datasets', () => {
    expect(permissions.grantContentResource(movies, 'publish')).toStrictEqual({
      name: '$.resources.movies',
      action: 'mode',
      params: {mode: 'publish'},
    })
  })

  test('should grant a mode on one dataset', () => {
    expect(permissions.grantContentResource(movies, 'read', {dataset: 'staging'})).toStrictEqual({
      name: '$.resources.movies',
      action: 'mode',
      params: {mode: 'read', dataset: 'staging'},
    })
  })

  test('should grant a mode on one dataset tag', () => {
    expect(permissions.grantContentResource(movies, 'create', {tagName: 'drafts'})).toStrictEqual({
      name: '$.resources.movies',
      action: 'mode',
      params: {mode: 'create', tagName: 'drafts'},
    })
  })

  test('should require a sanity.document.filter.mode permission', () => {
    const articles = permissions.definePermission({...articlesOnly, permissionType: 'sanity.document.filter'})
    permissions.grantContentResource(articles, 'read')

    expect(() => defineBlueprintForResource(articles)).toThrow(/must have the permissionType `sanity.document.filter.mode`/)
  })
})
