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

export default helloRoute
