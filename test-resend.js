// Test Resend API directly
const RESEND_API_KEY = 're_jatUr2tn_KpGR5nfeu9ZDaogETxsspihS';

async function testResendAPI() {
  console.log('Testing Resend API...');
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'noreply@hhdonations.com',
        to: 'info@hhdonations.com',
        subject: 'Test Email from HH Donations Contact Form',
        html: '<h1>Test Email</h1><p>This is a test email to verify the Resend API is working correctly.</p><p>If you receive this, the API key and configuration are correct.</p>',
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Success! Email sent:', data);
    } else {
      console.log('❌ Failed to send email:', data);
      console.log('Status:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testResendAPI();