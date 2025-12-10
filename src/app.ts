import { Hono } from 'hono'
import helloRoute from './routes/hello.js'

const app = new Hono()

app.route('/', helloRoute)

export default app
