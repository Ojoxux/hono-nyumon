import { Hono } from 'hono'
import { db } from '../db/client.js'
import { todoLists } from '../db/schema.js'
import { PgColumn } from 'drizzle-orm/pg-core'
import { eq } from 'drizzle-orm'

const helloRoute = new Hono()

helloRoute.get('/hello', (c) => {
  return c.json({ Message: 'Hello Hono!' })
})

helloRoute.get('/echo', (c) => {
  const { message, name } = c.req.query()
  return c.json({ Message: `${message} ${name}!!!` })
})

helloRoute.get('/health', (c) => {
  return c.json({ status: `ok` })
})

// Todoリストを取得するAPI
helloRoute.get('/lists/:listId', async (c) => {
  // http://api.example.com/lists/:listId の :listIdの部分をURLから取得する
  // パスパラメータという
  const listId = Number(c.req.param('listId'))

  // select * from todoLists where id = **
  // SQLで書くとこんな感じになる
  const todoList = await db.query.todoLists.findFirst({
    where: (todoLists, { eq }) => eq(todoLists.id, listId),
  })

  // todoListが空なら渡されたlistIdのリストはないということなので、not foundを返す
  // バリデーションですな
  if (!todoList) {
    return c.json({ error: 'Todo list not found' }, 404)
  }

  return c.json({
    id: todoList.id,
    title: todoList.title,
    description: todoList.description,
    created_at: todoList.createdAt,
    updated_at: todoList.updatedAt,
  })
})

type NewTodoList = {
  title: string
  description: string
}

helloRoute.post('/lists', async (c) => {
  // リクエストコンテキストから欲しい情報をとる
  // この場合だと、titleとdescription
  const { title, description } = await c.req.json<NewTodoList>()

  // insertAPIでデータを1件登録する
  // INSERT INTO todoLists (title, description) VALUES ("aaa": title, "bbb": description);
  const insertedRows = await db.insert(todoLists).values({ title, description }).returning()

  // 1件だけ登録する想定なので、配列の長さが1であることを見る
  if (insertedRows.length !== 1) {
    return c.json({ error: 'Failed to create todo list' }, 500)
  }
  const inserted = insertedRows[0]

  return c.json({
    id: inserted.id,
    title: inserted.title,
    description: inserted.description,
    created_at: inserted.createdAt,
    updated_at: inserted.updatedAt,
  })
})

type UpdateTodoList = {
  title?: string
  description?: string
}

helloRoute.patch('/lists/:listId', async (c) => {
  const listId = Number(c.req.param('listId'))
  const { title, description } = await c.req.json<UpdateTodoList>()

  // SQLで書くと
  // UPDATE todoLists SET title = $title, description = $description where id = $1
  const updatedRows = await db
    .update(todoLists)
    .set({ title, description })
    .where(eq(todoLists.id, listId))
    .returning()

  if (updatedRows.length === 0) {
    return c.json({ error: 'Todo list not found' }, 500)
  }

  if (updatedRows.length !== 1) {
    return c.json({ error: 'Failed to update todo list' }, 500)
  }

  const updated = updatedRows[0]

  return c.json({
    id: updated.id,
    title: updated.title,
    description: updated.description,
    created_at: updated.createdAt,
    updated_at: updated.updatedAt,
  })
})

export default helloRoute
