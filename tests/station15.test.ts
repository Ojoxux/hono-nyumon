import { afterAll, describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { eq } from 'drizzle-orm'
import app from '../src/app.js'
import { client, db } from '../src/db/client.js'
import { todoItems, todoLists } from '../src/db/schema.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectDir = path.resolve(__dirname, '..')

type TodoListResponse = {
  id: number
  title: string
  description: string
}

type TodoItemResponse = {
  id: number
  todo_list_id: number
  title: string
  description: string
  status_code: number
  due_at: string
}

const readJson = async <T>(response: Response) => (await response.json()) as T

describe('Station 15 - TODO API を feature ごとにリファクタしよう', () => {
  afterAll(async () => {
    await client.end()
  })

  it('should split the app into feature route files', () => {
    const requiredFiles = [
      'src/features/hello/route.ts',
      'src/features/health/route.ts',
      'src/features/todo-lists/route.ts',
      'src/features/todo-items/route.ts',
    ]

    for (const requiredFile of requiredFiles) {
      expect(existsSync(path.join(projectDir, requiredFile))).toBe(true)
    }

    const appSource = readFileSync(path.join(projectDir, 'src/app.ts'), 'utf8')
    expect(appSource).toContain("./features/hello/route.js")
    expect(appSource).toContain("./features/health/route.js")
    expect(appSource).toContain("./features/todo-lists/route.js")
    expect(appSource).toContain("./features/todo-items/route.js")
  })

  it('should keep hello, echo, and health endpoints working', async () => {
    const helloRes = await app.request('/hello')
    expect(helloRes.status).toBe(200)
    expect(await helloRes.json()).toEqual({ Message: 'Hello Hono!' })

    const echoRes = await app.request('/echo?message=Hi&name=TechTrain')
    expect(echoRes.status).toBe(200)
    expect(await echoRes.json()).toEqual({ Message: 'Hi TechTrain!!!' })

    const healthRes = await app.request('/health')
    expect(healthRes.status).toBe(200)
    expect(await healthRes.json()).toEqual({ status: 'ok' })
  })

  it('should keep todo list endpoints working after the refactor', async () => {
    let listId: number | undefined

    try {
      const createRes = await app.request('/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Station15 list',
          description: 'Station15 description',
        }),
      })

      expect(createRes.status).toBe(200)
      const created = await readJson<TodoListResponse>(createRes)
      listId = created.id

      expect(created).toMatchObject({
        title: 'Station15 list',
        description: 'Station15 description',
      })

      const getRes = await app.request(`/lists/${listId}`)
      expect(getRes.status).toBe(200)

      const fetched = await readJson<TodoListResponse>(getRes)
      expect(fetched).toMatchObject({
        id: listId,
        title: 'Station15 list',
        description: 'Station15 description',
      })

      const patchRes = await app.request(`/lists/${listId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Station15 list updated',
        }),
      })

      expect(patchRes.status).toBe(200)
      expect(await patchRes.json()).toMatchObject({
        id: listId,
        title: 'Station15 list updated',
        description: 'Station15 description',
      })

      const deleteRes = await app.request(`/lists/${listId}`, {
        method: 'DELETE',
      })

      expect(deleteRes.status).toBe(200)
      expect(await deleteRes.json()).toEqual({})
      listId = undefined
    } finally {
      if (listId !== undefined) {
        await db.delete(todoLists).where(eq(todoLists.id, listId))
      }
    }
  })

  it('should keep todo item endpoints working after the refactor', async () => {
    const [list] = await db
      .insert(todoLists)
      .values({
        title: 'Station15 item list',
        description: 'Station15 item list description',
      })
      .returning({ id: todoLists.id })

    const listId = list.id
    let itemId: number | undefined

    try {
      const createRes = await app.request(`/lists/${listId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Station15 item',
          description: 'Station15 item description',
          due_at: '2026-01-10T06:30:13.196Z',
        }),
      })

      expect(createRes.status).toBe(200)
      const created = await readJson<TodoItemResponse>(createRes)
      itemId = created.id

      expect(created).toMatchObject({
        todo_list_id: listId,
        title: 'Station15 item',
        description: 'Station15 item description',
        status_code: 1,
        due_at: '2026-01-10T06:30:13.196Z',
      })

      const getRes = await app.request(`/lists/${listId}/items/${itemId}`)
      expect(getRes.status).toBe(200)
      expect(await getRes.json()).toMatchObject({
        id: itemId,
        todo_list_id: listId,
        title: 'Station15 item',
        status_code: 1,
      })

      const patchRes = await app.request(`/lists/${listId}/items/${itemId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Station15 item updated',
          complete: true,
        }),
      })

      expect(patchRes.status).toBe(200)
      expect(await patchRes.json()).toMatchObject({
        id: itemId,
        todo_list_id: listId,
        title: 'Station15 item updated',
        status_code: 2,
      })

      const deleteRes = await app.request(`/lists/${listId}/items/${itemId}`, {
        method: 'DELETE',
      })

      expect(deleteRes.status).toBe(200)
      expect(await deleteRes.json()).toEqual({})
      itemId = undefined
    } finally {
      if (itemId !== undefined) {
        await db.delete(todoItems).where(eq(todoItems.id, itemId))
      }

      await db.delete(todoLists).where(eq(todoLists.id, listId))
    }
  })
})
