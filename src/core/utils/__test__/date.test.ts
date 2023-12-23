import { describe, expect, test } from '@jest/globals'
import { formatDate } from '../date'

describe('should be date test', () => {
  test(`should format a valid date string to 'dd-MM-yyyy' format`, () => {
    const result = formatDate('2022-01-01')
    expect(result).toBe('01-01-2022')
  })
})
