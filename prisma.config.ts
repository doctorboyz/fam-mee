import { defineConfig } from '@prisma/config'
import fs from 'fs'
import path from 'path'

function loadEnv() {
  const envFiles = ['.env', '.env.local'];
  
  envFiles.forEach(file => {
    try {
      const envPath = path.resolve(__dirname, file)
      if (fs.existsSync(envPath)) {
        const env = fs.readFileSync(envPath, 'utf-8')
        env.split('\n').forEach(line => {
          const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/)
          if (match) {
            const key = match[1]
            let value = match[2] || ''
            if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
              value = value.slice(1, -1)
            }
            // Override existing keys (so .env.local wins over .env)
            process.env[key] = value
          }
        })
      }
    } catch (e) {
      console.error(`Failed to load ${file}`, e)
    }
  });
}

loadEnv()



export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
})
