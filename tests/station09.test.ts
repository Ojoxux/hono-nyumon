import { describe, it, expect, afterAll } from 'vitest'
import app from '../src/app.js'

import { client, db } from '../src/db/client.js'
import { todoLists } from '../src/db/schema.js'
import { eq } from 'drizzle-orm'

describe('Station 09 - TODO リスト更新 API を作成しよう', () => {
  afterAll(async () => {
    await client.end()
  })

  it('PUT /lists/:listId should update an existing todo list', async () => {
    // 1. テスト実行前にTODOリストを挿入
    const [inserted] = await db
      .insert(todoLists)
      .values({
        title: 'before title',
        description: 'before description',
      })
      .returning({ id: todoLists.id })

    const listId = inserted?.id
    expect(listId).toBeTypeOf('number')

    try {
      // 2. 実装したAPIを叩いてアップデート
      const res = await app.request(`/lists/${listId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'after title',
          description: 'after description',
        }),
      })

      expect(res.status).toBe(200)

      // (任意) レスポンスも更新されていることを軽く確認
      const resJson = await res.json()
      expect(resJson).toMatchObject({
        id: listId,
        title: 'after title',
        description: 'after description',
      })

      // 3. 挿入したアイテムが更新されていることを確認 (drizzle orm select api)
      const rows = await db.select().from(todoLists).where(eq(todoLists.id, listId))
      expect(rows).toHaveLength(1)
      expect(rows[0].title).toBe('after title')
      expect(rows[0].description ?? '').toBe('after description')
    } finally {
      // 4. 挿入したアイテムの削除 (drizzle orm delete api)
      await db.delete(todoLists).where(eq(todoLists.id, listId))
    }
  })
})
