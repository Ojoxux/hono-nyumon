import { describe, it, expect, afterAll } from 'vitest'
import app from '../src/app.js'

import { client, db } from '../src/db/client.js'
import { todoItems, todoLists } from '../src/db/schema.js'
import { eq } from 'drizzle-orm'

describe('Station 12 - TODO 項目作成 API を作成しよう', () => {
  afterAll(async () => {
    await client.end()
  })

  it('POST /lists/:listId/items should create a new todo item', async () => {
    // 1) list を作成
    const [list] = await db
      .insert(todoLists)
      .values({
        title: 'テスト用Todoリスト（Station12）',
        description: 'Station12 のテスト用リスト',
      })
      .returning({ id: todoLists.id })

    const listId = list.id

    const newItem = {
      title: '牛乳を買う（Station12）',
      description: 'スーパーで牛乳を買う（Station12）',
      due_at: '2026-01-10T06:30:13.196Z',
    }

    try {
      // 2) API を叩いて作成
      const res = await app.request(`/lists/${listId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      })

      expect(res.status).toBe(201)

      const contentType = res.headers.get('content-type') ?? ''
      expect(contentType).toContain('application/json')

      const body = (await res.json()) as {
        id: number
        todo_list_id: number
        title: string
        description: string
        status_code: number
        due_at: string
        created_at: string
        updated_at: string
      }

      expect(body).toEqual({
        id: expect.any(Number),
        todo_list_id: listId,
        title: newItem.title,
        description: newItem.description,
        status_code: 1,
        due_at: newItem.due_at,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })

      // 3) DB に作成されていることを確認
      const rows = await db.select().from(todoItems).where(eq(todoItems.id, body.id))
      expect(rows).toHaveLength(1)
      expect(rows[0].todoListId).toBe(listId)
      expect(rows[0].title).toBe(newItem.title)
      expect(rows[0].description ?? '').toBe(newItem.description)
      expect(rows[0].statusCode).toBe(1)
      expect(rows[0].dueAt?.toISOString()).toBe(newItem.due_at)
    } finally {
      // list 削除で item も cascade delete
      await db.delete(todoLists).where(eq(todoLists.id, listId))
    }
  })

  it('POST /lists/:listId/items should return 404 when todo list does not exist', async () => {
    const res = await app.request('/lists/999999/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'dummy',
        description: 'dummy',
        due_at: '2026-01-10T06:30:13.196Z',
      }),
    })

    expect(res.status).toBe(404)
  })
})
