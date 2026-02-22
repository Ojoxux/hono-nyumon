import { describe, it, expect, afterAll } from 'vitest'
import app from '../src/app.js'

import { client, db } from '../src/db/client.js'
import { todoLists } from '../src/db/schema.js'
import { eq } from 'drizzle-orm'

describe('Station 07 - TODO リスト取得 API を作成しよう', () => {
  it('GET /lists/:id should return the created todo list', async () => {
    const inserted = await db
      .insert(todoLists)
      .values({
        title: 'テスト用Todoリスト（Station07）',
        description: 'Station07 GET /lists/:id のテスト用データ',
      })
      .returning({ id: todoLists.id })

    const id = inserted[0]?.id
    expect(id).toEqual(expect.any(Number))

    const res = await app.request(`/lists/${id}`)
    expect(res.status).toBe(200)

    const contentType = res.headers.get('content-type') ?? ''
    expect(contentType).toContain('application/json')

    const body = await res.json()
    expect(body).toEqual({
      id,
      title: 'テスト用Todoリスト（Station07）',
      description: 'Station07 GET /lists/:id のテスト用データ',
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })

    await db.delete(todoLists).where(eq(todoLists.id, id))
  })

  afterAll(async () => {
    await client.end()
  })
})
