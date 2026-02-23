import { describe, it, expect, afterAll } from 'vitest'
import app from '../src/app.js'

import { client, db } from '../src/db/client.js'
import { todoLists } from '../src/db/schema.js'
import { eq } from 'drizzle-orm'

describe('Station 10 - TODO リスト削除 API を作成しよう', () => {
  afterAll(async () => {
    await client.end()
  })

  it('DELETE /lists/:listId should delete an existing todo list', async () => {
    // 1. テスト実行前にTODOリストを挿入
    const [inserted] = await db
      .insert(todoLists)
      .values({
        title: 'to be deleted',
        description: 'to be deleted description',
      })
      .returning({ id: todoLists.id })

    const listId = inserted?.id
    expect(listId).toBeTypeOf('number')

    try {
      // 2. 実装したAPIを叩いて削除
      const res = await app.request(`/lists/${listId}`, {
        method: 'DELETE',
      })

      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toEqual({})

      // 3. 削除されていることを確認
      const rows = await db.select().from(todoLists).where(eq(todoLists.id, listId))
      expect(rows).toHaveLength(0)
    } finally {
      // 4. 念のため後始末（すでに消えていてもOK）
      await db.delete(todoLists).where(eq(todoLists.id, listId))
    }
  })
})
