// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { s3Storage } from '@payloadcms/storage-s3'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { Categories } from './collections/Categories'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Log environment variables (without sensitive values)
console.log('Environment check:');
console.log('- S3_BUCKET set:', Boolean(process.env.S3_BUCKET));
console.log('- S3_REGION set:', Boolean(process.env.S3_REGION));
console.log('- S3_ENDPOINT set:', Boolean(process.env.S3_ENDPOINT));
console.log('- S3_ACCESS_KEY_ID set:', Boolean(process.env.S3_ACCESS_KEY_ID));
console.log('- S3_SECRET_ACCESS_KEY set:', Boolean(process.env.S3_SECRET_ACCESS_KEY));
console.log('- SERVER_URL:', process.env.NEXT_PUBLIC_SERVER_URL);

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '- E-Commerce Admin',
    },
  },
  collections: [Users, Media, Products, Categories],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      max: 3,
      ssl: {
        rejectUnauthorized: false
      }
    },
    // payload: {
    //   schema: 'payload', // Correct way to specify the schema
    // }
  }),
  plugins: [
    s3Storage({
      collections: {
        media: {
          prefix: 'media',
        }
      },
      bucket: process.env.S3_BUCKET || '',
      config: {
        forcePathStyle: true, // Important for using Supabase
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
        },
        region: process.env.S3_REGION || '',
        endpoint: process.env.S3_ENDPOINT || '',
      },
    }),
  ],
  upload: {
    limits: {
      fileSize: 5000000, // 5MB, written in bytes
    },
  },
  // Configure sharp for image processing
  sharp,
})
