import { describe, expect, test } from '@jest/globals'
import { capitalizeFirstLetter } from '../formatter'

describe('should be formatter test', () => {
  test('should capitalize first letter', () => {
    const anyValue = 'hello world'
    const result = capitalizeFirstLetter(anyValue)

    expect(result).toBe('Hello World')
  })
})
