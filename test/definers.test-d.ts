import {describe, expectTypeOf, test} from 'vitest'
import {defineDocumentFunction, defineMediaLibraryAssetFunction} from '../src'

describe('defineDocumentFunction', () => {
  test('argument types', () => {
    // can provide no arguments (not entirely true: at runtime this will throw since no name provided; we can fix this by tweaking function type signature, tho.
    expectTypeOf(defineDocumentFunction).parameter(0).toEqualTypeOf({})
  })
})

// TODO: implement type tests for backwards compatibility enforcement, but need more opinions / input from team
