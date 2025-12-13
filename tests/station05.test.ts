import { describe, it, expect } from 'vitest'
import app from '../src/app.js'

describe('Station 05 - API の定義を追加してみよう', () => {
  it('GET /health should return {"status":"ok"}', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)

    const contentType = res.headers.get('content-type') ?? ''
    expect(contentType).toContain('application/json')

    const body = await res.json()
    expect(body).toEqual({ status: 'ok' })
  })
})
