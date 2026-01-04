import { NextResponse } from 'next/server';
import { resend, emailTemplates } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

    const template = emailTemplates.welcome(email, name);
    const data = await resend.emails.send(template);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
}