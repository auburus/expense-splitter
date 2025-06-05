import { unevenSplit } from './utils.ts'
import { expect, test } from 'vitest'

test('split', () => {
  // Use sort(), because we don't fundamentally care about who gets the cent
  expect(unevenSplit(5, 2).sort()).toEqual([2.5, 2.5])
  expect(unevenSplit(10, 3).sort()).toEqual([3.33, 3.33, 3.34])
  expect(unevenSplit(5, 3).sort()).toEqual([1.66, 1.67, 1.67])
  expect(unevenSplit(0, 4).sort()).toEqual([0, 0, 0, 0])
  expect(unevenSplit(0.01, 4).sort()).toEqual([0, 0, 0, 0.01])
})
