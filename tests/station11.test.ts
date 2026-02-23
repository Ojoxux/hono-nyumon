import { describe, it, expect, afterAll } from 'vitest'
import app from '../src/app.js'

import { client, db } from '../src/db/client.js'
import { todoItems, todoLists } from '../src/db/schema.js'
import { eq } from 'drizzle-orm'

describe('Station 11 - TODO 項目取得 API を作成しよう', () => {
  afterAll(async () => {
    await client.end()
  })

  it('GET /lists/:listId/items/:itemId should return the created todo item', async () => {
    // 1) list を作成
    const [list] = await db
      .insert(todoLists)
      .values({
        title: 'テスト用Todoリスト（Station11）',
        description: 'Station11 のテスト用リスト',
      })
      .returning({ id: todoLists.id })

    const listId = list?.id
    expect(listId).toBeTypeOf('number')

    // 2) item を作成（dueAt は固定値にしてレスポンス一致を確認）
    const dueAt = new Date('2026-01-10T06:30:13.196Z')

    const [item] = await db
      .insert(todoItems)
      .values({
        todoListId: listId,
        title: '牛乳を買う（Station11）',
        description: 'スーパーで牛乳を買う（Station11）',
        statusCode: 1,
        dueAt,
      })
      .returning({ id: todoItems.id })

    const itemId = item?.id
    expect(itemId).toBeTypeOf('number')

    try {
      // 3) API を叩いて取得
      const res = await app.request(`/lists/${listId}/items/${itemId}`)
      expect(res.status).toBe(200)

      const contentType = res.headers.get('content-type') ?? ''
      expect(contentType).toContain('application/json')

      const body = await res.json()

      expect(body).toEqual({
        id: itemId,
        todo_list_id: listId,
        title: '牛乳を買う（Station11）',
        description: 'スーパーで牛乳を買う（Station11）',
        status_code: 1,
        due_at: '2026-01-10T06:30:13.196Z',
        created_at: expect.any(String),
        updated_at: expect.any(String),
      })
    } finally {
      // 後片付け（list 削除で item も cascade delete）
      await db.delete(todoLists).where(eq(todoLists.id, listId))
    }
  })

  it('GET /lists/:listId/items/:itemId should return 404 when item is not in the list', async () => {
    // list を2つ作成
    const [listA] = await db
      .insert(todoLists)
      .values({ title: 'Station11 listA', description: 'A' })
      .returning({ id: todoLists.id })
    const [listB] = await db
      .insert(todoLists)
      .values({ title: 'Station11 listB', description: 'B' })
      .returning({ id: todoLists.id })

    const listIdA = listA.id
    const listIdB = listB.id

    // item は listA に作成
    const [item] = await db
      .insert(todoItems)
      .values({
        todoListId: listIdA,
        title: 'Station11 item',
        description: 'Station11 item desc',
        statusCode: 1,
      })
      .returning({ id: todoItems.id })

    const itemId = item.id

    try {
      // listB で取りに行く（所属が違うので 404）
      const res = await app.request(`/lists/${listIdB}/items/${itemId}`)
      expect(res.status).toBe(404)
    } finally {
      await db.delete(todoLists).where(eq(todoLists.id, listIdA))
      await db.delete(todoLists).where(eq(todoLists.id, listIdB))
    }
  })
})
