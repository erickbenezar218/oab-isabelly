import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL ?? 'postgresql://simulaordem:simulaordem@localhost:5432/simulaordem',
})

export async function initDb() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
}
