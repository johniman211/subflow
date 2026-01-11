import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchantId, referenceCode, amount, currency, customerPhone, productName, priceName } = body;

    if (!merchantId || !referenceCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Get merchant details
    const { data: merchant, error: merchantError } = await supabase
      .from('users')
      .select('email, full_name, business_name')
      .eq('id', merchantId)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json({ error: 'Merchant not found' }, { status: 404 });
    }

    // Build email content
    const emailSubject = `💰 New Payment: ${referenceCode} - ${formatCurrency(amount, currency)}`;
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/payments`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .highlight { background: #FEF3C7; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
          .details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .details p { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">New Payment Received!</h1>
          </div>
          <div class="content">
            <p>Hi ${merchant.full_name || merchant.business_name || 'there'},</p>
            
            <p>A customer has submitted a payment and is waiting for your confirmation.</p>
            
            <div class="highlight">
              <strong>Reference Code:</strong> <span style="font-family: monospace; font-size: 18px;">${referenceCode}</span>
            </div>
            
            <div class="details">
              <p><strong>Product:</strong> ${productName}</p>
              <p><strong>Plan:</strong> ${priceName}</p>
              <p><strong>Amount:</strong> ${formatCurrency(amount, currency)}</p>
              <p><strong>Customer Phone:</strong> ${customerPhone}</p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Check your MTN MoMo for payment with reference code <strong>${referenceCode}</strong></li>
              <li>Click the button below to confirm the payment</li>
            </ol>
            
            <center>
              <a href="${dashboardUrl}" class="button">Confirm Payment →</a>
            </center>
          </div>
          <div class="footer">
            <p>Losetify - Subscription Management Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Resend (or log for now if no API key)
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (resendApiKey) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Losetify <notifications@resend.dev>',
          to: [merchant.email],
          subject: emailSubject,
          html: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        console.error('Resend error:', errorData);
        return NextResponse.json({ error: 'Failed to send email', details: errorData }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Email sent successfully' });
    } else {
      // No Resend API key - log the notification
      console.log('📧 Email notification (no RESEND_API_KEY configured):');
      console.log(`   To: ${merchant.email}`);
      console.log(`   Subject: ${emailSubject}`);
      console.log(`   Reference: ${referenceCode}`);
      console.log(`   Amount: ${formatCurrency(amount, currency)}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Email logged (configure RESEND_API_KEY to send actual emails)',
        logged: { to: merchant.email, subject: emailSubject }
      });
    }
  } catch (error: any) {
    console.error('Notify merchant error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
