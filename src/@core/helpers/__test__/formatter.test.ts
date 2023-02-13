import { describe, test, expect } from '@jest/globals'
import {
  arrayFormatter,
  logErrServer,
  logServer,
  validateBoolean,
  validateEmpty,
  validateNumber,
  validateUUID,
} from '../formatter'

describe('helpers formatter test', () => {
  test('should array formatter test from json parse', () => {
    const anyValue = '["any_1", "any_2"]'
    const expectValue = ['any_1', 'any_2']

    const data = arrayFormatter(anyValue)

    expect(data).toStrictEqual(expectValue)
  })

  test('should array formatter from array data', () => {
    const anyValue = ['any_1', 'any_2']
    const expectValue = ['any_1', 'any_2']

    const data = arrayFormatter(anyValue)

    expect(data).toStrictEqual(expectValue)
  })

  test('should validate empty value toBe NULL', () => {
    const anyValue = null

    const data = validateEmpty(anyValue)

    expect(data).toBe(anyValue)
  })

  test('should validate empty value', () => {
    const anyValue = 'anyValue'

    const data = validateEmpty(anyValue)

    expect(data).toBe(anyValue)
  })

  test('should validate boolean', () => {
    const anyValue = 'true'

    const data = validateBoolean(anyValue)

    expect(data).toBe(true)
  })

  test('should validate boolean with wrong value', () => {
    const anyValue = null

    const data = validateBoolean(anyValue)

    expect(data).toBe(false)
  })

  test('should validate uuid with wrong value', () => {
    const anyValue = 'anyUUIDValue'
    const expectValue = 'incorrect uuid format'

    expect(() => validateUUID(anyValue)).toThrow(expectValue)
  })

  test('should validate uuid', () => {
    const anyValue = '718f7287-1eae-431c-a532-873fd2080799'

    const data = validateUUID(anyValue)

    expect(data).toBe(anyValue)
  })

  test('should validate number with wrong value', () => {
    const anyValue = NaN

    const data = validateNumber(anyValue)

    expect(data).toBe(0)
  })

  test('should validate number', () => {
    const anyValue = '27'

    const data = validateNumber(anyValue)

    expect(data).toBe(27)
  })

  test('should log server format', () => {
    const expectValue = `\x1B[32m[server]:\x1B[39m \x1B[34manyType\x1B[39m \x1B[32manyMessage\x1B[39m`

    const data = logServer('anyType', 'anyMessage')

    expect(data).toBe(expectValue)
  })

  test('should log error server format', () => {
    const expectValue = `\x1B[32m[server]:\x1B[39m \x1B[31manyType\x1B[39m \x1B[32manyMessage\x1B[39m`

    const data = logErrServer('anyType', 'anyMessage')

    expect(data).toBe(expectValue)
  })
})
