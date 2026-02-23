import { describe, it, expect, afterAll } from 'vitest'
import app from '../src/app.js'

import { client, db } from '../src/db/client.js'
import { todoItems, todoLists } from '../src/db/schema.js'
import { eq } from 'drizzle-orm'

describe('Station 14 - TODO 項目削除 API を作成しよう', () => {
  afterAll(async () => {
    await client.end()
  })

  it('DELETE /lists/:listId/items/:itemId should delete an existing todo item', async () => {
    // 1) list 作成
    const [list] = await db
      .insert(todoLists)
      .values({
        title: 'テスト用Todoリスト（Station14）',
        description: 'Station14 のテスト用リスト',
      })
      .returning({ id: todoLists.id })

    const listId = list.id

    // 2) item 作成
    const [item] = await db
      .insert(todoItems)
      .values({
        todoListId: listId,
        title: 'to be deleted（Station14）',
        description: 'to be deleted description（Station14）',
        statusCode: 1,
      })
      .returning({ id: todoItems.id })

    const itemId = item.id

    try {
      // 3) 削除 API
      const res = await app.request(`/lists/${listId}/items/${itemId}`, {
        method: 'DELETE',
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({})

      // 4) DB から消えていること
      const rows = await db.select().from(todoItems).where(eq(todoItems.id, itemId))
      expect(rows).toHaveLength(0)
    } finally {
      // 後片付け（list 削除で残骸があっても消える）
      await db.delete(todoLists).where(eq(todoLists.id, listId))
    }
  })

  it('DELETE /lists/:listId/items/:itemId should return 404 when item is not in the list', async () => {
    // list を2つ作る
    const [listA] = await db
      .insert(todoLists)
      .values({ title: 'Station14 listA', description: 'A' })
      .returning({ id: todoLists.id })
    const [listB] = await db
      .insert(todoLists)
      .values({ title: 'Station14 listB', description: 'B' })
      .returning({ id: todoLists.id })

    const listIdA = listA.id
    const listIdB = listB.id

    // item は listA に作る
    const [item] = await db
      .insert(todoItems)
      .values({
        todoListId: listIdA,
        title: 'Station14 item',
        description: 'Station14 item desc',
        statusCode: 1,
      })
      .returning({ id: todoItems.id })

    const itemId = item.id

    try {
      // listB 側で削除しようとする（所属が違うので 404）
      const res = await app.request(`/lists/${listIdB}/items/${itemId}`, {
        method: 'DELETE',
      })
      expect(res.status).toBe(404)

      // 本来の item は残っている
      const rows = await db.select().from(todoItems).where(eq(todoItems.id, itemId))
      expect(rows).toHaveLength(1)
    } finally {
      await db.delete(todoLists).where(eq(todoLists.id, listIdA))
      await db.delete(todoLists).where(eq(todoLists.id, listIdB))
    }
  })
})
