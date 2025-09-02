const { Resend } = require('resend');

// Initialize Resend with API key
const apiKey = process.env.RESEND_API_KEY;
if (!apiKey || apiKey === 're_xxxxxxxxx') {
  console.warn('⚠️  Resend API key not configured properly. Email sending will be simulated.');
}

const resend = new Resend(apiKey);

const emailTemplates = {
  pickupConfirmation: (data) => ({
    subject: 'Pickup Request Confirmed - H&H Donations',
    html: `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" style="background-color: rgb(240, 240, 240);">
      <head>
        <title>Pickup Confirmed</title>
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
          img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; display: block; }
          table { border-collapse: collapse; }
          table td { border-collapse: collapse; display: table-cell; }
          body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

          /* BG COLORS */
          .mainTable { background-color: #F0F0F0; }
          html { background-color: #F0F0F0; }

          /* VARIABLES */
          .bg-white { background-color: white; }
          .hr { background-color: #d3d3d8; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; mso-line-height-rule: exactly; line-height: 1px; }
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
          .h1 { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif; font-weight: 700; vertical-align: middle; font-size: 36px; line-height: 42px; }
          .h2 { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif; font-weight: 600; vertical-align: middle; font-size: 16px; line-height: 24px; }
          .text { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif; font-weight: 400; font-size: 16px; line-height: 21px; }
          .text-list { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif; font-weight: 400; font-size: 16px; line-height: 25px; }
          .textSmall { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif; font-weight: 400; font-size: 14px; }
          .text-xsmall { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif; font-size: 11px; text-transform: uppercase; line-height: 22px; letter-spacing: 1px; }
          .text-bold { font-weight: 600; }
          .text-link { text-decoration: underline; }

          /* FONT COLORS */
          .textColorDark { color: #0a0e27; }
          .textColorNormal { color: #4f4f65; }
          .textColorGreen { color: #14532d; }
          .textColorGrayDark { color: #7B7B8B; }
          .textColorGray { color: #A5A8AD; }
          .textColorWhite { color: #FFFFFF; }

          /* LAYOUT */
          .Content-container { padding-left: 60px; padding-right: 60px; }
          .Content-container--main { padding-top: 54px; padding-bottom: 60px; }
          .Content { width: 580px; margin: 0 auto; }
          .wrapper { max-width: 600px; }
          .section { padding: 24px 0px; border-bottom: 1px solid #d3d3d8; }
          .message { background-color: #f0fdf4; padding: 18px; border-left: 4px solid #14532d; border-radius: 4px; }
          .card { border: 1px solid #d3d3d8; padding: 18px; }

          /* HEADER */
          .header-logoImage { display: block; color: #F0F0F0; }

          /* MOBILE STYLES */
          @media screen and (max-width: 648px) {
            .wrapper { width: 100% !important; max-width: 100% !important; }
            .Content { width: 90% !important; }
            .Content-container { padding-left: 36px !important; padding-right: 36px !important; }
            .Content-container--main { padding-top: 30px !important; padding-bottom: 42px !important; }
          }

          @media screen and (max-width: 480px) {
            .h1 { font-size: 30px !important; line-height: 30px !important; }
            .text { font-size: 16px !important; line-height: 22px !important; }
            .Content { width: 100% !important; }
            .Content-container { padding-left: 18px !important; padding-right: 18px !important; }
            .Content-container--main { padding-top: 24px !important; padding-bottom: 30px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; width: 100%; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif;">
        
        <!-- MAIN TABLE -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" class="mainTable" style="background-color: #F0F0F0;">
          
          <!-- HEADER -->
          <tr>
            <td align="center" class="header">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="Content" style="width: 580px; margin: 0 auto;">
                <tr class="spacer">
                  <td height="24px" colspan="2" style="font-size: 24px; line-height:24px;">&nbsp;</td>
                </tr>
                <tr>
                  <td align="left" valign="middle">
                    <img src="data:image/png;base64,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" width="100" height="auto" alt="H&H Donations" border="0" class="header-logoImage" />
                  </td>
                </tr>
                <tr class="spacer">
                  <td height="24px" colspan="2" style="font-size: 24px; line-height:24px;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- CONTENT -->
          <tr>
            <td align="center">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="Content bg-white" style="background-color: white; width: 580px; margin: 0 auto;">
                <tr>
                  <td class="Content-container Content-container--main text textColorNormal" style="padding: 54px 60px 60px 60px;">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      
                      <!-- INTRO -->
                      <tr>
                        <td valign="top" align="left">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td align="left">
                                <span class="h1 textColorDark" style="font-weight: 700; font-size: 36px; line-height: 42px; color: #0a0e27;">Pickup Confirmed</span>
                              </td>
                            </tr>
                            <tr class="spacer">
                              <td height="18px" style="font-size: 18px; line-height:18px;">&nbsp;</td>
                            </tr>
                            <tr>
                              <td align="left" colspan="2" valign="top" width="100%" height="1" class="hr" style="background-color: #d3d3d8; line-height: 1px;">
                                <!--[if gte mso 15]>&nbsp;<![endif]-->
                              </td>
                            </tr>
                            <tr class="spacer">
                              <td height="18px" style="font-size: 18px; line-height:18px;">&nbsp;</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- MESSAGE -->
                      <tr class="spacer">
                        <td height="12px" style="font-size: 12px; line-height:12px;">&nbsp;</td>
                      </tr>
                      <tr>
                        <td align="left" class="message" valign="top" style="background-color: #f0fdf4; padding: 18px; border-left: 4px solid #14532d; border-radius: 4px;">
                          <div class="text textColorNormal" style="font-size: 16px; line-height: 21px; color: #4f4f65;">
                            <span class="text-bold textColorDark" style="font-weight: 600; color: #0a0e27;">Thank you for scheduling a donation pickup!</span>
                            <br /><br />
                            We're grateful for your contribution to our community. Your donation will help families in need both locally and in underdeveloped countries. Our team will arrive on the scheduled date to collect your items.
                          </div>
                        </td>
                      </tr>
                      <tr class="spacer">
                        <td height="24px" style="font-size: 24px; line-height:24px;">&nbsp;</td>
                      </tr>
                      
                      <!-- PICKUP INFO -->
                      <tr>
                        <td valign="top">
                          <table align="left" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="left" valign="middle" width="468">
                                <div class="text-list textColorNormal" style="font-size: 16px; line-height: 25px; color: #4f4f65;">
                                  <span class="text-bold textColorDark" style="font-weight: 600; color: #0a0e27;">📅 ${new Date(data.pickupDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                  <br />
                                  <span style="color: #14532d;">⏰</span> Pickup window: 8:00 AM - 12:00 PM
                                  <br />
                                  <span style="color: #14532d;">📍</span> ${data.address}
                                  ${data.specialInstructions ? `<br /><span style="color: #14532d;">📝</span> ${data.specialInstructions}` : ''}
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- PREPARATION TIPS -->
                      <tr>
                        <td align="center">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr class="spacer">
                              <td height="30px" style="font-size: 30px; line-height:30px;">&nbsp;</td>
                            </tr>
                            <tr>
                              <td align="left" colspan="2" valign="top" width="100%" height="1" class="hr" style="background-color: #d3d3d8; line-height: 1px;">
                                <!--[if gte mso 15]>&nbsp;<![endif]-->
                              </td>
                            </tr>
                            <tr class="spacer">
                              <td height="30px" style="font-size: 30px; line-height:30px;">&nbsp;</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- WHAT TO EXPECT -->
                      <tr>
                        <td valign="top">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="left">
                                <div class="text text-bold textColorDark" style="font-weight: 600; font-size: 16px; color: #0a0e27;">
                                  What to Expect
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td align="left">
                                <div class="text textColorNormal mt1" style="margin-top: 12px; font-size: 16px; line-height: 24px; color: #4f4f65;">
                                  • Our team will arrive during the scheduled window<br />
                                  • Please have items bagged or boxed and ready<br />
                                  • Place items in a visible, accessible location<br />
                                  • No need to be home - just leave items outside
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr class="spacer">
                        <td height="24px" style="font-size: 24px; line-height:24px;">&nbsp;</td>
                      </tr>
                      
                      <!-- CANCELLATION POLICY -->
                      <tr>
                        <td valign="top">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="left">
                                <div class="textSmall text-bold textColorDark" style="font-weight: 600; font-size: 14px; color: #0a0e27;">
                                  Need to Reschedule?
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td align="left">
                                <div class="textSmall textColorNormal mt1" style="margin-top: 6px; font-size: 14px; line-height: 20px; color: #4f4f65;">
                                  <span>You can cancel your pickup request up to 24 hours before the scheduled time. </span>
                                  <span>To reschedule, please email us at info@hhdonations.com.</span>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <tr class="spacer">
                        <td height="24px" style="font-size: 24px; line-height:24px;">&nbsp;</td>
                      </tr>
                      
                      <!-- QUESTIONS -->
                      <tr>
                        <td valign="top">
                          <table border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td align="left">
                                <div class="textSmall text-bold textColorDark" style="font-weight: 600; font-size: 14px; color: #0a0e27;">
                                  Questions?
                                </div>
                              </td>
                            </tr>
                            <tr>
                              <td align="left">
                                <div class="textSmall textColorNormal mt1" style="margin-top: 6px; font-size: 14px; line-height: 20px; color: #4f4f65;">
                                  If you have any questions about your pickup, please contact us at&nbsp;
                                  <a href="mailto:info@hhdonations.com" class="textSmall text-link textColorGreen" style="font-size: 14px; text-decoration: underline; color: #14532d;">info@hhdonations.com</a>.
                                </div>
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
                                <img src="data:image/png;base64,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" width="40" height="auto" alt="H&H Donations" border="0" />
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
                        <td height="30px" style="font-size: 30px; line-height:30px;">&nbsp;</td>
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
  }),

  pickupReminder: (data) => ({
    subject: `Reminder: Donation Pickup Tomorrow - H&H Donations`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #0a0e27;
              margin: 0;
              padding: 0;
              background-color: #f3f4f6;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #14532d 0%, #166534 100%);
              color: white; 
              padding: 32px 20px;
              text-align: center;
            }
            .logo {
              width: 150px;
              height: auto;
              margin-bottom: 16px;
            }
            .content { 
              padding: 32px 24px;
              background-color: white;
            }
            .info-box { 
              background-color: #f0fdf4;
              padding: 20px;
              margin: 24px 0;
              border-left: 4px solid #14532d;
              border-radius: 4px;
            }
            .footer { 
              text-align: center;
              padding: 24px;
              color: #6b7280;
              font-size: 14px;
              background-color: #f9fafb;
              border-top: 1px solid #e5e7eb;
            }
            .highlight { 
              background-color: #fef3c7;
              padding: 16px;
              border-radius: 6px;
              margin: 20px 0;
              border: 1px solid #fbbf24;
            }
            h1 { margin: 0; font-size: 28px; font-weight: 600; }
            h3 { color: #14532d; margin-bottom: 12px; }
            p { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="data:image/png;base64,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" alt="H&H Donations" class="logo" />
              <h1>Pickup Reminder</h1>
            </div>
            <div class="content">
              <p>Dear ${data.name},</p>
              <p>This is a friendly reminder that your donation pickup is scheduled for <strong>tomorrow</strong>.</p>
              
              <div class="info-box">
                <h3>Pickup Details:</h3>
                <p><strong>Date:</strong> ${new Date(data.pickupDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Items:</strong> ${data.items}</p>
                <p><strong>Address:</strong> ${data.address}</p>
                ${data.specialInstructions ? `<p><strong>Special Instructions:</strong> ${data.specialInstructions}</p>` : ''}
              </div>
              
              <div class="highlight">
                <strong>Please remember to:</strong>
                <ul>
                  <li>Have your donation items ready for pickup</li>
                  <li>Place items in a visible and accessible location</li>
                  <li>Ensure someone is available if signature is required</li>
                </ul>
              </div>
              
              <p>If you need to reschedule or cancel, please contact us as soon as possible.</p>
              
              <div class="footer">
                <p><strong>Thank you for your donation!</strong></p>
                <p>H&H Donations Team</p>
                <p style="font-size: 12px; margin-top: 16px;">This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }),

  pickupCompleted: (data) => ({
    subject: 'Pickup Completed - Thank You! - H&H Donations',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6; 
              color: #0a0e27;
              margin: 0;
              padding: 0;
              background-color: #f3f4f6;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background-color: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
            }
            .header { 
              background: linear-gradient(135deg, #14532d 0%, #166534 100%);
              color: white; 
              padding: 32px 20px;
              text-align: center;
            }
            .logo {
              width: 150px;
              height: auto;
              margin-bottom: 16px;
            }
            .content { 
              padding: 32px 24px;
              background-color: white;
            }
            .thank-you { 
              background-color: #dcfce7;
              padding: 24px;
              border-radius: 8px;
              margin: 24px 0;
              text-align: center;
              border: 2px solid #22c55e;
            }
            .footer { 
              text-align: center;
              padding: 24px;
              color: #6b7280;
              font-size: 14px;
              background-color: #f9fafb;
              border-top: 1px solid #e5e7eb;
            }
            h1 { margin: 0; font-size: 28px; font-weight: 600; }
            h2 { color: #14532d; }
            p { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="data:image/png;base64,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" alt="H&H Donations" class="logo" />
              <h1>Thank You for Your Donation!</h1>
            </div>
            <div class="content">
              <p>Dear ${data.name},</p>
              
              <div class="thank-you">
                <h2>Your pickup has been completed successfully!</h2>
                <p>Your generous donation will make a real difference in our community.</p>
              </div>
              
              <p>We have successfully collected your donation items on ${new Date(data.pickupDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.</p>
              
              <p>Your contribution helps us continue our mission of supporting those in need. Every donation, no matter the size, has a meaningful impact.</p>
              
              <p>If you have any questions or would like to schedule another pickup in the future, please don't hesitate to contact us.</p>
              
              <div class="footer">
                <p><strong>With gratitude,</strong></p>
                <p>H&H Donations Team</p>
                <p style="font-size: 12px; margin-top: 16px;">This is an automated message, please do not reply to this email.</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  })
};

async function sendEmail(to, template, data) {
  try {
    const emailContent = emailTemplates[template](data);
    
    // Check if API key is configured
    if (!apiKey || apiKey === 're_xxxxxxxxx') {
      // Simulation mode - just log the email
      console.log('📧 SIMULATED EMAIL:');
      console.log('To:', to);
      console.log('Subject:', emailContent.subject);
      console.log('Template:', template);
      console.log('Data:', data);
      return { 
        success: true, 
        simulated: true,
        data: { 
          id: 'simulated_' + Date.now(),
          to,
          subject: emailContent.subject 
        } 
      };
    }
    
    const response = await resend.emails.send({
      from: 'HH Donations <onboarding@resend.dev>', // Using Resend's test domain for now
      to: to,
      subject: emailContent.subject,
      html: emailContent.html
    });

    console.log('Email sent successfully:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
}

async function sendPickupConfirmation(pickupRequest) {
  return sendEmail(pickupRequest.email, 'pickupConfirmation', pickupRequest);
}

async function sendPickupReminder(pickupRequest) {
  return sendEmail(pickupRequest.email, 'pickupReminder', pickupRequest);
}

async function sendPickupCompleted(pickupRequest) {
  return sendEmail(pickupRequest.email, 'pickupCompleted', pickupRequest);
}

module.exports = {
  sendEmail,
  sendPickupConfirmation,
  sendPickupReminder,
  sendPickupCompleted
};