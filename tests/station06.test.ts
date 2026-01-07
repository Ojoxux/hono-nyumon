import { describe, it, expect } from 'vitest'
import { client, db } from '../src/db/client.js'
import { sql, inArray } from 'drizzle-orm'
import { todoItems, todoLists } from '../src/db/schema.js'

type TableRow = { table_name: string }

describe('Station 06 - TODO アプリの作成を始めよう', () => {
  it('Database should have todo_lists and todo_items tables', async () => {
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

  it('Database should be seeded like seed.ts (lists/items exist without raw SQL)', async () => {
    // seed.ts で作られるリスト2件が存在するか
    const lists = await db
      .select({
        id: todoLists.id,
        title: todoLists.title,
      })
      .from(todoLists)
      .where(inArray(todoLists.title, ['最初のTodoリスト', '仕事用Todoリスト']))

    expect(lists.map((l) => l.title)).toEqual(
      expect.arrayContaining(['最初のTodoリスト', '仕事用Todoリスト'])
    )

    const firstList = lists.find((l) => l.title === '最初のTodoリスト')
    const workList = lists.find((l) => l.title === '仕事用Todoリスト')

    expect(firstList).toBeDefined()
    expect(workList).toBeDefined()

    // seed.ts で作られるアイテム3件が存在し、紐づき/ステータスが合うか
    const items = await db
      .select({
        todoListId: todoItems.todoListId,
        title: todoItems.title,
        statusCode: todoItems.statusCode,
        dueAt: todoItems.dueAt,
      })
      .from(todoItems)
      .where(
        inArray(todoItems.title, [
          '未完了のTodoアイテム',
          '期限ありのTodoアイテム',
          '完了済みのTodoアイテム',
        ])
      )

    expect(items.map((i) => i.title)).toEqual(
      expect.arrayContaining([
        '未完了のTodoアイテム',
        '期限ありのTodoアイテム',
        '完了済みのTodoアイテム',
      ])
    )

    const incomplete = items.find((i) => i.title === '未完了のTodoアイテム')
    const due = items.find((i) => i.title === '期限ありのTodoアイテム')
    const done = items.find((i) => i.title === '完了済みのTodoアイテム')

    expect(incomplete?.statusCode).toBe(1)
    expect(incomplete?.todoListId).toBe(firstList!.id)

    expect(due?.statusCode).toBe(1)
    expect(due?.todoListId).toBe(firstList!.id)
    // dueAt は seed.ts で「今から7日後」なので、値が入っていることだけ確認
    expect(due?.dueAt).toBeTruthy()

    expect(done?.statusCode).toBe(2)
    expect(done?.todoListId).toBe(workList!.id)
  })

  afterAll(async () => {
    await client.end()
  })
})
