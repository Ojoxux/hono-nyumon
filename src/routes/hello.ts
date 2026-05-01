import { Hono } from 'hono'
import { db } from '../db/client.js'
import { todoLists } from '../db/schema.js'

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

export default helloRoute
