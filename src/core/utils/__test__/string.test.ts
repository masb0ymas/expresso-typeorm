import { describe, expect, test } from '@jest/globals'
import { capitalizeFirstLetter } from '../string'

describe('capitalizeFirstLetter', () => {
  test('capitalizes first letter of each word and removes special characters', () => {
    expect(capitalizeFirstLetter('hello world')).toBe('Hello World')
    expect(capitalizeFirstLetter('hello-world')).toBe('Hello World')
    expect(capitalizeFirstLetter('hello_world')).toBe('Hello World')
    expect(capitalizeFirstLetter('hello@world')).toBe('Hello World')
    expect(capitalizeFirstLetter('HELLO WORLD')).toBe('Hello World')
    expect(capitalizeFirstLetter('hello   world')).toBe('Hello World')
    expect(capitalizeFirstLetter('hello!!!world')).toBe('Hello World')
    expect(capitalizeFirstLetter('123hello world')).toBe('123hello World')
    expect(capitalizeFirstLetter('')).toBe('')
  })
})
