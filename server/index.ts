import { createApp } from './app.js'
import { connectDB } from './database/connectDB.js'
import { migrateJsonSessions } from './database/migrateJsonSessions.js'
import { MongoSessionStore } from './sessionStore.js'

const port = Number(process.env.PORT ?? 3000)
const mongoUrl = process.env.MONGODB_URL

if (!mongoUrl) throw new Error('MONGODB_URL is missing in .env.local.')

try {
  await connectDB(mongoUrl)
  await migrateJsonSessions(new MongoSessionStore())

  createApp().listen(port, () => {
    console.log(`FocusAmbient API running on http://localhost:${port}`)
  })
} catch (error) {
  console.error('FocusAmbient API could not start.', error)
  process.exitCode = 1
}
