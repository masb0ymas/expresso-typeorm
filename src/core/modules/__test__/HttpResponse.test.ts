import { describe, expect, test } from '@jest/globals'
import HttpResponse from "../response/HttpResponse"

describe('Http Response', () => {
  test('should http GET', () => {
    const result = HttpResponse.get({}, { lang: 'id' })

    expect(result.statusCode).toBe(200)
    expect(result.message).toBe('success.data_received')
  })

  test('should http POST', () => {
    const result = HttpResponse.created({}, { lang: 'id' })

    expect(result.statusCode).toBe(201)
    expect(result.message).toBe('success.data_added')
  })

  test('should http PUT', () => {
    const result = HttpResponse.updated({}, { lang: 'id' })

    expect(result.statusCode).toBe(200)
    expect(result.message).toBe('success.data_updated')
  })

  test('should http DELETE', () => {
    const result = HttpResponse.deleted({}, { lang: 'id' })

    expect(result.statusCode).toBe(200)
    expect(result.message).toBe('success.data_deleted')
  })
})
