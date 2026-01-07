import { describe, it, expect } from 'vitest'
import { client, db } from '../src/db/client.js'
import { sql } from 'drizzle-orm'

type TableRow = { table_name: string }

describe('Station 06 - TODO アプリの作成を始めよう', () => {
  it('todo_lists / todo_items が存在する', async () => {
    // public スキーマの通常テーブル一覧を取得
    const rows = await db.execute<TableRow>(sql`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
        and table_type = 'BASE TABLE'
    `)

    const tableNames = rows.map((r) => r.table_name)

    expect(tableNames).toEqual(expect.arrayContaining(['todo_lists', 'todo_items']))
  })

  afterAll(async () => {
    await client.end()
  })
})
