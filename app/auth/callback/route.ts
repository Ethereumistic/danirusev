import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { getSiteUrl } from '@/lib/utils';


export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');

  if (error) {
    // Redirect to error page with the error description
    return NextResponse.redirect(
      `${getSiteUrl()}/auth-error?error=${error}&description=${error_description}`
    );

  }

  if (code) {
    const supabase = await createClient();

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error('Error exchanging code for session:', error);
      return NextResponse.redirect(`${getSiteUrl()}/auth-error?error=exchange_error`);

    }
  }

  // URL to redirect to after sign in process completes
  const next = requestUrl.searchParams.get('next') ?? '/auth-success';
  return NextResponse.redirect(`${getSiteUrl()}${next}`);
}
