import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
    const supabase = await createClient();

    // Sign out on the server - this will set the cookies to delete them
    const { error } = await supabase.auth.signOut({ scope: 'global' });

    if (error) {
        console.error('Server-side sign out error:', error);
        return NextResponse.json({ error: 'Failed to sign out' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
