/**
 * Generate Payload Types using Next.js API
 * This script uses Payload's API to generate types without module resolution issues
 */

import { getPayloadHMR } from '@payloadcms/next/utilities'
import configPromise from '../payload.config'

async function generateTypes() {
    try {
        console.log('🔧 Generating Payload types...\n')

        const payload = await getPayloadHMR({
            config: configPromise,
        })

        console.log('✅ Payload types generated successfully!')
        console.log('📝 Types written to: payload-types.ts\n')

        process.exit(0)
    } catch (error) {
        console.error('❌ Error generating types:', error)
        process.exit(1)
    }
}

generateTypes()
