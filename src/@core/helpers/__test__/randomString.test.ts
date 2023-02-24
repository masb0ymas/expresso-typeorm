import { describe, expect, test } from '@jest/globals'
import { getRandom } from '../randomString'

describe('helpers random string', () => {
  test('should random alphabetic', () => {
    const result = getRandom({ type: 'alphabetic' })

    expect(result).toHaveLength(32)
  })

  test('should random alphabetic with custom length', () => {
    const result = getRandom({ type: 'alphabetic', length: 10 })

    expect(result).toHaveLength(10)
  })

  test('should random numeric', () => {
    const result = getRandom({ type: 'numeric' })

    expect(result).toHaveLength(6)
  })
})
