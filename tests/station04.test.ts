import { describe, it, expect } from 'vitest'
import app from '../src/app.js'

describe('Station 04 - API の定義を変更してみよう', () => {
  it('GET /echo?message=hello&name=techtrain should return {"Message":"hello techtrain!"}', async () => {
    const res = await app.request('/echo?message=hello&name=techtrain')
    expect(res.status).toBe(200)

    const contentType = res.headers.get('content-type') ?? ''
    expect(contentType).toContain('application/json')

    const body = await res.json()
    expect(body).toEqual({ Message: 'hello techtrain!' })
  })

  it('GET /echo?message=Hi&name=World should return {"Message":"Hi World!"}', async () => {
    const res = await app.request('/echo?message=Hi&name=World')
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body).toEqual({ Message: 'Hi World!' })
  })
})
