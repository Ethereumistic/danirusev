/**
 * Reset Payload Schema
 * This script drops all Payload-related tables to allow a clean migration
 * USE WITH CAUTION: This will delete all data in Payload collections
 */

import { Pool } from 'pg'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({
    path: path.resolve(__dirname, '../.env.local'),
})

async function resetPayloadSchema() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URI,
        ssl: {
            rejectUnauthorized: false,
        },
    })

    try {
        console.log('🔄 Resetting Payload schema...\n')

        // Drop all Payload tables
        const dropTablesQuery = `
      DROP TABLE IF EXISTS 
        payload_locked_documents,
        payload_locked_documents_rels,
        payload_preferences,
        payload_preferences_rels,
        payload_migrations,
        users,
        users_rels,
        media,
        products,
        products_rels,
        products_gallery,
        products_option_definitions,
        products_option_definitions_values,
        products_variants,
        products_tech_specs,
        products_visuals,
        products_program,
        products_included,
        products_not_included,
        products_additional_items,
        categories,
        categories_rels,
        experiences,
        experiences_rels,
        experiences_detailed_info_what_you_get,
        experiences_detailed_info_process,
        experiences_detailed_info_locations,
        experiences_detailed_info_requirements,
        collections,
        collections_rels,
        collections_conditions,
        collections_conditions_rules
      CASCADE;
    `

        await pool.query(dropTablesQuery)
        console.log('✅ All Payload tables dropped successfully')

        // Drop Payload-related enums
        const dropEnumsQuery = `
      DROP TYPE IF EXISTS
        enum_products_product_type,
        enum_products_gallery_type,
        enum_products_visuals_icon_name,
        enum_products_visuals_theme_color,
        enum_products_visuals_pattern,
        enum_products_additional_items_type,
        enum_collections_conditions_match_type,
        enum_collections_conditions_rules_field,
        enum_collections_conditions_rules_operator
      CASCADE;
    `

        await pool.query(dropEnumsQuery)
        console.log('✅ All Payload enums dropped successfully')

        console.log('\n✨ Schema reset complete! You can now restart your dev server.\n')
        console.log('📝 Next steps:')
        console.log('   1. Restart your dev server: pnpm dev')
        console.log('   2. Visit /admin to create your first admin user')
        console.log('   3. Payload will automatically create all new tables\n')
    } catch (error) {
        console.error('❌ Error resetting schema:', error)
        throw error
    } finally {
        await pool.end()
    }
}

resetPayloadSchema()
