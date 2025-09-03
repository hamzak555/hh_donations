// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// Try multiple possible environment variable names
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY_HH_FORM') || 
                       Deno.env.get('RESEND_API_KEY')

const RECAPTCHA_SECRET_KEY = '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe' // Google's test secret key

console.log('Environment check - API key exists:', !!RESEND_API_KEY)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Check if API key is available
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not configured')
      return new Response(
        JSON.stringify({ error: 'Email service not configured. Please contact support.' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const { name, email, phone, subject, message, recaptchaToken } = await req.json()

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!recaptchaToken) {
      return new Response(
        JSON.stringify({ error: 'reCAPTCHA verification is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Skip reCAPTCHA verification for bypass tokens (temporary for testing)
    let skipRecaptcha = false;
    if (recaptchaToken.startsWith('bypass-token-') || recaptchaToken.startsWith('test-token-')) {
      console.log('Bypassing reCAPTCHA verification for test token');
      skipRecaptcha = true;
    }

    if (!skipRecaptcha) {
      // Verify reCAPTCHA token
      console.log('Verifying reCAPTCHA token...')
      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `secret=${RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`
    })

      const recaptchaData = await recaptchaResponse.json()
      console.log('reCAPTCHA verification response:', recaptchaData)

      if (!recaptchaData.success) {
        console.error('reCAPTCHA verification failed:', recaptchaData)
        return new Response(
          JSON.stringify({ error: 'reCAPTCHA verification failed', details: recaptchaData }),
          { 
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }
    }

    console.log('Processing contact form submission from:', email)

    // Format timestamp
    const timestamp = new Date().toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    // Email HTML template - matching the professional pickup confirmation design
    const nameFirst = name.split(' ')[0] || name
    
    const emailHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" style="background-color: rgb(240, 240, 240);">

<head>
  <!-- Preheader text -->
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    New contact message from ${name}${subject ? ': ' + subject : ''}
  </div>
  <title>New Contact Message</title>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <style type="text/css">
    /* FONTS */
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    /* CLIENT-SPECIFIC RESET */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }
    .im { color: inherit !important; }

    /* DEVICE-SPECIFIC RESET */
    a[x-apple-data-detectors] {
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

    /* RESET */
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      display: block;
    }
    table { border-collapse: collapse; }
    table td { border-collapse: collapse; display: table-cell; }
    body {
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
    }

    /* BG COLORS */
    .mainTable { background-color: #F0F0F0; }
    html { background-color: #F0F0F0; }

    /* VARIABLES */
    .bg-white { background-color: white; }
    .hr {
      background-color: #14532d;
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
      mso-line-height-rule: exactly;
      line-height: 1px;
    }
    .textAlignLeft { text-align: left !important; }
    .textAlignRight { text-align: right !important; }
    .textAlignCenter { text-align: center !important; }
    .mt1 { margin-top: 6px; }

    /* TYPOGRAPHY */
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif;
      font-weight: 400;
      color: #4f4f65;
      -webkit-font-smoothing: antialiased;
      -ms-text-size-adjust: 100%;
      -moz-osx-font-smoothing: grayscale;
      font-smoothing: always;
      text-rendering: optimizeLegibility;
    }
    .h1 {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif;
      font-weight: 700;
      vertical-align: middle;
      font-size: 36px;
      line-height: 42px;
    }
    .h2 {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif;
      font-weight: 600;
      vertical-align: middle;
      font-size: 16px;
      line-height: 24px;
    }
    .text {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif;
      font-weight: 400;
      font-size: 16px;
      line-height: 21px;
    }
    .textSmall {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif;
      font-weight: 400;
      font-size: 14px;
    }
    .text-xsmall {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif;
      font-size: 11px;
      text-transform: uppercase;
      line-height: 22px;
      letter-spacing: 1px;
    }
    .text-bold { font-weight: 600; }
    .text-link { text-decoration: underline; }

    /* FONT COLORS */
    .textColorDark { color: #0a0e27; }
    .textColorNormal { color: #4f4f65; }
    .textColorGreen { color: #14532d; }
    .textColorGrayDark { color: #7B7B8B; }
    .textColorGray { color: #A5A8AD; }
    .textColorWhite { color: #FFFFFF; }

    /* BUTTON */
    .Button-primary-wrapper {
      border-radius: 6px;
      background: linear-gradient(135deg, #14532d 0%, #166534 100%);
    }
    .Button-primary {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif;
      border-radius: 6px;
      border: 1px solid #14532d;
      color: #ffffff;
      display: block;
      font-size: 16px;
      font-weight: 600;
      padding: 18px;
      text-decoration: none;
    }
    .Button-secondary-wrapper {
      border-radius: 6px;
      background-color: #ffffff;
    }
    .Button-secondary {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif;
      border-radius: 6px;
      border: 1px solid #14532d;
      color: #14532d;
      display: block;
      font-size: 16px;
      font-weight: 600;
      padding: 18px;
      text-decoration: none;
    }

    /* LAYOUT */
    .Content-container {
      padding-left: 60px;
      padding-right: 60px;
    }
    .Content-container--main {
      padding-top: 54px;
      padding-bottom: 60px;
    }
    .Content {
      width: 580px;
      margin: 0 auto;
    }
    .wrapper { max-width: 600px; }
    .section {
      padding: 24px 0px;
      border-bottom: 1px solid #d3d3d8;
    }
    .message {
      background-color: #f0fdf4;
      padding: 18px;
      border-left: 4px solid #14532d;
      border-radius: 4px;
    }
    .message-content {
      background-color: #fef3c7;
      padding: 18px;
      border-radius: 4px;
    }
    .card {
      border: 1px solid #d3d3d8;
      padding: 18px;
    }

    /* HEADER */
    .header-logoImage {
      display: block;
      color: #F0F0F0;
    }

    /* MOBILE STYLES */
    @media screen and (max-width: 648px) {
      .wrapper { width: 100% !important; max-width: 100% !important; }
      .Content { width: 90% !important; }
      .Content-container {
        padding-left: 36px !important;
        padding-right: 36px !important;
      }
      .Content-container--main {
        padding-top: 30px !important;
        padding-bottom: 42px !important;
      }
    }

    @media screen and (max-width: 480px) {
      .h1 { font-size: 30px !important; line-height: 30px !important; }
      .text { font-size: 16px !important; line-height: 22px !important; }
      .Content { width: 100% !important; }
      .Content-container {
        padding-left: 18px !important;
        padding-right: 18px !important;
      }
      .Content-container--main {
        padding-top: 24px !important;
        padding-bottom: 30px !important;
      }
    }
  </style>
</head>

<body style="margin: 0; padding: 0; width: 100%; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif;">
  
  <!-- MAIN TABLE -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mainTable" style="background-color: #F0F0F0;">
    
    <!-- SPACER ABOVE CONTENT -->
    <tr>
      <td align="center" style="padding: 40px 0;">
        <!-- CONTENT WITH ROUNDED CORNERS -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="Content bg-white" style="background-color: white; width: 580px; margin: 0 auto; border-radius: 12px; overflow: hidden;">
          <tr>
            <td class="Content-container Content-container--main text textColorNormal" style="padding: 36px 60px 36px 60px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                
                <!-- LOGO AND TITLE SECTION -->
                <tr>
                  <td valign="top" align="left">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="left" valign="middle">
                          <img src="https://raw.githubusercontent.com/hamzak555/hh_donations/main/public/images/HH%20Logo%20Green.png" width="100" height="auto" alt="H&H Donations" border="0" />
                        </td>
                        <td align="right" valign="middle">
                          <!-- Empty cell - removed Visit Website link -->
                        </td>
                      </tr>
                      <tr class="spacer">
                        <td height="24px" style="font-size: 24px; line-height:24px;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td align="left">
                          <span class="h1 textColorDark" style="font-weight: 700; font-size: 28px; line-height: 34px; color: #0a0e27;">New Contact Message</span>
                        </td>
                      </tr>
                      <tr class="spacer">
                        <td height="18px" style="font-size: 18px; line-height:18px;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- SPACER -->
                <tr class="spacer">
                  <td height="24px" style="font-size: 24px; line-height:24px;">&nbsp;</td>
                </tr>
                
                <!-- CONTACT INFO -->
                <tr>
                  <td valign="top">
                    <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="left" valign="middle" width="468">
                          <div class="textSmall textColorNormal" style="font-size: 14px; line-height: 20px; color: #4f4f65;">
                            <span class="text-bold textColorDark" style="font-weight: 600; color: #0a0e27;"><span style="display: inline-block; width: 20px;">👤</span> ${name}</span>
                            <br />
                            <span style="color: #14532d; display: inline-block; width: 20px;">📧</span> <a href="mailto:${email}" style="color: #14532d; text-decoration: underline;">${email}</a>
                            <br />
                            ${phone ? `<span style="color: #14532d; display: inline-block; width: 20px;">📞</span> ${phone}<br />` : ''}
                            <span style="color: #14532d; display: inline-block; width: 20px;">🕐</span> ${timestamp}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- MESSAGE CONTENT -->
                <tr>
                  <td align="center">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr class="spacer">
                        <td height="30px" style="font-size: 30px; line-height:30px;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td align="left" colspan="2" valign="top" width="100%" height="1" class="hr" style="background-color: #14532d; line-height: 1px;">
                          <!--[if gte mso 15]>&nbsp;<![endif]-->
                        </td>
                      </tr>
                      <tr class="spacer">
                        <td height="30px" style="font-size: 30px; line-height:30px;">&nbsp;</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- MESSAGE CONTENT -->
                <tr>
                  <td valign="top">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="left">
                          <div class="textSmall text-bold textColorDark" style="font-weight: 600; font-size: 14px; color: #0a0e27;">
                            Message Content
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td align="left" class="message" style="background-color: #f0fdf4; padding: 18px; border-left: 4px solid #14532d; border-radius: 4px; margin-top: 12px;">
                          ${subject ? `<div class="textSmall text-bold textColorDark" style="font-weight: 600; font-size: 14px; color: #0a0e27; margin-bottom: 12px;">Subject: ${subject}</div>` : ''}
                          <div class="textSmall textColorNormal" style="font-size: 14px; line-height: 22px; color: #4f4f65; white-space: pre-wrap;">${message}</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- FOOTER INSIDE CONTENT -->
                <tr class="spacer">
                  <td height="30px" style="font-size: 30px; line-height:30px;">&nbsp;</td>
                </tr>
                <tr>
                  <td align="left" colspan="2" valign="top" width="100%" height="1" class="hr" style="background-color: #d3d3d8; line-height: 1px;">
                    <!--[if gte mso 15]>&nbsp;<![endif]-->
                  </td>
                </tr>
                <tr class="spacer">
                  <td height="24px" style="font-size: 24px; line-height:24px;">&nbsp;</td>
                </tr>
                <tr>
                  <td>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="left" valign="middle">
                          <img src="https://raw.githubusercontent.com/hamzak555/hh_donations/main/public/images/HH%20Logo%20Green.png" width="40" height="auto" alt="H&H Donations" border="0" />
                        </td>
                        <td align="right" valign="middle">
                          <div class="text-xsmall textColorNormal" style="font-size: 11px; text-transform: uppercase; line-height: 22px; letter-spacing: 1px; color: #7B7B8B;">
                            © 2025 H&H Donations
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr class="spacer">
                  <td height="0px" style="font-size: 0px; line-height:0px;">&nbsp;</td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

</body>
</html>
    `

    // Send email using Resend to info@hhdonations.com
    console.log('Sending email via Resend API...')
    
    const emailPayload = {
      from: 'noreply@hhdonations.com', // Using verified domain
      to: 'info@hhdonations.com',
      reply_to: email, // Allow direct reply to the person who submitted the form
      subject: subject ? `Contact Form: ${subject}` : `Contact Form Submission from ${name}`,
      html: emailHtml,
    }
    
    console.log('Email payload (without HTML):', { ...emailPayload, html: '[HTML content]' })
    
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(emailPayload),
    })

    const data = await res.json()
    console.log('Resend API response:', { status: res.status, data })

    if (!res.ok) {
      console.error('Resend API error:', data)
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: data }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Contact form email sent successfully', data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error in send-contact-email function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})