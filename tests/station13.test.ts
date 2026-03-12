import { describe, it, expect, afterAll } from 'vitest'
import app from '../src/app.js'

import { client, db } from '../src/db/client.js'
import { todoItems, todoLists } from '../src/db/schema.js'
import { eq } from 'drizzle-orm'

describe('Station 13 - TODO 項目更新 API を作成しよう', () => {
  afterAll(async () => {
    await client.end()
  })

  it('PATCH /lists/:listId/items/:itemId should update an existing todo item', async () => {
    // 1) list 作成
    const [list] = await db
      .insert(todoLists)
      .values({
        title: 'テスト用Todoリスト（Station13）',
        description: 'Station13 のテスト用リスト',
      })
      .returning({ id: todoLists.id })

    const listId = list.id

    // 2) item 作成（更新前）
    const beforeDueAt = new Date('2026-01-01T00:00:00.000Z')
    const [item] = await db
      .insert(todoItems)
      .values({
        todoListId: listId,
        title: 'before title',
        description: 'before description',
        statusCode: 1,
        dueAt: beforeDueAt,
      })
      .returning({ id: todoItems.id })

    const itemId = item.id

    const updateBody = {
      title: 'after title',
      description: 'after description',
      due_at: '2026-01-10T06:30:13.196Z',
      complete: true,
    }

    try {
      // 3) 更新 API
      const res = await app.request(`/lists/${listId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateBody),
      })

      expect(res.status).toBe(200)

      const contentType = res.headers.get('content-type') ?? ''
      expect(contentType).toContain('application/json')

      const body = await res.json()

      expect(body).toEqual({
        id: itemId,
        todo_list_id: listId,
        title: updateBody.title,
        description: updateBody.description,
        status_code: 2,
        due_at: updateBody.due_at,
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })

      // 4) DB も更新されていること
      const rows = await db.select().from(todoItems).where(eq(todoItems.id, itemId))
      expect(rows).toHaveLength(1)
      expect(rows[0].todoListId).toBe(listId)
      expect(rows[0].title).toBe(updateBody.title)
      expect(rows[0].description ?? '').toBe(updateBody.description)
      expect(rows[0].statusCode).toBe(2)
      expect(rows[0].dueAt?.toISOString()).toBe(updateBody.due_at)
    } finally {
      // list 削除で item も cascade delete
      await db.delete(todoLists).where(eq(todoLists.id, listId))
    }
  })

  it('PATCH /lists/:listId/items/:itemId should map complete=false to status_code=1', async () => {
    const [list] = await db
      .insert(todoLists)
      .values({
        title: 'テスト用Todoリスト（Station13 complete=false）',
        description: 'Station13 complete=false のテスト用リスト',
      })
      .returning({ id: todoLists.id })

    const listId = list.id

    const [item] = await db
      .insert(todoItems)
      .values({
        todoListId: listId,
        title: 'before title',
        description: 'before description',
        statusCode: 2,
        dueAt: new Date('2026-01-01T00:00:00.000Z'),
      })
      .returning({ id: todoItems.id })

    const itemId = item.id

    try {
      const res = await app.request(`/lists/${listId}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complete: false }),
      })

      expect(res.status).toBe(200)

      const body = (await res.json()) as {
        status_code: number
      }

      expect(body.status_code).toBe(1)

      const rows = await db.select().from(todoItems).where(eq(todoItems.id, itemId))
      expect(rows).toHaveLength(1)
      expect(rows[0].statusCode).toBe(1)
    } finally {
      await db.delete(todoLists).where(eq(todoLists.id, listId))
    }
  })

  it('PATCH /lists/:listId/items/:itemId should return 404 when item is not in the list', async () => {
    // list を2つ作る
    const [listA] = await db
      .insert(todoLists)
      .values({ title: 'Station13 listA', description: 'A' })
      .returning({ id: todoLists.id })
    const [listB] = await db
      .insert(todoLists)
      .values({ title: 'Station13 listB', description: 'B' })
      .returning({ id: todoLists.id })

    const listIdA = listA.id
    const listIdB = listB.id

    // item は listA に作る
    const [item] = await db
      .insert(todoItems)
      .values({
        todoListId: listIdA,
        title: 'Station13 item',
        description: 'Station13 item desc',
        statusCode: 1,
      })
      .returning({ id: todoItems.id })

    const itemId = item.id

    try {
      const res = await app.request(`/lists/${listIdB}/items/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'should not update' }),
      })

      expect(res.status).toBe(404)
    } finally {
      await db.delete(todoLists).where(eq(todoLists.id, listIdA))
      await db.delete(todoLists).where(eq(todoLists.id, listIdB))
    }
  })
})
