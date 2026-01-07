import { describe, it, expect } from 'vitest'
import app from '../src/app.js'

describe('Station 07 - TODO リスト取得 API を作成しよう', () => {
  it('GET /lists/1 should return the todo list with id 1', async () => {
    const res = await app.request('/lists/1')
    expect(res.status).toBe(200)

    const contentType = res.headers.get('content-type') ?? ''
    expect(contentType).toContain('application/json')

    const body = await res.json()
    expect(body).toEqual({
      id: 1,
      title: '最初のTodoリスト',
      description: '最初のTodoリストです',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    })
  })
})
