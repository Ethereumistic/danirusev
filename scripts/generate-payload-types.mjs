/**
 * Generate Payload Types with proper environment loading
 */
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Load environment variables BEFORE running payload
dotenv.config({
    path: path.resolve(dirname, '../.env.local'),
})

console.log('🔧 Generating Payload types with environment loaded...\n')

// Run payload using tsx with the config file
try {
    execSync(
        'npx tsx ./node_modules/payload/dist/bin/index.js generate:types',
        {
            stdio: 'inherit',
            cwd: path.resolve(dirname, '..'),
            env: {
                ...process.env,
                PAYLOAD_CONFIG_PATH: path.resolve(dirname, '../payload.config.ts'),
            },
        }
    )
    console.log('\n✅ Payload types generated successfully!')
} catch (error) {
    console.error('\n❌ Error generating types')
    process.exit(1)
}
