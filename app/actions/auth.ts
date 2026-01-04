'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { resend, emailTemplates } from '@/lib/resend'
import { User } from '@supabase/supabase-js'

export async function sendCustomConfirmationEmail(email: string, password: string, name: string, redirectTo?: string) {
    try {
        const supabase = createAdminClient()

        // Check if user exists first to avoid duplicates
        const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
        if (listError) throw listError

        const existingUser = (users as User[]).find(u => u.email === email)

        if (existingUser && existingUser.email_confirmed_at) {
            return { success: false, error: 'User already exists and is confirmed.' }
        }

        // Generate signup link (this creates/updates the user)
        // We pass the password here as required by GenerateSignupLinkParams
        const { data, error } = await supabase.auth.admin.generateLink({
            type: 'signup',
            email,
            password,
            options: {
                data: { name, role: 'customer' },
                redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            },
        })

        if (error) throw error

        const confirmationUrl = data.properties.action_link

        // Send email via Resend
        const template = emailTemplates.confirmEmail(email, confirmationUrl)
        await resend.emails.send(template)

        return { success: true }
    } catch (error) {
        console.error('Error sending custom confirmation email:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}

export async function sendCustomPasswordResetEmail(email: string, redirectTo?: string) {
    try {
        const supabase = createAdminClient()

        // Generate recovery link
        const { data, error } = await supabase.auth.admin.generateLink({
            type: 'recovery',
            email,
            options: {
                redirectTo: redirectTo || `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
            },
        })

        if (error) throw error

        const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token_hash=${data.properties.hashed_token}`

        // Send email via Resend
        const template = emailTemplates.resetPassword(email, resetUrl)
        await resend.emails.send(template)

        return { success: true }
    } catch (error) {
        console.error('Error sending custom password reset email:', error)
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
}
