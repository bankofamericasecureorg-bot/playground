import { NextResponse } from 'next/server';
import { emailService } from '@/lib/email';

export async function GET() {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM;

    console.log('--- EMAIL TEST START ---');
    console.log('API Key present:', !!apiKey);
    console.log('From Email:', fromEmail);

    if (!apiKey) {
        return NextResponse.json({ error: 'RESEND_API_KEY is missing' }, { status: 500 });
    }

    // Send to the admin email or a hardcoded one for testing if available, 
    // but for now we'll just try to send to the 'from' email or a placeholder to see if it even connects.
    // Better: Send to a placeholder that we know exists or just returns success/fail from Resend.
    // Actually, sending to 'delivered@resend.dev' is a safe test for Resend usually, 
    // but we want to specifically test the DOMAIN signing.
    
    // Let's use a dummy email that won't bounce hard/hurt reputation but lets us check the API response.
    const testTo = 'delivered@resend.dev'; 

    const result = await emailService.sendEmail({
      to: testTo,
      subject: 'Test Email from Debugger',
      html: '<p>This is a test email to verify Resend configuration.</p>'
    });

    console.log('Resend Response:', JSON.stringify(result, null, 2));
    console.log('--- EMAIL TEST END ---');

    return NextResponse.json({ 
        success: result.success, 
        setup: { hasKey: !!apiKey, from: fromEmail },
        result 
    });

  } catch (error) {
    console.error('Test route error:', error);
    return NextResponse.json({ error: 'Internal error', details: error }, { status: 500 });
  }
}
