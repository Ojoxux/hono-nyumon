import { describe, it, expect } from 'vitest'
import app from '../src/app.js'

describe('Station 01 - Hello World API', () => {
  it('GET /hello should return {"Message":"Hello Hono!"}', async () => {
    const res = await app.request('/hello')
    expect(res.status).toBe(200)

    const contentType = res.headers.get('content-type') ?? ''
    expect(contentType).toContain('application/json')

    const body = await res.json()
    expect(body).toEqual({ Message: 'Hello Hono!' })
  })
})
