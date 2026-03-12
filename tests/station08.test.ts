import { describe, it, expect, afterAll } from 'vitest'
import app from '../src/app.js'

import { client, db } from '../src/db/client.js'
import { todoLists } from '../src/db/schema.js'
import { eq } from 'drizzle-orm'

describe('Station 08 - TODO リスト作成 API を作成しよう', () => {
  it('POST /lists should create a new todo list', async () => {
    const newList = {
      title: '新しいTodoリスト',
      description: 'これは新しいTodoリストです',
    }

    const res = await app.request('/lists', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newList),
    })

    expect(res.status).toBe(200)

    const contentType = res.headers.get('content-type') ?? ''
    expect(contentType).toContain('application/json')

    const body = (await res.json()) as { id: number }

    expect(body).toEqual({
      id: expect.any(Number),
      title: newList.title,
      description: newList.description,
      created_at: expect.any(String),
      updated_at: expect.any(String),
    })

    await db.delete(todoLists).where(eq(todoLists.id, body.id))
  })

  afterAll(async () => {
    await client.end()
  })
})
